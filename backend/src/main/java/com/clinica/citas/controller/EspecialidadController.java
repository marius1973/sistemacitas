package com.clinica.citas.controller;

import com.clinica.citas.dto.EspecialidadResponse;
import com.clinica.citas.model.Especialidad;
import com.clinica.citas.service.EspecialidadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/especialidades")
@RequiredArgsConstructor
public class EspecialidadController {

    private final EspecialidadService especialidadService;

    @GetMapping
    public ResponseEntity<List<EspecialidadResponse>> listar() {
        return ResponseEntity.ok(especialidadService.listarTodas());
    }

    @PostMapping
    public ResponseEntity<EspecialidadResponse> crear(@RequestBody Especialidad especialidad) {
        return ResponseEntity.ok(especialidadService.crear(especialidad));
    }
}
