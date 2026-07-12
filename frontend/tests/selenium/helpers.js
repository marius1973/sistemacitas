import { Builder, By, until } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'
import { Select } from 'selenium-webdriver/lib/select.js'

export const BASE_URL = (process.env.BASE_URL || 'http://localhost:5173').replace(/\/$/, '')
export const API_URL = process.env.API_URL || `${BASE_URL}/api`

export const DEMO = {
  paciente: { email: 'paciente@clinica.com', password: 'demo123' },
  paciente2: { email: 'paciente2@clinica.com', password: 'demo123' },
}

export async function crearDriver() {
  const options = new chrome.Options()
  options.addArguments('--headless=new', '--window-size=1280,900', '--disable-gpu', '--no-sandbox')
  return new Builder().forBrowser('chrome').setChromeOptions(options).build()
}

export async function irA(driver, path = '/') {
  await driver.get(`${BASE_URL}${path}`)
}

export async function esperarTexto(driver, texto, timeout = 15000) {
  await driver.wait(until.elementLocated(By.xpath(`//*[contains(normalize-space(.), "${texto}")]`)), timeout)
}

export async function esperarGone(driver, texto, timeout = 90000) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    const elementos = await driver.findElements(By.xpath(`//*[contains(normalize-space(.), "${texto}")]`))
    if (elementos.length === 0) return
    await driver.sleep(1500)
  }
  throw new Error(`El texto "${texto}" sigue visible tras ${timeout}ms`)
}

export async function limpiarSesion(driver) {
  await irA(driver, '/')
  await driver.executeScript('localStorage.clear(); sessionStorage.clear();')
}

export async function login(driver, email, password) {
  await irA(driver, '/login')
  await driver.wait(until.elementLocated(By.css('input[type="email"]')), 10000)
  try {
    await esperarGone(driver, 'Despertando servidor', 90000)
  } catch {
    /* continuar */
  }
  const emailInput = await driver.findElement(By.css('input[type="email"]'))
  const passwordInput = await driver.findElement(By.css('input[type="password"]'))
  await emailInput.clear()
  await emailInput.sendKeys(email)
  await passwordInput.clear()
  await passwordInput.sendKeys(password)
  await driver.findElement(By.css('button[type="submit"]')).click()
}

export async function esperarSesionPaciente(driver) {
  await driver.wait(until.elementLocated(By.xpath('//button[contains(., "Cerrar sesion")]')), 45000)
  await driver.findElement(By.linkText('Reservar cita'))
}

export async function seleccionarPorTexto(driver, selectCss, texto) {
  const select = new Select(await driver.findElement(By.css(selectCss)))
  await select.selectByVisibleText(texto)
}

/** Próximo día de la semana (1=lun … 7=dom). Si hoy es ese día, usa el de la semana siguiente. */
export function proximaFecha(diaSemanaIso) {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  const actual = d.getDay() || 7
  let delta = diaSemanaIso - actual
  if (delta <= 0) delta += 7
  d.setDate(d.getDate() + delta)
  return d.toISOString().slice(0, 10)
}

export function emailUnico(base = 'ana.torres') {
  return `${base}.${Date.now()}@correo.com`
}

export async function apiLogin(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`apiLogin ${res.status}: ${JSON.stringify(data)}`)
  return data
}

export async function apiReservar(token, body) {
  const res = await fetch(`${API_URL}/citas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, data }
}

export async function apiReprogramar(token, citaId, body) {
  const res = await fetch(`${API_URL}/citas/${citaId}/reprogramar`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, data }
}

export async function apiDisponibilidad(token, medicoId, fecha) {
  const res = await fetch(`${API_URL}/horarios/medico/${medicoId}/disponibilidad?fecha=${fecha}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json().catch(() => [])
  if (!res.ok) throw new Error(`disponibilidad ${res.status}`)
  return data
}

export async function apiMedicos(token, especialidadId) {
  const res = await fetch(`${API_URL}/medicos?especialidadId=${especialidadId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json().catch(() => [])
  if (!res.ok) throw new Error(`medicos ${res.status}`)
  return data
}

export async function apiEspecialidades() {
  const res = await fetch(`${API_URL}/especialidades`)
  const data = await res.json().catch(() => [])
  if (!res.ok) throw new Error(`especialidades ${res.status}`)
  return data
}

export async function setDateInput(driver, element, yyyyMmDd) {
  await driver.executeScript(
    `const input = arguments[0];
     const val = arguments[1];
     const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
     setter.call(input, val);
     input.dispatchEvent(new Event('input', { bubbles: true }));
     input.dispatchEvent(new Event('change', { bubbles: true }));`,
    element,
    yyyyMmDd,
  )
}
