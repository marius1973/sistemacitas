package com.clinica.citas.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class ReprogramarCitaRequest {
    @NotNull
    private LocalDate fecha;
    @NotNull
    private LocalTime horaInicio;
}
