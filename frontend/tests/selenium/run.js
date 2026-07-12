/**
 * Casos de prueba E2E (CP01–CP08) — Sistema de Citas Médicas
 *
 * Ajustes respecto al documento funcional:
 * - Registro UI: nombre/apellido/email/password/telefono (sin campo documento).
 * - Catálogo seed actual: Cardiologia, Medicina General, Pediatria (3, no 5).
 * - Horarios seed: lun–vie 08:00–12:00 y 14:00–18:00 (slots de 30 min).
 * - CP04: sábado (sin bloques seed). CP05/CP07: próximo lunes ~10:00.
 */
import { By, until } from 'selenium-webdriver'
import {
  BASE_URL,
  DEMO,
  crearDriver,
  irA,
  esperarTexto,
  esperarGone,
  login,
  limpiarSesion,
  esperarSesionPaciente,
  seleccionarPorTexto,
  proximaFecha,
  emailUnico,
  apiLogin,
  apiReservar,
  apiReprogramar,
  apiDisponibilidad,
  apiMedicos,
  apiEspecialidades,
  setDateInput,
} from './helpers.js'
import { crearCarpetaEvidencia, capturar, escribirInforme } from './reporte.js'

async function esperarEspecialidadesCargadas(driver) {
  await driver.wait(async () => {
    const selects = await driver.findElements(By.css('select'))
    if (!selects.length) return false
    const opciones = await selects[0].findElements(By.css('option'))
    return opciones.length > 1
  }, 30000)
}

/** @type {{ id: string, nombre: string, estado: 'APROBADO'|'OBSERVADO'|'FALLIDO', ms: number, detalle?: string, captura?: string, nota?: string }[]} */
const resultados = []
let evidencia = null

/** Estado compartido entre casos encadenados */
const ctx = {
  registro: null,
  cita: null,
}

async function ejecutarCaso(id, nombre, fn) {
  const driver = await crearDriver()
  const inicio = Date.now()
  let captura = null
  try {
    await limpiarSesion(driver)
    const estado = (await fn(driver)) || 'APROBADO'
    try {
      captura = await capturar(driver, evidencia, id, 'resultado')
    } catch {
      /* captura opcional */
    }
    const ms = Date.now() - inicio
    resultados.push({ id, nombre, estado, ms, captura })
    const tag = estado === 'APROBADO' ? 'PASS' : estado === 'OBSERVADO' ? 'OBS ' : 'FAIL'
    console.log(`${tag}  ${id} — ${nombre} [${estado}] (${ms}ms)`)
  } catch (err) {
    try {
      captura = await capturar(driver, evidencia, id, 'error')
    } catch {
      /* ignore */
    }
    const ms = Date.now() - inicio
    resultados.push({ id, nombre, estado: 'FALLIDO', ms, detalle: err.message, captura })
    console.error(`FAIL  ${id} — ${nombre} [FALLIDO] (${ms}ms)`)
    console.error(`      ${err.message}`)
  } finally {
    await driver.quit()
  }
}

/** Caso sin browser (API); registra evidencia textual en el informe. */
async function ejecutarCasoApi(id, nombre, fn) {
  const inicio = Date.now()
  try {
    const out = await fn()
    const estado = typeof out === 'string' ? out : out?.estado || 'APROBADO'
    const nota = typeof out === 'object' ? out.nota : undefined
    const ms = Date.now() - inicio
    resultados.push({ id, nombre, estado, ms, nota })
    const tag = estado === 'APROBADO' ? 'PASS' : estado === 'OBSERVADO' ? 'OBS ' : 'FAIL'
    console.log(`${tag}  ${id} — ${nombre} [${estado}] (${ms}ms)`)
  } catch (err) {
    const ms = Date.now() - inicio
    resultados.push({ id, nombre, estado: 'FALLIDO', ms, detalle: err.message })
    console.error(`FAIL  ${id} — ${nombre} [FALLIDO] (${ms}ms)`)
    console.error(`      ${err.message}`)
  }
}

/** CP01 – Registro exitoso de paciente (RF01) */
async function cp01_registro(driver) {
  const email = emailUnico('ana.torres')
  const password = 'AnaTorres#2026'
  await irA(driver, '/registro')
  await esperarTexto(driver, 'Registro de paciente')
  try {
    await esperarGone(driver, 'Despertando servidor', 90000)
  } catch { /* ok */ }

  const inputs = await driver.findElements(By.css('form input'))
  // Nombre, Apellido, Email, Password, Telefono
  await inputs[0].sendKeys('Ana')
  await inputs[1].sendKeys('Torres')
  await inputs[2].sendKeys(email)
  await inputs[3].sendKeys(password)
  await inputs[4].sendKeys('987654321')
  await driver.findElement(By.css('button[type="submit"]')).click()

  await driver.wait(until.elementLocated(By.xpath('//button[contains(., "Cerrar sesion")]')), 45000)
  await esperarTexto(driver, 'Bienvenido, Ana')
  ctx.registro = { email, password, nombre: 'Ana' }
  return 'APROBADO'
}

/** CP02 – Inicio de sesión con credenciales inválidas (RF02) */
async function cp02_loginInvalido(driver) {
  const email = ctx.registro?.email || 'ana.torres@correo.com'
  await login(driver, email, 'incorrecta123')
  await driver.wait(until.elementLocated(By.css('.mensaje-error')), 30000)
  const error = (await driver.findElement(By.css('.mensaje-error')).getText()).toLowerCase()
  if (!error.includes('credencial') && !error.includes('invalid') && !error.includes('incorrect')) {
    // Aceptar cualquier rechazo genérico sin revelar qué campo falló
    if (!error.trim()) throw new Error('Sin mensaje de error')
  }
  const url = await driver.getCurrentUrl()
  if (!url.includes('/login')) throw new Error(`Debió permanecer en /login: ${url}`)
  return 'APROBADO'
}

/** CP03 – Búsqueda/listado de especialidades (RF03) */
async function cp03_especialidades(driver) {
  const cuenta = ctx.registro || DEMO.paciente
  await login(driver, cuenta.email, cuenta.password || DEMO.paciente.password)
  await esperarSesionPaciente(driver)
  await driver.findElement(By.linkText('Reservar cita')).click()
  await driver.wait(until.urlContains('/reservar'), 10000)
  await esperarEspecialidadesCargadas(driver)

  const selects = await driver.findElements(By.css('select'))
  const opciones = await selects[0].findElements(By.css('option'))
  const nombres = []
  for (const op of opciones) {
    const t = (await op.getText()).trim()
    if (t && t !== 'Seleccione...') nombres.push(t)
  }

  const ordenadas = [...nombres].sort((a, b) => a.localeCompare(b, 'es'))
  const seed = ['Cardiologia', 'Medicina General', 'Pediatria']
  const faltanSeed = seed.filter((e) => !nombres.includes(e))
  if (faltanSeed.length) {
    throw new Error(`Faltan especialidades del seed: ${faltanSeed.join(', ')}. Visto: ${nombres.join(', ')}`)
  }

  const esperadasDoc = ['Cardiologia', 'Ginecologia', 'Medicina General', 'Odontologia', 'Pediatria']
  const faltanDoc = esperadasDoc.filter((e) => !nombres.includes(e))
  if (faltanDoc.length || JSON.stringify(nombres) !== JSON.stringify(ordenadas)) {
    console.log(
      `      Nota CP03: catálogo=[${nombres.join(', ')}]` +
        (faltanDoc.length ? `; faltan del doc: ${faltanDoc.join(', ')}` : '') +
        (JSON.stringify(nombres) !== JSON.stringify(ordenadas) ? '; orden = id seed (no alfabético)' : ''),
    )
  }
  return 'APROBADO'
}

/** CP04 – Disponibilidad sin bloques (RF04 / DEF03) */
async function cp04_sinDisponibilidad(driver) {
  const sabado = proximaFecha(6)

  // Confirmar por API que el médico no tiene bloques ese día (sábado; seed = lun–vie)
  const auth = await apiLogin(DEMO.paciente.email, DEMO.paciente.password)
  const especialidades = await apiEspecialidades()
  const cardio = especialidades.find((e) => e.nombre === 'Cardiologia')
  const medicos = await apiMedicos(auth.token, cardio.id)
  const medicoId = medicos[0].id
  const slotsApi = await apiDisponibilidad(auth.token, medicoId, sabado)
  if (slotsApi.length > 0) {
    throw new Error(`Se esperaba 0 slots el sábado ${sabado}, API devolvió ${slotsApi.length}`)
  }

  const cuenta = ctx.registro || DEMO.paciente
  await login(driver, cuenta.email, cuenta.password || DEMO.paciente.password)
  await esperarSesionPaciente(driver)
  await driver.findElement(By.linkText('Reservar cita')).click()
  await driver.wait(until.urlContains('/reservar'), 10000)
  await esperarEspecialidadesCargadas(driver)
  await seleccionarPorTexto(driver, 'select', 'Cardiologia')
  await driver.sleep(800)
  await driver.wait(async () => {
    const selects = await driver.findElements(By.css('select'))
    const opts = await selects[1].findElements(By.css('option'))
    return opts.length > 1
  }, 15000)

  const selects = await driver.findElements(By.css('select'))
  const medOpts = await selects[1].findElements(By.css('option'))
  const medTexto = await medOpts[1].getText()
  const { Select } = await import('selenium-webdriver/lib/select.js')
  await new Select(selects[1]).selectByVisibleText(medTexto)

  const dateInput = await driver.findElement(By.css('input[type="date"]'))
  await setDateInput(driver, dateInput, sabado)
  await driver.sleep(2500)

  const horariosCard = await driver.findElements(By.xpath('//h3[contains(., "Horarios disponibles")]'))
  const mensajeVacio = await driver.findElements(
    By.xpath('//*[contains(., "no hay horarios") or contains(., "No hay horarios") or contains(., "sin disponibilidad") or contains(., "Sin horarios")]'),
  )

  if (horariosCard.length > 0) {
    const botones = await driver.findElements(By.xpath('//h3[contains(., "Horarios disponibles")]/following-sibling::div//button'))
    console.log(`      UI mostró ${botones.length} botón(es) de horario el sábado ${sabado}`)
  }

  if (mensajeVacio.length > 0) return 'APROBADO'

  // API vacía + sin mensaje explicativo = DEF03
  console.log('      DEF03: sin bloques el sábado y la UI no muestra mensaje explicativo')
  return 'OBSERVADO'
}

/** CP05 – Reserva de cita en horario disponible (RF05) */
async function cp05_reservar(driver) {
  const cuenta = ctx.registro || DEMO.paciente
  await login(driver, cuenta.email, cuenta.password || DEMO.paciente.password)
  await esperarSesionPaciente(driver)
  await driver.findElement(By.linkText('Reservar cita')).click()
  await driver.wait(until.urlContains('/reservar'), 10000)
  await esperarEspecialidadesCargadas(driver)
  await seleccionarPorTexto(driver, 'select', 'Medicina General')
  await driver.sleep(800)
  await driver.wait(async () => {
    const selects = await driver.findElements(By.css('select'))
    return (await selects[1].findElements(By.css('option'))).length > 1
  }, 15000)

  const selects = await driver.findElements(By.css('select'))
  const medOpts = await selects[1].findElements(By.css('option'))
  const medTexto = await medOpts[1].getText()
  const { Select } = await import('selenium-webdriver/lib/select.js')
  await new Select(selects[1]).selectByVisibleText(medTexto)

  const lunes = proximaFecha(1)
  const dateInput = await driver.findElement(By.css('input[type="date"]'))
  await setDateInput(driver, dateInput, lunes)

  await driver.wait(until.elementLocated(By.xpath('//h3[contains(., "Horarios disponibles")]')), 20000)
  const botones = await driver.findElements(By.xpath('//h3[contains(., "Horarios disponibles")]/following-sibling::div//button'))
  let elegido = null
  for (const b of botones) {
    if (!(await b.isEnabled())) continue
    const t = (await b.getText()).trim()
    if (t.startsWith('10:00')) {
      elegido = b
      break
    }
    if (!elegido) elegido = b
  }
  if (!elegido) throw new Error('No hay horarios disponibles para reservar')
  const hora = (await elegido.getText()).trim()
  await elegido.click()
  await esperarTexto(driver, 'Cita reservada correctamente', 20000)

  ctx.cita = { fecha: lunes, hora, medicoNombre: medTexto }
  return 'APROBADO'
}

/** CP06 – Reserva simultánea del mismo horario (RF05/RNF05 / DEF01) */
async function cp06_simultanea() {
  const lunes = proximaFecha(1)
  const especialidades = await apiEspecialidades()
  const cardio = especialidades.find((e) => e.nombre === 'Cardiologia')
  if (!cardio) throw new Error('No hay especialidad Cardiologia')

  const auth1 = await apiLogin(DEMO.paciente.email, DEMO.paciente.password)
  const auth2 = await apiLogin(DEMO.paciente2.email, DEMO.paciente2.password)
  const medicos = await apiMedicos(auth1.token, cardio.id)
  if (!medicos.length) throw new Error('Sin médicos de cardiología')
  const medicoId = medicos[0].id

  const slots = await apiDisponibilidad(auth1.token, medicoId, lunes)
  const libre = slots.find((s) => s.disponible)
  if (!libre) throw new Error(`Sin slots libres el ${lunes} para CP06`)

  const horaInicio = libre.horaInicio
  const body1 = { pacienteId: auth1.usuarioId, medicoId, fecha: lunes, horaInicio, motivo: 'control general' }
  const body2 = { pacienteId: auth2.usuarioId, medicoId, fecha: lunes, horaInicio, motivo: 'control general' }

  const [r1, r2] = await Promise.all([
    apiReservar(auth1.token, body1),
    apiReservar(auth2.token, body2),
  ])

  const okCount = [r1, r2].filter((r) => r.ok).length
  const nota = `Simultáneo ${lunes} ${horaInicio}: HTTP ${r1.status}/${r2.status} → aceptadas=${okCount}`
  if (okCount === 1) return { estado: 'APROBADO', nota }
  if (okCount === 2) {
    console.log('      DEF01: ambas reservas simultáneas fueron aceptadas para el mismo horario')
    return { estado: 'FALLIDO', nota: `${nota} (DEF01)` }
  }
  throw new Error(`Ninguna reserva aceptada: ${JSON.stringify({ r1, r2 })}`)
}

/** CP07 – Cancelación de cita pendiente (RF06) */
async function cp07_cancelar(driver) {
  const cuenta = ctx.registro || DEMO.paciente
  await login(driver, cuenta.email, cuenta.password || DEMO.paciente.password)
  await esperarSesionPaciente(driver)
  await driver.findElement(By.linkText('Mis citas')).click()
  await driver.wait(until.urlContains('/mis-citas'), 10000)
  await driver.wait(async () => {
    const cargando = await driver.findElements(By.xpath('//*[contains(., "Cargando citas")]'))
    return cargando.length === 0
  }, 20000)

  const filas = await driver.findElements(By.css('table tbody tr'))
  if (!filas.length) throw new Error('No hay citas para cancelar (ejecutar CP05 antes)')

  let cancelado = false
  for (const fila of filas) {
    const estado = await fila.findElement(By.css('.estado')).getText()
    if (estado === 'CANCELADA' || estado === 'COMPLETADA' || estado === 'NO_ASISTIO') continue
    const botones = await fila.findElements(By.xpath('.//button[contains(., "Cancelar")]'))
    if (!botones.length) continue
    await botones[0].click()
    cancelado = true
    break
  }
  if (!cancelado) throw new Error('No se encontró cita cancelable')

  await driver.sleep(1500)
  await driver.wait(async () => {
    const estados = await driver.findElements(By.css('.estado-CANCELADA, .estado.estado-CANCELADA, span.estado'))
    for (const e of estados) {
      if ((await e.getText()) === 'CANCELADA') return true
    }
    return false
  }, 15000)

  return 'APROBADO'
}

/**
 * CP08 – Reprogramación fuera de disponibilidad (RF07 / DEF02)
 * La UI solo ofrece slots válidos; se valida también por API que 19:00 sea rechazado.
 */
async function cp08_reprogramarInvalido(driver) {
  // Crear cita vía API para tener una pendiente
  const auth = await apiLogin(DEMO.paciente2.email, DEMO.paciente2.password)
  const especialidades = await apiEspecialidades()
  const ped = especialidades.find((e) => e.nombre === 'Pediatria')
  const medicos = await apiMedicos(auth.token, ped.id)
  const medicoId = medicos[0].id
  const lunes = proximaFecha(1)
  const slots = await apiDisponibilidad(auth.token, medicoId, lunes)
  const libre = slots.find((s) => s.disponible)
  if (!libre) throw new Error('Sin slot libre para preparar CP08')

  const creada = await apiReservar(auth.token, {
    pacienteId: auth.usuarioId,
    medicoId,
    fecha: lunes,
    horaInicio: libre.horaInicio,
    motivo: 'control',
  })
  if (!creada.ok) throw new Error(`No se pudo crear cita para CP08: ${JSON.stringify(creada.data)}`)

  // Intento de reprogramar a 19:00 (fuera de bloques 8-12 / 14-18)
  const intento = await apiReprogramar(auth.token, creada.data.id, {
    fecha: lunes,
    horaInicio: '19:00:00',
  })

  // UI: login y verificar que 19:00 no aparece en reprogramar
  await login(driver, DEMO.paciente2.email, DEMO.paciente2.password)
  await esperarSesionPaciente(driver)
  await driver.findElement(By.linkText('Mis citas')).click()
  await driver.wait(until.urlContains('/mis-citas'), 10000)
  await driver.sleep(1000)

  const botonesRep = await driver.findElements(By.xpath('//button[contains(., "Reprogramar")]'))
  if (botonesRep.length) {
    await botonesRep[0].click()
    const dateInput = await driver.findElement(By.css('input[type="date"]'))
    await setDateInput(driver, dateInput, lunes)
    await driver.sleep(1500)
    const horas = await driver.findElements(By.css('div.card button'))
    for (const b of horas) {
      const t = (await b.getText()).trim()
      if (t.startsWith('19:00')) {
        console.log('      DEF02: la UI ofrece 19:00 fuera de disponibilidad')
        return 'FALLIDO'
      }
    }
  }

  if (intento.ok) {
    console.log('      DEF02: la API aceptó reprogramar a 19:00 fuera de disponibilidad')
    return 'FALLIDO'
  }
  return 'APROBADO'
}

async function main() {
  const inicioIso = new Date().toISOString()
  evidencia = crearCarpetaEvidencia()
  console.log(`\nSelenium CP01–CP08 — BASE_URL=${BASE_URL}`)
  console.log(`Evidencia → ${evidencia.dir}\n`)

  await ejecutarCaso('CP01', 'Registro exitoso de paciente', cp01_registro)
  await ejecutarCaso('CP02', 'Login con credenciales inválidas', cp02_loginInvalido)
  await ejecutarCaso('CP03', 'Listado de especialidades', cp03_especialidades)
  await ejecutarCaso('CP04', 'Disponibilidad sin bloques configurados', cp04_sinDisponibilidad)
  await ejecutarCaso('CP05', 'Reserva de cita en horario disponible', cp05_reservar)
  await ejecutarCasoApi('CP06', 'Reserva simultánea del mismo horario', cp06_simultanea)
  await ejecutarCaso('CP07', 'Cancelación de cita pendiente', cp07_cancelar)
  await ejecutarCaso('CP08', 'Reprogramación fuera de disponibilidad', cp08_reprogramarInvalido)

  const aprob = resultados.filter((r) => r.estado === 'APROBADO').length
  const obs = resultados.filter((r) => r.estado === 'OBSERVADO').length
  const fail = resultados.filter((r) => r.estado === 'FALLIDO').length
  console.log(`\nResumen: ${aprob} aprobado(s), ${obs} observado(s), ${fail} fallido(s), ${resultados.length} total`)

  const { htmlPath, mdPath } = escribirInforme(evidencia, resultados, { inicio: inicioIso })
  console.log(`Informe MD:   ${mdPath}`)
  console.log(`Informe HTML: ${htmlPath}\n`)

  for (const r of resultados) {
    if (r.detalle) console.log(`  ${r.id}: ${r.detalle}`)
    if (r.nota) console.log(`  ${r.id}: ${r.nota}`)
  }

  const criticos = ['CP01', 'CP02', 'CP03', 'CP05', 'CP07']
  const criticalFail = resultados.some((r) => criticos.includes(r.id) && r.estado === 'FALLIDO')
  if (criticalFail) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
