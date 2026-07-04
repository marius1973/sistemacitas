package com.clinica.citas.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Getter
@AllArgsConstructor
public class HorarioResponse {
    private Long id;
    private Long medicoId;
    private DayOfWeek diaSemana;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private Integer duracionCitaMinutos;
    private boolean activo;
}
