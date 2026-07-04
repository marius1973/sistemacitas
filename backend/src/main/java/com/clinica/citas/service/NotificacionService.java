package com.clinica.citas.service;

import com.clinica.citas.model.CanalNotificacion;
import com.clinica.citas.model.Notificacion;
import com.clinica.citas.model.TipoNotificacion;
import com.clinica.citas.model.Usuario;
import com.clinica.citas.repository.NotificacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Servicio de notificaciones. El envio real por email/SMS se puede conectar
 * aqui (por ejemplo usando JavaMailSender); por ahora persiste el registro
 * para que el paciente/medico lo vea en la app.
 */
@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;

    public Notificacion crear(Usuario usuario, TipoNotificacion tipo, String mensaje, CanalNotificacion canal) {
        Notificacion notificacion = new Notificacion();
        notificacion.setUsuario(usuario);
        notificacion.setTipo(tipo);
        notificacion.setMensaje(mensaje);
        notificacion.setCanal(canal);
        return notificacionRepository.save(notificacion);
    }

    public List<Notificacion> listarPorUsuario(Long usuarioId) {
        return notificacionRepository.findByUsuarioIdOrderByFechaEnvioDesc(usuarioId);
    }
}
