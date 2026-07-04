package com.clinica.citas.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EspecialidadResponse {
    private Long id;
    private String nombre;
    private String descripcion;
}
