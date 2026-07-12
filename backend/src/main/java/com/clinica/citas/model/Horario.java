package com.clinica.citas.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalTime;

/**
 * Bloque de disponibilidad recurrente de un medico para un dia de la semana.
 * La agenda concreta de citas se deriva cruzando estos bloques con las
 * citas ya reservadas.
 */
@Entity
@Table(name = "horarios")
@Getter
@Setter
@NoArgsConstructor
public class Horario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "medico_id")
    private Medico medico;

    @Enumerated(EnumType.STRING)
    @Column(name = "dia_semana", nullable = false)
    private DayOfWeek diaSemana;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    @Column(name = "duracion_cita_minutos", nullable = false)
    private Integer duracionCitaMinutos = 30;

    @Column(nullable = false)
    private boolean activo = true;
}
