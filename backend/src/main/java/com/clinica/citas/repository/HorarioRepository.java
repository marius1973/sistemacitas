package com.clinica.citas.repository;

import com.clinica.citas.model.Horario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.DayOfWeek;
import java.util.List;

public interface HorarioRepository extends JpaRepository<Horario, Long> {
    List<Horario> findByMedicoIdAndDiaSemanaAndActivoTrue(Long medicoId, DayOfWeek diaSemana);
    List<Horario> findByMedicoId(Long medicoId);
}
