package com.clinica.citas.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EspecialidadRequest {
    @NotBlank
    private String nombre;
    private String descripcion;
}
