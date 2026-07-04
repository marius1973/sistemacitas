package com.clinica.citas.service;

import com.clinica.citas.exception.ConflictoDeHorarioException;
import com.clinica.citas.dto.DisponibilidadResponse;
import com.clinica.citas.dto.HorarioResponse;
import com.clinica.citas.model.Cita;
import com.clinica.citas.model.EstadoCita;
import com.clinica.citas.model.Horario;
import com.clinica.citas.repository.CitaRepository;
import com.clinica.citas.repository.HorarioRepository;
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

    public HorarioResponse crear(Horario horario) {
        return mapearRespuesta(horarioRepository.save(horario));
    }

    public List<HorarioResponse> listarPorMedico(Long medicoId) {
        return horarioRepository.findByMedicoId(medicoId).stream().map(this::mapearRespuesta).toList();
    }

    /**
     * Calcula los bloques de disponibilidad de un medico para una fecha dada,
     * marcando como no disponibles los que ya tienen una cita activa.
     */
    public List<DisponibilidadResponse> calcularDisponibilidad(Long medicoId, LocalDate fecha) {
        return calcularDisponibilidad(medicoId, fecha, null);
    }

    /**
     * Valida que el slot solicitado exista en la agenda del medico y este libre.
     * @param citaExcluidaId cita a ignorar al calcular ocupacion (util al reprogramar)
     */
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
