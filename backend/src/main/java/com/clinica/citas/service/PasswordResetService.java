package com.clinica.citas.service;

import com.clinica.citas.dto.MensajeResponse;
import com.clinica.citas.dto.RestablecerContrasenaRequest;
import com.clinica.citas.dto.SolicitarRecuperacionRequest;
import com.clinica.citas.model.PasswordResetToken;
import com.clinica.citas.model.Usuario;
import com.clinica.citas.repository.PasswordResetTokenRepository;
import com.clinica.citas.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    private static final String MENSAJE_GENERICO =
            "Si el correo esta registrado, recibiras instrucciones para restablecer tu contrasena.";

    public MensajeResponse solicitarRecuperacion(SolicitarRecuperacionRequest req) {
        String email = normalizarEmail(req.getEmail());
        usuarioRepository.findByEmail(email).ifPresent(usuario -> crearYEnviarToken(usuario));
        return new MensajeResponse(MENSAJE_GENERICO);
    }

    public MensajeResponse restablecerContrasena(RestablecerContrasenaRequest req) {
        PasswordResetToken token = tokenRepository.findByTokenAndUsadoFalse(req.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Token invalido o expirado"));

        if (token.getExpiraEn().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token invalido o expirado");
        }

        Usuario usuario = token.getUsuario();
        usuario.setPasswordHash(passwordEncoder.encode(req.getNuevaPassword()));
        usuarioRepository.save(usuario);

        token.setUsado(true);
        tokenRepository.save(token);

        return new MensajeResponse("Contrasena actualizada correctamente. Ya puedes iniciar sesion.");
    }

    private void crearYEnviarToken(Usuario usuario) {
        PasswordResetToken token = new PasswordResetToken();
        token.setToken(UUID.randomUUID().toString());
        token.setUsuario(usuario);
        token.setExpiraEn(LocalDateTime.now().plusHours(1));
        tokenRepository.save(token);

        String enlace = frontendUrl + "/restablecer-contrasena?token=" + token.getToken();
        emailService.enviar(usuario.getEmail(), "Recuperar contrasena - Clinica Grupo 8",
                "Hola " + usuario.getNombre() + ",\n\n" +
                        "Para restablecer tu contrasena visita el siguiente enlace (valido 1 hora):\n" +
                        enlace + "\n\nSi no solicitaste este cambio, ignora este mensaje.");
    }

    private String normalizarEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
