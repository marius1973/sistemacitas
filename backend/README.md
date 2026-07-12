# Backend - Sistema de Gestion de Citas Medicas

API REST en Spring Boot 3 (Java 17) para el sistema de citas medicas.

## Requisitos

- Java 17+
- Maven 3.9+
- PostgreSQL 14+ (opcional para desarrollo; por defecto usa H2 en memoria)

## Ejecutar en desarrollo (H2 en memoria)

```bash
mvn spring-boot:run
```

La API queda disponible en `http://localhost:8080`. Consola H2 en `http://localhost:8080/h2-console`
(JDBC URL: `jdbc:h2:mem:citasdb`, usuario `sa`, sin password).

## Ejecutar con PostgreSQL

1. Crear base de datos `citas_medicas` y usuario `citas_user`.
2. Ajustar credenciales en `src/main/resources/application-postgres.properties`.
3. Ejecutar:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=postgres
```

## Estructura de paquetes

- `model` — entidades JPA (Usuario, Paciente, Medico, Especialidad, Horario, Cita, HistorialClinico, Notificacion)
- `repository` — repositorios Spring Data JPA
- `service` — logica de negocio (reservas, disponibilidad, notificaciones, auth)
- `controller` — endpoints REST
- `security` — JWT (generacion/validacion) y filtro de autenticacion
- `dto` — objetos de entrada/salida de la API
- `exception` — manejo centralizado de errores

## Endpoints principales

| Metodo | Ruta | Descripcion | Acceso |
|---|---|---|---|
| POST | `/api/auth/registro` | Registro de paciente | Publico |
| POST | `/api/auth/login` | Login (devuelve JWT) | Publico |
| GET | `/api/especialidades` | Listar especialidades | Publico |
| GET | `/api/medicos?especialidadId=` | Listar medicos (filtro opcional) | Autenticado |
| GET | `/api/horarios/medico/{id}/disponibilidad?fecha=` | Disponibilidad de un medico en una fecha | Autenticado |
| POST | `/api/citas` | Reservar cita | Paciente/Recepcionista/Admin |
| PATCH | `/api/citas/{id}/cancelar` | Cancelar cita | Paciente/Medico/Recepcionista/Admin |
| PATCH | `/api/citas/{id}/reprogramar` | Reprogramar cita | Paciente/Recepcionista/Admin |
| GET | `/api/citas/paciente/{id}` | Historial de citas de un paciente | Autenticado |
| GET | `/api/citas/medico/{id}/agenda?fecha=` | Agenda diaria de un medico | Medico/Recepcionista/Admin |
| GET/POST | `/api/historial` | Historial clinico | Medico/Admin |

Todas las rutas (salvo `/api/auth/**` y `/api/especialidades`) requieren el header
`Authorization: Bearer <token>` obtenido en el login.

## Nota

Este es un andamiaje inicial. No fue compilado en este entorno (no hay Maven/JDK 17
instalados en el sandbox de esta sesion) — se recomienda ejecutar `mvn clean compile`
al abrir el proyecto localmente para confirmar que compila antes de seguir desarrollando.
