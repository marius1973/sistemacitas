package com.clinica.citas.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Map;

@Getter
@AllArgsConstructor
public class ReporteResumenResponse {
    private long totalCitas;
    private Map<String, Long> citasPorEstado;
    private Map<String, Long> citasPorEspecialidad;
}
