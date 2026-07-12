package com.clinica.citas.service;

import com.clinica.citas.dto.*;
import com.clinica.citas.exception.AccesoDenegadoException;
import com.clinica.citas.model.*;
import com.clinica.citas.repository.MedicoRepository;
import com.clinica.citas.repository.PacienteRepository;
import com.clinica.citas.repository.UsuarioRepository;
import com.clinica.citas.security.JwtService;
import com.clinica.citas.security.SecurityContextHelper;
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
    private final MedicoRepository medicoRepository;
    private final EspecialidadService especialidadService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final com.clinica.citas.security.UsuarioDetailsServiceImpl usuarioDetailsService;
    private final SecurityContextHelper securityContextHelper;

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

    public MensajeResponse registrarStaff(RegistroStaffRequest req) {
        Usuario actual = securityContextHelper.obtenerUsuarioActual();
        if (actual.getRol() != Rol.ADMINISTRADOR) {
            throw new AccesoDenegadoException("Solo administradores pueden registrar personal");
        }

        req.setEmail(normalizarEmail(req.getEmail()));
        if (usuarioRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("El email ya esta registrado");
        }

        if (req.getRol() != Rol.MEDICO && req.getRol() != Rol.RECEPCIONISTA) {
            throw new IllegalArgumentException("Solo se puede registrar MEDICO o RECEPCIONISTA");
        }

        if (req.getRol() == Rol.MEDICO) {
            if (req.getNumeroColegiado() == null || req.getNumeroColegiado().isBlank()) {
                throw new IllegalArgumentException("El numero de colegiado es obligatorio para medicos");
            }
            if (req.getEspecialidadId() == null) {
                throw new IllegalArgumentException("La especialidad es obligatoria para medicos");
            }
            if (medicoRepository.existsByNumeroColegiado(req.getNumeroColegiado())) {
                throw new IllegalArgumentException("El numero de colegiado ya esta registrado");
            }

            Medico medico = new Medico();
            medico.setNombre(req.getNombre());
            medico.setApellido(req.getApellido());
            medico.setEmail(req.getEmail());
            medico.setPasswordHash(passwordEncoder.encode(req.getPassword()));
            medico.setTelefono(req.getTelefono());
            medico.setRol(Rol.MEDICO);
            medico.setNumeroColegiado(req.getNumeroColegiado());
            medico.setBiografia(req.getBiografia());
            medico.setEspecialidad(especialidadService.obtenerPorId(req.getEspecialidadId()));
            medicoRepository.save(medico);
            return new MensajeResponse("Medico registrado correctamente");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(req.getNombre());
        usuario.setApellido(req.getApellido());
        usuario.setEmail(req.getEmail());
        usuario.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        usuario.setTelefono(req.getTelefono());
        usuario.setRol(Rol.RECEPCIONISTA);
        usuarioRepository.save(usuario);
        return new MensajeResponse("Recepcionista registrado correctamente");
    }

    public AuthResponse login(LoginRequest req) {
        req.setEmail(normalizarEmail(req.getEmail()));
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));

        Usuario usuario = usuarioRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalStateException("Usuario no encontrado"));

        if (!usuario.isActivo()) {
            throw new IllegalArgumentException("La cuenta esta desactivada");
        }

        UserDetails userDetails = usuarioDetailsService.loadUserByUsername(req.getEmail());
        String token = jwtService.generarToken(userDetails);
        return new AuthResponse(token, usuario.getRol().name(), usuario.getId(), usuario.getNombre());
    }

    private String normalizarEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
