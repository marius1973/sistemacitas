package com.clinica.citas.controller;

import com.clinica.citas.dto.DisponibilidadResponse;
import com.clinica.citas.dto.HorarioResponse;
import com.clinica.citas.model.Horario;
import com.clinica.citas.service.HorarioService;
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
    public ResponseEntity<HorarioResponse> crear(@RequestBody Horario horario) {
        return ResponseEntity.ok(horarioService.crear(horario));
    }

    @GetMapping("/medico/{medicoId}")
    public ResponseEntity<List<HorarioResponse>> listarPorMedico(@PathVariable Long medicoId) {
        return ResponseEntity.ok(horarioService.listarPorMedico(medicoId));
    }

    @GetMapping("/medico/{medicoId}/disponibilidad")
    public ResponseEntity<List<DisponibilidadResponse>> disponibilidad(
            @PathVariable Long medicoId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(horarioService.calcularDisponibilidad(medicoId, fecha));
    }
}
