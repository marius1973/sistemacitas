package com.clinica.citas.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "historial_clinico")
@Getter
@Setter
@NoArgsConstructor
public class HistorialClinico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    @ManyToOne(optional = false)
    @JoinColumn(name = "medico_id")
    private Medico medico;

    @OneToOne
    @JoinColumn(name = "cita_id")
    private Cita cita;

    @Column(nullable = false)
    private LocalDateTime fecha = LocalDateTime.now();

    @Column(length = 2000)
    private String diagnostico;

    @Column(length = 2000)
    private String tratamiento;

    @Column(length = 2000)
    private String notas;
}
