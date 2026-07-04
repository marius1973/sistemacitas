package com.clinica.citas.repository;

import com.clinica.citas.model.Cita;
import com.clinica.citas.model.EstadoCita;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface CitaRepository extends JpaRepository<Cita, Long> {
    List<Cita> findByPacienteIdOrderByFechaDescHoraInicioDesc(Long pacienteId);
    List<Cita> findByMedicoIdAndFecha(Long medicoId, LocalDate fecha);
    List<Cita> findByMedicoIdAndFechaAndEstadoNot(Long medicoId, LocalDate fecha, EstadoCita estado);
    List<Cita> findByEstado(EstadoCita estado);
}
