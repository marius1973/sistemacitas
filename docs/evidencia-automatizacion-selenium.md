# Evidencia de automatización de pruebas con Selenium

## 1. Propósito

Documentar la **automatización de pruebas end-to-end** del **Sistema de Gestión de Citas Médicas (Clínica Grupo 8)** mediante **Selenium WebDriver**, con trazabilidad a los requisitos funcionales (RF01–RF07 / RNF05) y a los casos de prueba CP01–CP08.

Esta evidencia demuestra que los flujos críticos del paciente (registro, autenticación, consulta de especialidades, disponibilidad, reserva, concurrencia, cancelación y reprogramación) se validan de forma repetible contra el entorno desplegado.

---

## 2. Sistema bajo prueba

| Elemento | Descripción |
|---|---|
| Nombre | Sistema de Gestión de Citas Médicas |
| Marca / UI | Clínica Grupo 8 |
| Frontend | React + Vite — [https://sistemacitas.vercel.app](https://sistemacitas.vercel.app) |
| Backend | Spring Boot (API REST + JWT) — Render |
| Roles cubiertos en E2E | Paciente (flujos CP01–CP08) |
| Credenciales demo | `paciente@clinica.com` / `demo123` (y `paciente2@clinica.com`) |

Arquitectura relevante para las pruebas:

```
Selenium (Chrome headless)
    → Frontend Vercel (/registro, /login, /reservar, /mis-citas)
        → Proxy /api → Backend Render
            → PostgreSQL (especialidades, médicos, horarios, citas)
```

---

## 3. Herramienta y ubicación del código

| Ítem | Detalle |
|---|---|
| Herramienta | **Selenium WebDriver 4** (`selenium-webdriver` en Node.js) |
| Navegador | Google Chrome (modo headless) |
| Suite | `frontend/tests/selenium/run.js` |
| Catálogo CP ↔ RF | `frontend/tests/selenium/casos.js` |
| Helpers | `frontend/tests/selenium/helpers.js` |
| Generador de evidencia | `frontend/tests/selenium/reporte.js` |
| Comando | `npm run test:e2e` (desde `frontend/`) |

Variable de entorno:

```powershell
$env:BASE_URL = "https://sistemacitas.vercel.app"
npm run test:e2e
```

Tras cada ejecución se genera evidencia en:

```
frontend/tests/selenium/evidencia/latest/
  ├── informe.html      ← informe visual con capturas
  ├── informe.md        ← informe en Markdown
  ├── resultados.json   ← resultado máquina-legible
  └── capturas/
        CP01_resultado.png …
```

Abrir `informe.html` en el navegador para revisar capturas por caso.

---

## 4. Matriz de trazabilidad (requisitos ↔ casos ↔ automatización)

| Requisito | Caso | Qué valida en el sistema | Técnica |
|---|---|---|---|
| **RF01** Registro de paciente | **CP01** | Alta de cuenta e ingreso inmediato | Selenium UI `/registro` |
| **RF02** Autenticación | **CP02** | Rechazo con contraseña incorrecta | Selenium UI `/login` |
| **RF03** Especialidades | **CP03** | Catálogo visible al reservar | Selenium UI `/reservar` |
| **RF04** Disponibilidad | **CP04** | Día sin bloques (sábado) | Selenium UI + API |
| **RF05** Reserva | **CP05** | Reserva de slot disponible | Selenium UI `/reservar` |
| **RF05 / RNF05** Concurrencia | **CP06** | Dos pacientes, mismo horario | API paralela (`Promise.all`) |
| **RF06** Cancelación | **CP07** | Cita pendiente → CANCELADA | Selenium UI `/mis-citas` |
| **RF07** Reprogramación | **CP08** | Rechazo de horario 19:00 inválido | Selenium UI + API |

---

## 5. Descripción de los casos automatizados

### CP01 – Registro exitoso de paciente (RF01)

- **Entrada:** Ana Torres, correo único, teléfono 987654321, contraseña válida.
- **Esperado:** Sesión iniciada y mensaje de bienvenida.
- **Automatización:** Completa el formulario de `/registro` y aserta `Bienvenido, Ana` + botón «Cerrar sesión».

### CP02 – Login con credenciales inválidas (RF02)

- **Entrada:** Correo de CP01 + `incorrecta123`.
- **Esperado:** Permanece en `/login` con mensaje de error.
- **Automatización:** Envía el formulario y espera `.mensaje-error`.

### CP03 – Listado de especialidades (RF03)

- **Entrada:** Paciente autenticado en `/reservar`.
- **Esperado:** Especialidades seed (Cardiología, Pediatría, Medicina General).
- **Nota:** El documento funcional menciona 5 especialidades; el entorno actual expone 3 del seed.

### CP04 – Disponibilidad sin bloques (RF04)

- **Entrada:** Cardiología + sábado (sin bloques lun–vie del seed).
- **Esperado:** Mensaje explícito de “no hay horarios”.
- **Observación (DEF03):** La API responde lista vacía y la UI no muestra mensaje explicativo.

### CP05 – Reserva de cita (RF05)

- **Entrada:** Medicina General, próximo lunes, slot disponible.
- **Esperado:** «Cita reservada correctamente».

### CP06 – Reserva simultánea (RF05 / RNF05)

- **Entrada:** Dos `POST /api/citas` en paralelo al mismo slot.
- **Esperado:** Solo una aceptada.
- **Nota:** Históricamente asociado a DEF01 (condición de carrera); el resultado puede variar entre ejecuciones.

### CP07 – Cancelación (RF06)

- **Entrada:** Cita pendiente de CP05.
- **Esperado:** Estado `CANCELADA` en Mis citas.

### CP08 – Reprogramación fuera de disponibilidad (RF07)

- **Entrada:** Intento API a las 19:00 + verificación UI de slots ofrecidos.
- **Esperado:** Rechazo API y ausencia de 19:00 en la UI.

---

## 6. Evidencia de la última ejecución

La carpeta canónica de evidencia es:

**[`frontend/tests/selenium/evidencia/latest/informe.html`](../frontend/tests/selenium/evidencia/latest/informe.html)**

Incluye:

1. Identificación del sistema y URL bajo prueba.
2. Tabla de resultados CP01–CP08 con estado y tiempo.
3. Capturas de pantalla por caso (UI).
4. Detalle de resultado obtenido vs esperado.
5. JSON `resultados.json` para auditoría.

### Resultado de referencia (12 jul 2026 — `https://sistemacitas.vercel.app`)

| ID | RF | Estado | Observación |
|---|---|---|---|
| CP01 | RF01 | Aprobado | Registro + acceso inmediato |
| CP02 | RF02 | Aprobado | Credenciales inválidas rechazadas |
| CP03 | RF03 | Aprobado | 3 especialidades seed listadas |
| CP04 | RF04 | Observado | DEF03 — sin mensaje explicativo |
| CP05 | RF05 | Aprobado | Reserva confirmada en UI |
| CP06 | RF05/RNF05 | Aprobado | Una aceptada (HTTP 200) / una rechazada (409) |
| CP07 | RF06 | Aprobado | Cita en estado CANCELADA |
| CP08 | RF07 | Aprobado | Reprogramación a 19:00 rechazada |

> Ejecutar `npm run test:e2e` con `BASE_URL` apuntando a producción (o local) regenera esta carpeta.

---

## 7. Criterios de estado

| Estado | Significado |
|---|---|
| **APROBADO** | El resultado obtenido cumple el esperado del caso. |
| **OBSERVADO** | El comportamiento es incorrecto o incompleto pero documentado (p. ej. DEF03). |
| **FALLIDO** | No se cumple el esperado (defecto o error de ejecución). |

---

## 8. Limitaciones conocidas

1. El registro UI no solicita número de documento (el modelo backend sí lo contempla).
2. Catálogo de especialidades del entorno = 3 (seed), no las 5 del documento funcional.
3. CP06 es sensible a condiciones de carrera; conviene repetir si se audita RNF05.
4. El backend en plan free de Render puede tardar en “despertar”; la suite espera el mensaje de arranque.

---

## 9. Conclusión

Se cuenta con una **suite Selenium documentada y trazable** a los requisitos del Sistema de Citas Médicas, con **informe automático, capturas y matriz RF ↔ CP**, ejecutable contra el despliegue en Vercel. Esta evidencia soporta la verificación de calidad de los flujos de paciente (RF01–RF07) de forma objetiva y reproducible.
