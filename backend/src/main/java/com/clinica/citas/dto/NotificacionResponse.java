package com.clinica.citas.dto;

import com.clinica.citas.model.CanalNotificacion;
import com.clinica.citas.model.TipoNotificacion;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class NotificacionResponse {
    private Long id;
    private TipoNotificacion tipo;
    private CanalNotificacion canal;
    private String mensaje;
    private LocalDateTime fechaEnvio;
    private boolean leido;
}
