package com.clinica.citas.service;

import com.clinica.citas.dto.DisponibilidadResponse;
import com.clinica.citas.dto.HorarioRequest;
import com.clinica.citas.dto.HorarioResponse;
import com.clinica.citas.exception.AccesoDenegadoException;
import com.clinica.citas.exception.ConflictoDeHorarioException;
import com.clinica.citas.exception.RecursoNoEncontradoException;
import com.clinica.citas.model.*;
import com.clinica.citas.repository.CitaRepository;
import com.clinica.citas.repository.HorarioRepository;
import com.clinica.citas.repository.MedicoRepository;
import com.clinica.citas.security.SecurityContextHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HorarioService {

    private final HorarioRepository horarioRepository;
    private final CitaRepository citaRepository;
    private final MedicoRepository medicoRepository;
    private final SecurityContextHelper securityContextHelper;

    public HorarioResponse crear(HorarioRequest req) {
        verificarGestionHorarios(req.getMedicoId());

        if (!req.getHoraFin().isAfter(req.getHoraInicio())) {
            throw new ConflictoDeHorarioException("La hora de fin debe ser posterior a la hora de inicio");
        }

        Medico medico = medicoRepository.findById(req.getMedicoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Medico no encontrado: " + req.getMedicoId()));

        Horario horario = new Horario();
        horario.setMedico(medico);
        horario.setDiaSemana(req.getDiaSemana());
        horario.setHoraInicio(req.getHoraInicio());
        horario.setHoraFin(req.getHoraFin());
        horario.setDuracionCitaMinutos(req.getDuracionCitaMinutos() != null ? req.getDuracionCitaMinutos() : 30);
        horario.setActivo(true);

        return mapearRespuesta(horarioRepository.save(horario));
    }

    public List<HorarioResponse> listarPorMedico(Long medicoId) {
        verificarConsultaHorarios(medicoId);
        return horarioRepository.findByMedicoId(medicoId).stream().map(this::mapearRespuesta).toList();
    }

    public HorarioResponse cambiarEstado(Long horarioId, boolean activo) {
        Horario horario = horarioRepository.findById(horarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Horario no encontrado: " + horarioId));
        verificarGestionHorarios(horario.getMedico().getId());
        horario.setActivo(activo);
        return mapearRespuesta(horarioRepository.save(horario));
    }

    public List<DisponibilidadResponse> calcularDisponibilidad(Long medicoId, LocalDate fecha) {
        return calcularDisponibilidad(medicoId, fecha, null);
    }

    public DisponibilidadResponse validarSlotDisponible(Long medicoId, LocalDate fecha,
                                                         LocalTime horaInicio, Long citaExcluidaId) {
        List<DisponibilidadResponse> bloques = calcularDisponibilidad(medicoId, fecha, citaExcluidaId);

        DisponibilidadResponse bloque = bloques.stream()
                .filter(b -> b.getHoraInicio().equals(horaInicio))
                .findFirst()
                .orElseThrow(() -> new ConflictoDeHorarioException(
                        "El horario solicitado no esta dentro de la agenda del medico"));

        if (!bloque.isDisponible()) {
            throw new ConflictoDeHorarioException("El horario solicitado ya no esta disponible");
        }

        return bloque;
    }

    private List<DisponibilidadResponse> calcularDisponibilidad(Long medicoId, LocalDate fecha, Long citaExcluidaId) {
        List<Horario> horarios = horarioRepository
                .findByMedicoIdAndDiaSemanaAndActivoTrue(medicoId, fecha.getDayOfWeek());

        List<Cita> citasDelDia = citaRepository
                .findByMedicoIdAndFechaAndEstadoNot(medicoId, fecha, EstadoCita.CANCELADA)
                .stream()
                .filter(c -> citaExcluidaId == null || !c.getId().equals(citaExcluidaId))
                .toList();

        List<DisponibilidadResponse> disponibilidad = new ArrayList<>();

        for (Horario horario : horarios) {
            LocalTime cursor = horario.getHoraInicio();
            while (cursor.plusMinutes(horario.getDuracionCitaMinutos()).compareTo(horario.getHoraFin()) <= 0) {
                LocalTime finBloque = cursor.plusMinutes(horario.getDuracionCitaMinutos());
                LocalTime bloqueInicio = cursor;
                boolean ocupado = citasDelDia.stream().anyMatch(c ->
                        !c.getHoraInicio().isAfter(bloqueInicio) && c.getHoraFin().isAfter(bloqueInicio));
                disponibilidad.add(new DisponibilidadResponse(bloqueInicio, finBloque, !ocupado));
                cursor = finBloque;
            }
        }
        return disponibilidad;
    }

    private void verificarGestionHorarios(Long medicoId) {
        Usuario actual = securityContextHelper.obtenerUsuarioActual();
        switch (actual.getRol()) {
            case ADMINISTRADOR, RECEPCIONISTA -> { /* acceso total */ }
            case MEDICO -> {
                if (medicoId != null && !actual.getId().equals(medicoId)) {
                    throw new AccesoDenegadoException("Solo puede gestionar sus propios horarios");
                }
            }
            default -> throw new AccesoDenegadoException("No tiene permiso para gestionar horarios");
        }
    }

    private void verificarConsultaHorarios(Long medicoId) {
        Usuario actual = securityContextHelper.obtenerUsuarioActual();
        switch (actual.getRol()) {
            case ADMINISTRADOR, RECEPCIONISTA -> { /* acceso total */ }
            case MEDICO -> {
                if (!actual.getId().equals(medicoId)) {
                    throw new AccesoDenegadoException("No tiene permiso para ver horarios de otro medico");
                }
            }
            case PACIENTE -> { /* permitido para reservar via otros endpoints */ }
            default -> throw new AccesoDenegadoException("No tiene permiso para consultar horarios");
        }
    }

    private HorarioResponse mapearRespuesta(Horario h) {
        return new HorarioResponse(
                h.getId(),
                h.getMedico().getId(),
                h.getDiaSemana(),
                h.getHoraInicio(),
                h.getHoraFin(),
                h.getDuracionCitaMinutos(),
                h.isActivo()
        );
    }
}
