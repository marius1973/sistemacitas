package com.clinica.citas.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "medicos")
@Getter
@Setter
@NoArgsConstructor
public class Medico extends Usuario {

    @Column(name = "numero_colegiado", nullable = false, unique = true)
    private String numeroColegiado;

    @ManyToOne(optional = false)
    @JoinColumn(name = "especialidad_id")
    private Especialidad especialidad;

    @Column(length = 1000)
    private String biografia;
}
