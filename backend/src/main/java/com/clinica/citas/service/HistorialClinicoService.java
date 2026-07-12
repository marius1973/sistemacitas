package com.clinica.citas.service;

import com.clinica.citas.dto.HistorialClinicoRequest;
import com.clinica.citas.dto.HistorialClinicoResponse;
import com.clinica.citas.exception.AccesoDenegadoException;
import com.clinica.citas.exception.ConflictoDeHorarioException;
import com.clinica.citas.exception.RecursoNoEncontradoException;
import com.clinica.citas.model.*;
import com.clinica.citas.repository.CitaRepository;
import com.clinica.citas.repository.HistorialClinicoRepository;
import com.clinica.citas.security.SecurityContextHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HistorialClinicoService {

    private final HistorialClinicoRepository historialClinicoRepository;
    private final CitaRepository citaRepository;
    private final SecurityContextHelper securityContextHelper;

    @Transactional
    public HistorialClinicoResponse registrarDesdeCita(Long citaId, HistorialClinicoRequest req) {
        Cita cita = citaRepository.findById(citaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cita no encontrada: " + citaId));

        verificarAccesoAtencion(cita);

        if (cita.getEstado() == EstadoCita.CANCELADA) {
            throw new ConflictoDeHorarioException("No se puede registrar historial de una cita cancelada");
        }
        if (historialClinicoRepository.existsByCitaId(citaId)) {
            throw new ConflictoDeHorarioException("Esta cita ya tiene historial clinico registrado");
        }

        HistorialClinico historial = new HistorialClinico();
        historial.setPaciente(cita.getPaciente());
        historial.setMedico(cita.getMedico());
        historial.setCita(cita);
        historial.setDiagnostico(req.getDiagnostico());
        historial.setTratamiento(req.getTratamiento());
        historial.setNotas(req.getNotas());

        HistorialClinico guardado = historialClinicoRepository.save(historial);

        cita.setEstado(EstadoCita.COMPLETADA);
        citaRepository.save(cita);

        return mapearRespuesta(guardado);
    }

    public List<HistorialClinicoResponse> listarPorPaciente(Long pacienteId) {
        verificarAccesoConsulta(pacienteId);
        return historialClinicoRepository.findByPacienteIdOrderByFechaDesc(pacienteId)
                .stream().map(this::mapearRespuesta).toList();
    }

    private void verificarAccesoAtencion(Cita cita) {
        Usuario actual = securityContextHelper.obtenerUsuarioActual();
        if (actual.getRol() == Rol.MEDICO && !actual.getId().equals(cita.getMedico().getId())) {
            throw new AccesoDenegadoException("Solo puede atender citas de su propia agenda");
        }
        if (actual.getRol() != Rol.MEDICO && actual.getRol() != Rol.ADMINISTRADOR) {
            throw new AccesoDenegadoException("No tiene permiso para registrar historial clinico");
        }
    }

    private void verificarAccesoConsulta(Long pacienteId) {
        Usuario actual = securityContextHelper.obtenerUsuarioActual();
        if (actual.getRol() != Rol.MEDICO && actual.getRol() != Rol.ADMINISTRADOR) {
            throw new AccesoDenegadoException("No tiene permiso para consultar historial clinico");
        }
    }

    private HistorialClinicoResponse mapearRespuesta(HistorialClinico h) {
        return new HistorialClinicoResponse(
                h.getId(),
                h.getCita() != null ? h.getCita().getId() : null,
                h.getPaciente().getId(),
                h.getPaciente().getNombre() + " " + h.getPaciente().getApellido(),
                h.getMedico().getId(),
                h.getMedico().getNombre() + " " + h.getMedico().getApellido(),
                h.getFecha(),
                h.getDiagnostico(),
                h.getTratamiento(),
                h.getNotas()
        );
    }
}
