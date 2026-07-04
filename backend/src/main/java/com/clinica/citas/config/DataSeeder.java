package com.clinica.citas.config;

import com.clinica.citas.model.*;
import com.clinica.citas.repository.EspecialidadRepository;
import com.clinica.citas.repository.HorarioRepository;
import com.clinica.citas.repository.MedicoRepository;
import com.clinica.citas.repository.PacienteRepository;
import com.clinica.citas.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private static final String PASSWORD_DEMO = "demo123";

    private final EspecialidadRepository especialidadRepository;
    private final MedicoRepository medicoRepository;
    private final PacienteRepository pacienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final HorarioRepository horarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (especialidadRepository.count() > 0) {
            return;
        }

        Especialidad cardiologia = crearEspecialidad("Cardiologia", "Diagnostico y tratamiento de enfermedades del corazon");
        Especialidad pediatria = crearEspecialidad("Pediatria", "Atencion medica para ninos y adolescentes");
        Especialidad medicinaGeneral = crearEspecialidad("Medicina General", "Consultas generales y revisiones de salud");

        Medico medicoCardiologo = crearMedico(
                "Carlos", "Mendoza", "medico1@clinica.com", "CMP-10001",
                cardiologia, "Especialista en cardiologia preventiva");
        Medico medicoPediatra = crearMedico(
                "Ana", "Ruiz", "medico2@clinica.com", "CMP-10002",
                pediatria, "Pediatra con enfoque en desarrollo infantil");
        Medico medicoGeneral = crearMedico(
                "Luis", "Torres", "medico3@clinica.com", "CMP-10003",
                medicinaGeneral, "Medicina general y chequeos anuales");

        crearHorariosLaborales(medicoCardiologo);
        crearHorariosLaborales(medicoPediatra);
        crearHorariosLaborales(medicoGeneral);

        crearPaciente("Juan", "Perez", "paciente@clinica.com", "45678901",
                LocalDate.of(1990, 5, 15), "Masculino", "Av. Salud 123");
        crearPaciente("Maria", "Gomez", "paciente2@clinica.com", "45678902",
                LocalDate.of(1985, 8, 22), "Femenino", "Calle Bienestar 456");

        crearUsuario("Roberto", "Silva", "recepcion@clinica.com", Rol.RECEPCIONISTA);
        crearUsuario("Patricia", "Vega", "admin@clinica.com", Rol.ADMINISTRADOR);

        log.info("Datos de prueba cargados. Contrasena para todos los usuarios: {}", PASSWORD_DEMO);
        log.info("Paciente: paciente@clinica.com | Medico: medico1@clinica.com | Recepcion: recepcion@clinica.com | Admin: admin@clinica.com");
    }

    private Especialidad crearEspecialidad(String nombre, String descripcion) {
        Especialidad especialidad = new Especialidad();
        especialidad.setNombre(nombre);
        especialidad.setDescripcion(descripcion);
        return especialidadRepository.save(especialidad);
    }

    private Medico crearMedico(String nombre, String apellido, String email, String colegiado,
                               Especialidad especialidad, String biografia) {
        Medico medico = new Medico();
        medico.setNombre(nombre);
        medico.setApellido(apellido);
        medico.setEmail(email);
        medico.setPasswordHash(passwordEncoder.encode(PASSWORD_DEMO));
        medico.setTelefono("999000111");
        medico.setRol(Rol.MEDICO);
        medico.setNumeroColegiado(colegiado);
        medico.setEspecialidad(especialidad);
        medico.setBiografia(biografia);
        return medicoRepository.save(medico);
    }

    private void crearHorariosLaborales(Medico medico) {
        List<DayOfWeek> diasLaborables = List.of(
                DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
                DayOfWeek.THURSDAY, DayOfWeek.FRIDAY
        );

        for (DayOfWeek dia : diasLaborables) {
            crearHorario(medico, dia, LocalTime.of(8, 0), LocalTime.of(12, 0));
            crearHorario(medico, dia, LocalTime.of(14, 0), LocalTime.of(18, 0));
        }
    }

    private void crearHorario(Medico medico, DayOfWeek dia, LocalTime inicio, LocalTime fin) {
        Horario horario = new Horario();
        horario.setMedico(medico);
        horario.setDiaSemana(dia);
        horario.setHoraInicio(inicio);
        horario.setHoraFin(fin);
        horario.setDuracionCitaMinutos(30);
        horarioRepository.save(horario);
    }

    private Paciente crearPaciente(String nombre, String apellido, String email, String documento,
                                   LocalDate fechaNacimiento, String genero, String direccion) {
        Paciente paciente = new Paciente();
        paciente.setNombre(nombre);
        paciente.setApellido(apellido);
        paciente.setEmail(email);
        paciente.setPasswordHash(passwordEncoder.encode(PASSWORD_DEMO));
        paciente.setTelefono("999000222");
        paciente.setRol(Rol.PACIENTE);
        paciente.setNumeroDocumento(documento);
        paciente.setFechaNacimiento(fechaNacimiento);
        paciente.setGenero(genero);
        paciente.setDireccion(direccion);
        return pacienteRepository.save(paciente);
    }

    private void crearUsuario(String nombre, String apellido, String email, Rol rol) {
        Usuario usuario = new Usuario();
        usuario.setNombre(nombre);
        usuario.setApellido(apellido);
        usuario.setEmail(email);
        usuario.setPasswordHash(passwordEncoder.encode(PASSWORD_DEMO));
        usuario.setTelefono("999000333");
        usuario.setRol(rol);
        usuarioRepository.save(usuario);
    }
}
