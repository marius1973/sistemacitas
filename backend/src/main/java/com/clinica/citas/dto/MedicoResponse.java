package com.clinica.citas.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MedicoResponse {
    private Long id;
    private String nombre;
    private String apellido;
    private String email;
    private String telefono;
    private String numeroColegiado;
    private Long especialidadId;
    private String especialidadNombre;
    private String biografia;
}
