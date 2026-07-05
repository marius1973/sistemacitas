package com.clinica.citas.controller;

import com.clinica.citas.dto.HistorialClinicoRequest;
import com.clinica.citas.dto.HistorialClinicoResponse;
import com.clinica.citas.service.HistorialClinicoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/historial")
@RequiredArgsConstructor
public class HistorialClinicoController {

    private final HistorialClinicoService historialClinicoService;

    @PostMapping("/cita/{citaId}")
    public ResponseEntity<HistorialClinicoResponse> registrarDesdeCita(
            @PathVariable Long citaId,
            @Valid @RequestBody HistorialClinicoRequest req) {
        return ResponseEntity.ok(historialClinicoService.registrarDesdeCita(citaId, req));
    }

    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<List<HistorialClinicoResponse>> listarPorPaciente(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(historialClinicoService.listarPorPaciente(pacienteId));
    }
}
