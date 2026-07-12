package com.clinica.citas.controller;

import com.clinica.citas.dto.*;
import com.clinica.citas.service.CitaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/citas")
@RequiredArgsConstructor
public class CitaController {

    private final CitaService citaService;

    @PostMapping
    public ResponseEntity<CitaResponse> reservar(@Valid @RequestBody CitaRequest req) {
        return ResponseEntity.ok(citaService.reservar(req));
    }

    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<CitaResponse> cancelar(@PathVariable Long id) {
        return ResponseEntity.ok(citaService.cancelar(id));
    }

    @PatchMapping("/{id}/reprogramar")
    public ResponseEntity<CitaResponse> reprogramar(
            @PathVariable Long id, @Valid @RequestBody ReprogramarCitaRequest req) {
        return ResponseEntity.ok(citaService.reprogramar(id, req));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<CitaResponse> cambiarEstado(
            @PathVariable Long id, @Valid @RequestBody CambiarEstadoRequest req) {
        return ResponseEntity.ok(citaService.cambiarEstado(id, req.getEstado()));
    }

    @GetMapping("/mis-citas")
    public ResponseEntity<List<CitaResponse>> listarMisCitas() {
        return ResponseEntity.ok(citaService.listarMisCitas());
    }

    @GetMapping("/paciente/{pacienteId}")
    public ResponseEntity<List<CitaResponse>> listarPorPaciente(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(citaService.listarPorPaciente(pacienteId));
    }

    @GetMapping("/medico/{medicoId}/agenda")
    public ResponseEntity<List<CitaResponse>> agendaDelMedico(
            @PathVariable Long medicoId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(citaService.listarAgendaDelMedico(medicoId, fecha));
    }
}
