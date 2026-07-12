package com.clinica.citas.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Getter
@Setter
public class HorarioRequest {
    @NotNull
    private Long medicoId;
    @NotNull
    private DayOfWeek diaSemana;
    @NotNull
    private LocalTime horaInicio;
    @NotNull
    private LocalTime horaFin;
    @Min(15)
    @Max(120)
    private Integer duracionCitaMinutos = 30;
}
