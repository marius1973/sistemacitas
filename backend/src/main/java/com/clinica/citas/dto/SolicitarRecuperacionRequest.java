package com.clinica.citas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SolicitarRecuperacionRequest {
    @NotBlank
    @Email
    private String email;
}
