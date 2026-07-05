package com.clinica.citas.service;

import com.clinica.citas.dto.ReporteResumenResponse;
import com.clinica.citas.repository.CitaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReporteService {

    private final CitaRepository citaRepository;

    public ReporteResumenResponse generarResumen(LocalDate desde, LocalDate hasta) {
        long total = citaRepository.countByFechaBetween(desde, hasta);

        Map<String, Long> porEstado = new LinkedHashMap<>();
        for (Object[] fila : citaRepository.contarPorEstadoEntre(desde, hasta)) {
            porEstado.put(fila[0].toString(), (Long) fila[1]);
        }

        Map<String, Long> porEspecialidad = new LinkedHashMap<>();
        List<Object[]> especialidades = citaRepository.contarPorEspecialidadEntre(desde, hasta);
        for (Object[] fila : especialidades) {
            porEspecialidad.put(fila[0].toString(), (Long) fila[1]);
        }

        return new ReporteResumenResponse(total, porEstado, porEspecialidad);
    }
}
