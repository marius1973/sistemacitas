package com.clinica.citas.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class HistorialClinicoResponse {
    private Long id;
    private Long citaId;
    private Long pacienteId;
    private String pacienteNombre;
    private Long medicoId;
    private String medicoNombre;
    private LocalDateTime fecha;
    private String diagnostico;
    private String tratamiento;
    private String notas;
}
