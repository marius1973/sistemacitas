package com.clinica.citas.controller;

import com.clinica.citas.dto.AuthResponse;
import com.clinica.citas.dto.LoginRequest;
import com.clinica.citas.dto.RegistroPacienteRequest;
import com.clinica.citas.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/registro")
    public ResponseEntity<AuthResponse> registrar(@Valid @RequestBody RegistroPacienteRequest req) {
        return ResponseEntity.ok(authService.registrarPaciente(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }
}
