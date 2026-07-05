package com.clinica.citas.repository;

import com.clinica.citas.model.Cita;
import com.clinica.citas.model.EstadoCita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface CitaRepository extends JpaRepository<Cita, Long> {
    List<Cita> findByPacienteIdOrderByFechaDescHoraInicioDesc(Long pacienteId);
    List<Cita> findByMedicoIdAndFecha(Long medicoId, LocalDate fecha);
    List<Cita> findByMedicoIdAndFechaAndEstadoNot(Long medicoId, LocalDate fecha, EstadoCita estado);
    List<Cita> findByEstado(EstadoCita estado);
    long countByFechaBetween(LocalDate desde, LocalDate hasta);

    @Query("SELECT c.estado, COUNT(c) FROM Cita c WHERE c.fecha BETWEEN :desde AND :hasta GROUP BY c.estado")
    List<Object[]> contarPorEstadoEntre(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query("SELECT c.medico.especialidad.nombre, COUNT(c) FROM Cita c WHERE c.fecha BETWEEN :desde AND :hasta GROUP BY c.medico.especialidad.nombre")
    List<Object[]> contarPorEspecialidadEntre(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);
}
