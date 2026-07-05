package com.clinica.citas.controller;

import com.clinica.citas.dto.DisponibilidadResponse;
import com.clinica.citas.dto.HorarioRequest;
import com.clinica.citas.dto.HorarioResponse;
import com.clinica.citas.service.HorarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/horarios")
@RequiredArgsConstructor
public class HorarioController {

    private final HorarioService horarioService;

    @PostMapping
    public ResponseEntity<HorarioResponse> crear(@Valid @RequestBody HorarioRequest req) {
        return ResponseEntity.ok(horarioService.crear(req));
    }

    @GetMapping("/medico/{medicoId}")
    public ResponseEntity<List<HorarioResponse>> listarPorMedico(@PathVariable Long medicoId) {
        return ResponseEntity.ok(horarioService.listarPorMedico(medicoId));
    }

    @PatchMapping("/{id}/activar")
    public ResponseEntity<HorarioResponse> activar(@PathVariable Long id) {
        return ResponseEntity.ok(horarioService.cambiarEstado(id, true));
    }

    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<HorarioResponse> desactivar(@PathVariable Long id) {
        return ResponseEntity.ok(horarioService.cambiarEstado(id, false));
    }

    @GetMapping("/medico/{medicoId}/disponibilidad")
    public ResponseEntity<List<DisponibilidadResponse>> disponibilidad(
            @PathVariable Long medicoId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(horarioService.calcularDisponibilidad(medicoId, fecha));
    }
}
