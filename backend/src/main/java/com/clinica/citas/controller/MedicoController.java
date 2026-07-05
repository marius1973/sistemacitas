package com.clinica.citas.controller;

import com.clinica.citas.dto.MedicoRequest;
import com.clinica.citas.dto.MedicoResponse;
import com.clinica.citas.service.MedicoService;
import jakarta.validation.Valid;
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

    @PostMapping
    public ResponseEntity<MedicoResponse> crear(@Valid @RequestBody MedicoRequest req) {
        return ResponseEntity.ok(medicoService.crear(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicoResponse> actualizar(@PathVariable Long id, @Valid @RequestBody MedicoRequest req) {
        return ResponseEntity.ok(medicoService.actualizar(id, req));
    }

    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<MedicoResponse> desactivar(@PathVariable Long id) {
        return ResponseEntity.ok(medicoService.desactivar(id));
    }

    @PatchMapping("/{id}/activar")
    public ResponseEntity<MedicoResponse> activar(@PathVariable Long id) {
        return ResponseEntity.ok(medicoService.activar(id));
    }
}
