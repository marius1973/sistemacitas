package com.clinica.citas.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "pacientes")
@Getter
@Setter
@NoArgsConstructor
public class Paciente extends Usuario {

    @Column(name = "numero_documento", unique = true)
    private String numeroDocumento;

    private LocalDate fechaNacimiento;

    private String genero;

    private String direccion;

    @Column(name = "contacto_emergencia")
    private String contactoEmergencia;
}
