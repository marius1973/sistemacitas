package com.clinica.citas.service;

import com.clinica.citas.dto.EspecialidadResponse;
import com.clinica.citas.exception.RecursoNoEncontradoException;
import com.clinica.citas.model.Especialidad;
import com.clinica.citas.repository.EspecialidadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EspecialidadService {

    private final EspecialidadRepository especialidadRepository;

    public List<EspecialidadResponse> listarTodas() {
        return especialidadRepository.findAll().stream().map(this::mapearRespuesta).toList();
    }

    public EspecialidadResponse crear(Especialidad especialidad) {
        return mapearRespuesta(especialidadRepository.save(especialidad));
    }

    public Especialidad obtenerPorId(Long id) {
        return especialidadRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Especialidad no encontrada: " + id));
    }

    private EspecialidadResponse mapearRespuesta(Especialidad e) {
        return new EspecialidadResponse(e.getId(), e.getNombre(), e.getDescripcion());
    }
}
