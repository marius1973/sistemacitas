package com.clinica.citas.repository;

import com.clinica.citas.model.HistorialClinico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistorialClinicoRepository extends JpaRepository<HistorialClinico, Long> {
    List<HistorialClinico> findByPacienteIdOrderByFechaDesc(Long pacienteId);
}
