import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { CASOS } from './casos.js'
import { BASE_URL, API_URL } from './helpers.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function crearCarpetaEvidencia() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const dir = path.join(__dirname, 'evidencia', stamp)
  fs.mkdirSync(path.join(dir, 'capturas'), { recursive: true })
  // Puntero "latest" para la documentación
  const latest = path.join(__dirname, 'evidencia', 'latest')
  fs.rmSync(latest, { recursive: true, force: true })
  fs.mkdirSync(path.join(latest, 'capturas'), { recursive: true })
  return { dir, latest, stamp }
}

export async function capturar(driver, evidencia, id, etiqueta = 'resultado') {
  if (!driver || !evidencia) return null
  const nombre = `${id}_${etiqueta}.png`
  const dest = path.join(evidencia.dir, 'capturas', nombre)
  const imagen = await driver.takeScreenshot()
  fs.writeFileSync(dest, imagen, 'base64')
  fs.copyFileSync(dest, path.join(evidencia.latest, 'capturas', nombre))
  return `capturas/${nombre}`
}

export function escribirInforme(evidencia, resultados, meta = {}) {
  const inicio = meta.inicio || new Date().toISOString()
  const fin = new Date().toISOString()
  const aprob = resultados.filter((r) => r.estado === 'APROBADO').length
  const obs = resultados.filter((r) => r.estado === 'OBSERVADO').length
  const fail = resultados.filter((r) => r.estado === 'FALLIDO').length

  const filas = CASOS.map((c) => {
    const r = resultados.find((x) => x.id === c.id) || {}
    return {
      ...c,
      estado: r.estado || 'NO EJECUTADO',
      ms: r.ms,
      detalle: r.detalle || r.nota || '',
      captura: r.captura || null,
    }
  })

  const md = generarMarkdown({ inicio, fin, aprob, obs, fail, filas, meta })
  const html = generarHtml({ inicio, fin, aprob, obs, fail, filas, meta })
  const json = {
    sistema: 'Sistema de Gestión de Citas Médicas — Clínica Grupo 8',
    herramienta: 'Selenium WebDriver 4 (Node.js + Chrome headless)',
    baseUrl: BASE_URL,
    apiUrl: API_URL,
    inicio,
    fin,
    resumen: { aprobados: aprob, observados: obs, fallidos: fail, total: resultados.length },
    casos: filas,
  }

  for (const root of [evidencia.dir, evidencia.latest]) {
    fs.writeFileSync(path.join(root, 'informe.md'), md, 'utf8')
    fs.writeFileSync(path.join(root, 'informe.html'), html, 'utf8')
    fs.writeFileSync(path.join(root, 'resultados.json'), JSON.stringify(json, null, 2), 'utf8')
  }

  return { mdPath: path.join(evidencia.latest, 'informe.md'), htmlPath: path.join(evidencia.latest, 'informe.html') }
}

function generarMarkdown({ inicio, fin, aprob, obs, fail, filas, meta }) {
  const lineas = [
    '# Evidencia de automatización Selenium',
    '',
    '## 1. Identificación del sistema',
    '',
    '| Campo | Valor |',
    '|---|---|',
    '| Sistema | Sistema de Gestión de Citas Médicas — Clínica Grupo 8 |',
    '| Frontend bajo prueba | `' + BASE_URL + '` |',
    '| API | `' + API_URL + '` |',
    '| Herramienta | Selenium WebDriver 4 + Chrome headless |',
    '| Scripts | `frontend/tests/selenium/run.js` |',
    '| Fecha de ejecución | ' + inicio + ' → ' + fin + ' |',
    '| Ejecutor | ' + (meta.ejecutor || process.env.USERNAME || process.env.USER || 'automatizado') + ' |',
    '',
    '## 2. Resumen de ejecución',
    '',
    `- **Aprobados:** ${aprob}`,
    `- **Observados:** ${obs}`,
    `- **Fallidos:** ${fail}`,
    `- **Total:** ${filas.length}`,
    '',
    '| ID | RF | Caso | Tipo | Estado | Tiempo | Evidencia |',
    '|---|---|---|---|---|---|---|',
  ]

  for (const f of filas) {
    const ev = f.captura ? `[captura](${f.captura})` : '—'
    lineas.push(
      `| ${f.id} | ${f.rf} | ${f.nombre} | ${f.tipo} | **${f.estado}** | ${f.ms ?? '—'} ms | ${ev} |`,
    )
  }

  lineas.push('', '## 3. Detalle por caso de prueba', '')

  for (const f of filas) {
    lineas.push(`### ${f.id} — ${f.nombre}`, '')
    lineas.push(`- **Requisito:** ${f.rf}`)
    lineas.push(`- **Módulo:** ${f.modulo}`)
    lineas.push(`- **Objetivo:** ${f.objetivo}`)
    lineas.push(`- **Datos de entrada:** ${f.datos}`)
    lineas.push(`- **Resultado esperado:** ${f.esperado}`)
    lineas.push(`- **Ruta / endpoint:** ${f.ruta}`)
    lineas.push(`- **Resultado obtenido:** ${f.estado}${f.detalle ? ` — ${f.detalle}` : ''}`)
    if (f.defecto) lineas.push(`- **Defecto relacionado:** ${f.defecto}`)
    if (f.captura) lineas.push('', `![${f.id}](${f.captura})`, '')
    else lineas.push('')
  }

  lineas.push(
    '## 4. Trazabilidad requisitos ↔ pruebas',
    '',
    '| Requisito | Caso(s) |',
    '|---|---|',
    '| RF01 Registro de paciente | CP01 |',
    '| RF02 Autenticación | CP02 |',
    '| RF03 Consulta de especialidades | CP03 |',
    '| RF04 Disponibilidad de médico | CP04 |',
    '| RF05 Reserva de cita | CP05, CP06 |',
    '| RNF05 Control de concurrencia | CP06 |',
    '| RF06 Cancelación de cita | CP07 |',
    '| RF07 Reprogramación de cita | CP08 |',
    '',
    '## 5. Cómo reproducir',
    '',
    '```powershell',
    'cd frontend',
    '$env:BASE_URL = "https://sistemacitas.vercel.app"',
    'npm run test:e2e',
    '```',
    '',
    'La evidencia se genera en `frontend/tests/selenium/evidencia/latest/`.',
    '',
  )

  return lineas.join('\n')
}

function generarHtml({ inicio, fin, aprob, obs, fail, filas, meta }) {
  const filasHtml = filas
    .map((f) => {
      const color =
        f.estado === 'APROBADO' ? '#166534' : f.estado === 'OBSERVADO' ? '#854d0e' : '#991b1b'
      const img = f.captura
        ? `<div class="shot"><img src="${f.captura}" alt="${f.id}"/></div>`
        : '<p class="muted">Sin captura (caso API o sin driver).</p>'
      return `
<section class="caso">
  <h3>${f.id} — ${f.nombre} <span style="color:${color}">[${f.estado}]</span></h3>
  <p><strong>RF:</strong> ${f.rf} · <strong>Módulo:</strong> ${esc(f.modulo)} · <strong>Tipo:</strong> ${esc(f.tipo)}</p>
  <p><strong>Objetivo:</strong> ${esc(f.objetivo)}</p>
  <p><strong>Esperado:</strong> ${esc(f.esperado)}</p>
  <p><strong>Obtenido:</strong> ${esc(f.estado)}${f.detalle ? ' — ' + esc(f.detalle) : ''} ${f.ms != null ? `(${f.ms} ms)` : ''}</p>
  ${f.defecto ? `<p><strong>Defecto:</strong> ${esc(f.defecto)}</p>` : ''}
  ${img}
</section>`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <title>Evidencia Selenium — Sistema de Citas Médicas</title>
  <style>
    body { font-family: Segoe UI, system-ui, sans-serif; margin: 24px; color: #111; background: #f8fafc; }
    h1,h2,h3 { color: #0f172a; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin-bottom: 16px; }
    table { border-collapse: collapse; width: 100%; background: #fff; }
    th, td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; font-size: 14px; }
    th { background: #f1f5f9; }
    .shot img { max-width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; margin-top: 8px; }
    .muted { color: #64748b; font-size: 14px; }
    .caso { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin: 16px 0; }
  </style>
</head>
<body>
  <h1>Evidencia de automatización Selenium</h1>
  <div class="card">
    <p><strong>Sistema:</strong> Gestión de Citas Médicas — Clínica Grupo 8</p>
    <p><strong>URL:</strong> ${esc(BASE_URL)}</p>
    <p><strong>API:</strong> ${esc(API_URL)}</p>
    <p><strong>Herramienta:</strong> Selenium WebDriver 4 + Chrome headless</p>
    <p><strong>Ejecución:</strong> ${esc(inicio)} → ${esc(fin)}</p>
    <p><strong>Ejecutor:</strong> ${esc(meta.ejecutor || process.env.USERNAME || 'automatizado')}</p>
    <p><strong>Resumen:</strong> ${aprob} aprobado(s), ${obs} observado(s), ${fail} fallido(s)</p>
  </div>
  <h2>Matriz de resultados</h2>
  <table>
    <thead><tr><th>ID</th><th>RF</th><th>Caso</th><th>Estado</th><th>ms</th></tr></thead>
    <tbody>
      ${filas
        .map(
          (f) =>
            `<tr><td>${f.id}</td><td>${esc(f.rf)}</td><td>${esc(f.nombre)}</td><td>${f.estado}</td><td>${f.ms ?? '—'}</td></tr>`,
        )
        .join('')}
    </tbody>
  </table>
  <h2>Detalle y capturas</h2>
  ${filasHtml}
</body>
</html>`
}

function esc(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
