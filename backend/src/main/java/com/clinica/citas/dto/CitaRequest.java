package com.clinica.citas.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class CitaRequest {
    @NotNull
    private Long pacienteId;
    @NotNull
    private Long medicoId;
    @NotNull
    private LocalDate fecha;
    @NotNull
    private LocalTime horaInicio;
    private String motivo;
}
