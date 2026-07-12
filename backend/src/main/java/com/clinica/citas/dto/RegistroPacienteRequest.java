package com.clinica.citas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class RegistroPacienteRequest {
    @NotBlank
    private String nombre;
    @NotBlank
    private String apellido;
    @Email
    @NotBlank
    private String email;
    @NotBlank
    private String password;
    private String telefono;
    private String numeroDocumento;
    private LocalDate fechaNacimiento;
    private String genero;
    private String direccion;
}
