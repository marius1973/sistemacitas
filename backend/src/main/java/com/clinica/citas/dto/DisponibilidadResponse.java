package com.clinica.citas.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalTime;

@Getter
@AllArgsConstructor
public class DisponibilidadResponse {
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private boolean disponible;
}
