package com.clinica.citas.service;

import com.clinica.citas.dto.MedicoRequest;
import com.clinica.citas.dto.MedicoResponse;
import com.clinica.citas.exception.RecursoNoEncontradoException;
import com.clinica.citas.model.Medico;
import com.clinica.citas.repository.MedicoRepository;
import com.clinica.citas.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicoService {

    private final MedicoRepository medicoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EspecialidadService especialidadService;
    private final PasswordEncoder passwordEncoder;

    public List<MedicoResponse> listarTodos() {
        return medicoRepository.findAll().stream().map(this::mapearRespuesta).toList();
    }

    public List<MedicoResponse> listarPorEspecialidad(Long especialidadId) {
        return medicoRepository.findByEspecialidadIdAndActivoTrue(especialidadId)
                .stream().map(this::mapearRespuesta).toList();
    }

    public MedicoResponse obtenerPorId(Long id) {
        return mapearRespuesta(obtenerEntidad(id));
    }

    public MedicoResponse crear(MedicoRequest req) {
        String email = normalizarEmail(req.getEmail());
        if (usuarioRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("El email ya esta registrado");
        }
        if (medicoRepository.existsByNumeroColegiado(req.getNumeroColegiado())) {
            throw new IllegalArgumentException("El numero de colegiado ya esta registrado");
        }
        if (req.getPassword() == null || req.getPassword().length() < 6) {
            throw new IllegalArgumentException("La contrasena debe tener al menos 6 caracteres");
        }

        Medico medico = new Medico();
        aplicarDatos(medico, req, email, true);
        return mapearRespuesta(medicoRepository.save(medico));
    }

    public MedicoResponse actualizar(Long id, MedicoRequest req) {
        Medico medico = obtenerEntidad(id);
        String email = normalizarEmail(req.getEmail());
        if (!medico.getEmail().equals(email) && usuarioRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("El email ya esta registrado");
        }
        if (!medico.getNumeroColegiado().equals(req.getNumeroColegiado())
                && medicoRepository.existsByNumeroColegiado(req.getNumeroColegiado())) {
            throw new IllegalArgumentException("El numero de colegiado ya esta registrado");
        }
        aplicarDatos(medico, req, email, false);
        return mapearRespuesta(medicoRepository.save(medico));
    }

    @Transactional
    public MedicoResponse desactivar(Long id) {
        obtenerEntidad(id);
        var usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Medico no encontrado: " + id));
        usuario.setActivo(false);
        usuarioRepository.saveAndFlush(usuario);
        medicoRepository.flush();
        return mapearRespuesta(obtenerEntidad(id));
    }

    @Transactional
    public MedicoResponse activar(Long id) {
        obtenerEntidad(id);
        var usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Medico no encontrado: " + id));
        usuario.setActivo(true);
        usuarioRepository.saveAndFlush(usuario);
        medicoRepository.flush();
        return mapearRespuesta(obtenerEntidad(id));
    }

    public Medico obtenerEntidad(Long id) {
        return medicoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Medico no encontrado: " + id));
    }

    private void aplicarDatos(Medico medico, MedicoRequest req, String email, boolean esNuevo) {
        medico.setNombre(req.getNombre());
        medico.setApellido(req.getApellido());
        medico.setEmail(email);
        medico.setTelefono(req.getTelefono());
        medico.setNumeroColegiado(req.getNumeroColegiado());
        medico.setEspecialidad(especialidadService.obtenerPorId(req.getEspecialidadId()));
        medico.setBiografia(req.getBiografia());
        if (esNuevo) {
            medico.setPasswordHash(passwordEncoder.encode(req.getPassword()));
            medico.setRol(com.clinica.citas.model.Rol.MEDICO);
        } else if (req.getPassword() != null && !req.getPassword().isBlank()) {
            medico.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        }
    }

    private MedicoResponse mapearRespuesta(Medico m) {
        return new MedicoResponse(
                m.getId(),
                m.getNombre(),
                m.getApellido(),
                m.getEmail(),
                m.getTelefono(),
                m.getNumeroColegiado(),
                m.getEspecialidad().getId(),
                m.getEspecialidad().getNombre(),
                m.getBiografia(),
                m.isActivo()
        );
    }

    private String normalizarEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
