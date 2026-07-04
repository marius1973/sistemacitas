package com.clinica.citas.controller;

import com.clinica.citas.dto.MedicoResponse;
import com.clinica.citas.service.MedicoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicos")
@RequiredArgsConstructor
public class MedicoController {

    private final MedicoService medicoService;

    @GetMapping
    public ResponseEntity<List<MedicoResponse>> listar(@RequestParam(required = false) Long especialidadId) {
        if (especialidadId != null) {
            return ResponseEntity.ok(medicoService.listarPorEspecialidad(especialidadId));
        }
        return ResponseEntity.ok(medicoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicoResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(medicoService.obtenerPorId(id));
    }
}
