package com.clinica.citas.service;

import com.clinica.citas.dto.AuthResponse;
import com.clinica.citas.dto.LoginRequest;
import com.clinica.citas.dto.RegistroPacienteRequest;
import com.clinica.citas.model.Paciente;
import com.clinica.citas.model.Rol;
import com.clinica.citas.model.Usuario;
import com.clinica.citas.repository.PacienteRepository;
import com.clinica.citas.repository.UsuarioRepository;
import com.clinica.citas.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PacienteRepository pacienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final com.clinica.citas.security.UsuarioDetailsServiceImpl usuarioDetailsService;

    public AuthResponse registrarPaciente(RegistroPacienteRequest req) {
        req.setEmail(normalizarEmail(req.getEmail()));
        if (usuarioRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("El email ya esta registrado");
        }
        Paciente paciente = new Paciente();
        paciente.setNombre(req.getNombre());
        paciente.setApellido(req.getApellido());
        paciente.setEmail(req.getEmail());
        paciente.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        paciente.setTelefono(req.getTelefono());
        paciente.setRol(Rol.PACIENTE);
        paciente.setNumeroDocumento(req.getNumeroDocumento());
        paciente.setFechaNacimiento(req.getFechaNacimiento());
        paciente.setGenero(req.getGenero());
        paciente.setDireccion(req.getDireccion());

        Paciente guardado = pacienteRepository.save(paciente);
        String token = jwtService.generarToken(usuarioDetailsService.loadUserByUsername(guardado.getEmail()));
        return new AuthResponse(token, guardado.getRol().name(), guardado.getId(), guardado.getNombre());
    }

    public AuthResponse login(LoginRequest req) {
        req.setEmail(normalizarEmail(req.getEmail()));
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));

        Usuario usuario = usuarioRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado"));

        UserDetails userDetails = usuarioDetailsService.loadUserByUsername(req.getEmail());
        String token = jwtService.generarToken(userDetails);
        return new AuthResponse(token, usuario.getRol().name(), usuario.getId(), usuario.getNombre());
    }

    private String normalizarEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
