package com.clinica.citas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MedicoRequest {
    @NotBlank
    private String nombre;
    @NotBlank
    private String apellido;
    @NotBlank
    @Email
    private String email;
    @Size(min = 6)
    private String password;
    private String telefono;
    @NotBlank
    private String numeroColegiado;
    @NotNull
    private Long especialidadId;
    private String biografia;
}
