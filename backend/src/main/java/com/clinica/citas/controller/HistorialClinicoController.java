package com.clinica.citas.controller;

import com.clinica.citas.model.HistorialClinico;
import com.clinica.citas.repository.HistorialClinicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/historial")
@RequiredArgsConstructor
public class HistorialClinicoController {

    private final HistorialClinicoRepository historialClinicoRepository;

    @PostMapping
    public ResponseEntity<HistorialClinico> crear(@RequestBody HistorialClinico historial) {
        return ResponseEntity.ok(historialClinicoRepository.save(historial));
    }

    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<List<HistorialClinico>> listarPorPaciente(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(historialClinicoRepository.findByPacienteIdOrderByFechaDesc(pacienteId));
    }
}
