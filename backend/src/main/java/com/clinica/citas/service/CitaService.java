package com.clinica.citas.service;

import com.clinica.citas.dto.CitaRequest;
import com.clinica.citas.dto.CitaResponse;
import com.clinica.citas.dto.DisponibilidadResponse;
import com.clinica.citas.exception.RecursoNoEncontradoException;
import com.clinica.citas.model.*;
import com.clinica.citas.exception.AccesoDenegadoException;
import com.clinica.citas.repository.CitaRepository;
import com.clinica.citas.repository.MedicoRepository;
import com.clinica.citas.repository.PacienteRepository;
import com.clinica.citas.security.SecurityContextHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CitaService {

    private final CitaRepository citaRepository;
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;
    private final HorarioService horarioService;
    private final NotificacionService notificacionService;
    private final SecurityContextHelper securityContextHelper;

    public CitaResponse reservar(CitaRequest req) {
        verificarReserva(req);
        Paciente paciente = pacienteRepository.findById(req.getPacienteId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado: " + req.getPacienteId()));
        Medico medico = medicoRepository.findById(req.getMedicoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Medico no encontrado: " + req.getMedicoId()));

        DisponibilidadResponse slot = horarioService.validarSlotDisponible(
                medico.getId(), req.getFecha(), req.getHoraInicio(), null);

        Cita cita = new Cita();
        cita.setPaciente(paciente);
        cita.setMedico(medico);
        cita.setFecha(req.getFecha());
        cita.setHoraInicio(slot.getHoraInicio());
        cita.setHoraFin(slot.getHoraFin());
        cita.setMotivo(req.getMotivo());
        cita.setEstado(EstadoCita.PENDIENTE);

        Cita guardada = citaRepository.save(cita);

        notificacionService.crear(paciente, TipoNotificacion.CONFIRMACION_CITA,
                "Su cita con " + medico.getNombre() + " " + medico.getApellido() +
                        " el " + req.getFecha() + " a las " + req.getHoraInicio() + " ha sido registrada.",
                CanalNotificacion.EMAIL);

        return mapearRespuesta(guardada);
    }

    public CitaResponse cancelar(Long citaId) {
        Cita cita = obtenerEntidad(citaId);
        verificarCancelacion(cita);
        cita.setEstado(EstadoCita.CANCELADA);
        Cita actualizada = citaRepository.save(cita);
        notificacionService.crear(cita.getPaciente(), TipoNotificacion.CANCELACION_CITA,
                "Su cita del " + cita.getFecha() + " ha sido cancelada.", CanalNotificacion.EMAIL);
        return mapearRespuesta(actualizada);
    }

    public CitaResponse reprogramar(Long citaId, CitaRequest req) {
        Cita cita = obtenerEntidad(citaId);
        verificarReprogramacion(cita, req);

        DisponibilidadResponse slot = horarioService.validarSlotDisponible(
                cita.getMedico().getId(), req.getFecha(), req.getHoraInicio(), citaId);

        cita.setFecha(req.getFecha());
        cita.setHoraInicio(slot.getHoraInicio());
        cita.setHoraFin(slot.getHoraFin());
        cita.setEstado(EstadoCita.REPROGRAMADA);
        Cita actualizada = citaRepository.save(cita);
        notificacionService.crear(cita.getPaciente(), TipoNotificacion.REPROGRAMACION_CITA,
                "Su cita fue reprogramada para el " + req.getFecha() + " a las " + req.getHoraInicio() + ".",
                CanalNotificacion.EMAIL);
        return mapearRespuesta(actualizada);
    }

    public List<CitaResponse> listarMisCitas() {
        Usuario actual = securityContextHelper.obtenerUsuarioActual();
        if (actual.getRol() != Rol.PACIENTE) {
            throw new AccesoDenegadoException("Este endpoint es solo para pacientes");
        }
        return listarCitasDePaciente(actual.getId());
    }

    public List<CitaResponse> listarPorPaciente(Long pacienteId) {
        Usuario actual = securityContextHelper.obtenerUsuarioActual();
        if (actual.getRol() == Rol.PACIENTE) {
            throw new AccesoDenegadoException("Los pacientes deben usar /api/citas/mis-citas");
        }
        return listarCitasDePaciente(pacienteId);
    }

    public List<CitaResponse> listarAgendaDelMedico(Long medicoId, LocalDate fecha) {
        verificarAccesoMedicoAgenda(medicoId);
        return citaRepository.findByMedicoIdAndFecha(medicoId, fecha)
                .stream().map(this::mapearRespuesta).toList();
    }

    private Cita obtenerEntidad(Long citaId) {
        return citaRepository.findById(citaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cita no encontrada: " + citaId));
    }

    private void verificarReserva(CitaRequest req) {
        Usuario actual = securityContextHelper.obtenerUsuarioActual();
        if (actual.getRol() == Rol.PACIENTE && !actual.getId().equals(req.getPacienteId())) {
            throw new AccesoDenegadoException("Solo puede reservar citas para su propia cuenta");
        }
        if (actual.getRol() == Rol.MEDICO) {
            throw new AccesoDenegadoException("Los medicos no pueden reservar citas");
        }
    }

    private List<CitaResponse> listarCitasDePaciente(Long pacienteId) {
        return citaRepository.findByPacienteIdOrderByFechaDescHoraInicioDesc(pacienteId)
                .stream().map(this::mapearRespuesta).toList();
    }

    private void verificarAccesoMedicoAgenda(Long medicoId) {
        Usuario actual = securityContextHelper.obtenerUsuarioActual();
        if (actual.getRol() == Rol.PACIENTE) {
            throw new AccesoDenegadoException("No tiene permiso para ver agendas de medicos");
        }
        if (actual.getRol() == Rol.MEDICO && !actual.getId().equals(medicoId)) {
            throw new AccesoDenegadoException("No tiene permiso para ver la agenda de otro medico");
        }
    }

    private void verificarCancelacion(Cita cita) {
        Usuario actual = securityContextHelper.obtenerUsuarioActual();
        switch (actual.getRol()) {
            case PACIENTE -> {
                if (!actual.getId().equals(cita.getPaciente().getId())) {
                    throw new AccesoDenegadoException("No puede cancelar citas de otro paciente");
                }
            }
            case MEDICO -> {
                if (!actual.getId().equals(cita.getMedico().getId())) {
                    throw new AccesoDenegadoException("No puede cancelar citas de la agenda de otro medico");
                }
            }
            case RECEPCIONISTA, ADMINISTRADOR -> { /* acceso total */ }
        }
    }

    private void verificarReprogramacion(Cita cita, CitaRequest req) {
        Usuario actual = securityContextHelper.obtenerUsuarioActual();
        switch (actual.getRol()) {
            case PACIENTE -> {
                if (!actual.getId().equals(cita.getPaciente().getId())) {
                    throw new AccesoDenegadoException("No puede reprogramar citas de otro paciente");
                }
                if (req.getPacienteId() != null && !actual.getId().equals(req.getPacienteId())) {
                    throw new AccesoDenegadoException("No puede asignar la cita a otro paciente");
                }
            }
            case MEDICO -> throw new AccesoDenegadoException("Los medicos no pueden reprogramar citas");
            case RECEPCIONISTA, ADMINISTRADOR -> { /* acceso total */ }
        }
    }

    private CitaResponse mapearRespuesta(Cita c) {
        return new CitaResponse(
                c.getId(),
                c.getPaciente().getId(),
                c.getPaciente().getNombre() + " " + c.getPaciente().getApellido(),
                c.getMedico().getId(),
                c.getMedico().getNombre() + " " + c.getMedico().getApellido(),
                c.getMedico().getEspecialidad().getNombre(),
                c.getFecha(),
                c.getHoraInicio(),
                c.getHoraFin(),
                c.getEstado(),
                c.getMotivo()
        );
    }
}
