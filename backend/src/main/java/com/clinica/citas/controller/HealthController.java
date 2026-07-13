package com.clinica.citas.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    /** Marcador para verificar que Render desplego el backend actualizado. */
    public static final String BUILD_MARKER = "allow-dup-email-2026-07-12";

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "build", BUILD_MARKER,
                "emailUniqueCheck", "disabled"
        ));
    }
}
