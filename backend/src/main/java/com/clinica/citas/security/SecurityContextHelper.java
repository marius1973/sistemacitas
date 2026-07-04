package com.clinica.citas.security;

import com.clinica.citas.exception.AccesoDenegadoException;
import com.clinica.citas.model.Usuario;
import com.clinica.citas.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityContextHelper {

    private final UsuarioRepository usuarioRepository;

    public Usuario obtenerUsuarioActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new AccesoDenegadoException("Debe iniciar sesion para realizar esta operacion");
        }
        return usuarioRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new AccesoDenegadoException("Usuario no encontrado"));
    }
}
