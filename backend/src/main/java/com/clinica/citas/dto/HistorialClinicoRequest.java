package com.clinica.citas.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class HistorialClinicoRequest {
    @NotBlank
    private String diagnostico;
    private String tratamiento;
    private String notas;
}
