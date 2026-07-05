package com.clinica.citas.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:noreply@clinica.com}")
    private String mailFrom;

    public void enviar(String destinatario, String asunto, String cuerpo) {
        if (!mailEnabled) {
            log.info("Email no enviado (MAIL_ENABLED=false). Para: {} | Asunto: {} | {}", destinatario, asunto, cuerpo);
            return;
        }
        try {
            SimpleMailMessage mensaje = new SimpleMailMessage();
            mensaje.setFrom(mailFrom);
            mensaje.setTo(destinatario);
            mensaje.setSubject(asunto);
            mensaje.setText(cuerpo);
            mailSender.send(mensaje);
            log.info("Email enviado a {}", destinatario);
        } catch (Exception e) {
            log.warn("No se pudo enviar email a {}: {}", destinatario, e.getMessage());
        }
    }
}
