package com.clinica.citas.service;

import com.clinica.citas.dto.MedicoResponse;
import com.clinica.citas.exception.RecursoNoEncontradoException;
import com.clinica.citas.model.Medico;
import com.clinica.citas.repository.MedicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicoService {

    private final MedicoRepository medicoRepository;

    public List<MedicoResponse> listarTodos() {
        return medicoRepository.findAll().stream().map(this::mapearRespuesta).toList();
    }

    public List<MedicoResponse> listarPorEspecialidad(Long especialidadId) {
        return medicoRepository.findByEspecialidadId(especialidadId).stream().map(this::mapearRespuesta).toList();
    }

    public MedicoResponse obtenerPorId(Long id) {
        return mapearRespuesta(obtenerEntidad(id));
    }

    public Medico obtenerEntidad(Long id) {
        return medicoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Medico no encontrado: " + id));
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
                m.getBiografia()
        );
    }
}
