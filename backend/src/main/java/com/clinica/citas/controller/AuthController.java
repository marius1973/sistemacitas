package com.clinica.citas.controller;

import com.clinica.citas.dto.*;
import com.clinica.citas.service.AuthService;
import com.clinica.citas.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/registro")
    public ResponseEntity<AuthResponse> registrar(@Valid @RequestBody RegistroPacienteRequest req) {
        return ResponseEntity.ok(authService.registrarPaciente(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/recuperar-contrasena")
    public ResponseEntity<MensajeResponse> recuperarContrasena(@Valid @RequestBody SolicitarRecuperacionRequest req) {
        return ResponseEntity.ok(passwordResetService.solicitarRecuperacion(req));
    }

    @PostMapping("/restablecer-contrasena")
    public ResponseEntity<MensajeResponse> restablecerContrasena(@Valid @RequestBody RestablecerContrasenaRequest req) {
        return ResponseEntity.ok(passwordResetService.restablecerContrasena(req));
    }

    @PostMapping("/registro-staff")
    public ResponseEntity<MensajeResponse> registrarStaff(@Valid @RequestBody RegistroStaffRequest req) {
        return ResponseEntity.ok(authService.registrarStaff(req));
    }
}
