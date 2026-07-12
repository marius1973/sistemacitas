package com.clinica.citas.service;

import com.clinica.citas.dto.NotificacionResponse;
import com.clinica.citas.model.CanalNotificacion;
import com.clinica.citas.model.Notificacion;
import com.clinica.citas.model.TipoNotificacion;
import com.clinica.citas.model.Usuario;
import com.clinica.citas.exception.RecursoNoEncontradoException;
import com.clinica.citas.repository.NotificacionRepository;
import com.clinica.citas.security.SecurityContextHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final EmailService emailService;
    private final SecurityContextHelper securityContextHelper;

    public Notificacion crear(Usuario usuario, TipoNotificacion tipo, String mensaje, CanalNotificacion canal) {
        Notificacion notificacion = new Notificacion();
        notificacion.setUsuario(usuario);
        notificacion.setTipo(tipo);
        notificacion.setMensaje(mensaje);
        notificacion.setCanal(canal);
        Notificacion guardada = notificacionRepository.save(notificacion);

        if (canal == CanalNotificacion.EMAIL) {
            emailService.enviar(usuario.getEmail(), tituloParaTipo(tipo), mensaje);
        }
        return guardada;
    }

    public List<NotificacionResponse> listarMisNotificaciones() {
        Usuario actual = securityContextHelper.obtenerUsuarioActual();
        return notificacionRepository.findByUsuarioIdOrderByFechaEnvioDesc(actual.getId())
                .stream().map(this::mapearRespuesta).toList();
    }

    public NotificacionResponse marcarLeida(Long id) {
        Usuario actual = securityContextHelper.obtenerUsuarioActual();
        Notificacion notificacion = notificacionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Notificacion no encontrada: " + id));
        if (!notificacion.getUsuario().getId().equals(actual.getId())) {
            throw new com.clinica.citas.exception.AccesoDenegadoException("No puede marcar notificaciones de otro usuario");
        }
        notificacion.setLeido(true);
        return mapearRespuesta(notificacionRepository.save(notificacion));
    }

    public long contarNoLeidas() {
        Usuario actual = securityContextHelper.obtenerUsuarioActual();
        return notificacionRepository.countByUsuarioIdAndLeidoFalse(actual.getId());
    }

    private NotificacionResponse mapearRespuesta(Notificacion n) {
        return new NotificacionResponse(
                n.getId(), n.getTipo(), n.getCanal(), n.getMensaje(), n.getFechaEnvio(), n.isLeido());
    }

    private String tituloParaTipo(TipoNotificacion tipo) {
        return switch (tipo) {
            case CONFIRMACION_CITA -> "Confirmacion de cita - Clinica Grupo 8";
            case CANCELACION_CITA -> "Cancelacion de cita - Clinica Grupo 8";
            case REPROGRAMACION_CITA -> "Reprogramacion de cita - Clinica Grupo 8";
            case RECORDATORIO_CITA -> "Recordatorio de cita - Clinica Grupo 8";
        };
    }
}
