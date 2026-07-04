package com.clinica.citas.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String rol;
    private Long usuarioId;
    private String nombre;
}
