package com.clinica.citas.dto;

import com.clinica.citas.model.Rol;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegistroStaffRequest {
    @NotBlank
    private String nombre;
    @NotBlank
    private String apellido;
    @NotBlank
    @Email
    private String email;
    @NotBlank
    @Size(min = 6)
    private String password;
    private String telefono;
    @NotNull
    private Rol rol;

    // Solo para MEDICO
    private String numeroColegiado;
    private Long especialidadId;
    private String biografia;
}
