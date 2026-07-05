package com.clinica.citas.dto;

import com.clinica.citas.model.EstadoCita;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CambiarEstadoRequest {
    @NotNull
    private EstadoCita estado;
}
