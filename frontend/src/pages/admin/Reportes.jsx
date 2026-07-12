import { useState } from 'react'
import * as reportesApi from '../../api/reportes'
import { extraerMensajeError } from '../../api/errors'

const hoy = new Date().toISOString().slice(0, 10)
const inicioMes = hoy.slice(0, 8) + '01'

export default function Reportes() {
  const [desde, setDesde] = useState(inicioMes)
  const [hasta, setHasta] = useState(hoy)
  const [resumen, setResumen] = useState(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const generar = async () => {
    setCargando(true)
    setError('')
    try {
      const datos = await reportesApi.obtenerResumen(desde, hasta)
      setResumen(datos)
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo generar el reporte'))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="container">
      <h2>Reportes de citas</h2>
      <div className="card">
        <label>Desde</label>
        <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        <label>Hasta</label>
        <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        <button onClick={generar} disabled={cargando}>
          {cargando ? 'Generando...' : 'Generar reporte'}
        </button>
      </div>

      {error && <p className="mensaje-error">{error}</p>}

      {resumen && (
        <>
          <div className="card">
            <h3>Resumen general</h3>
            <p><strong>Total de citas:</strong> {resumen.totalCitas}</p>
          </div>

          <div className="card">
            <h3>Citas por estado</h3>
            {Object.keys(resumen.citasPorEstado).length === 0 ? (
              <p>Sin datos en el periodo.</p>
            ) : (
              <table>
                <thead><tr><th>Estado</th><th>Cantidad</th></tr></thead>
                <tbody>
                  {Object.entries(resumen.citasPorEstado).map(([estado, cant]) => (
                    <tr key={estado}>
                      <td><span className={`estado estado-${estado}`}>{estado}</span></td>
                      <td>{cant}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <h3>Citas por especialidad</h3>
            {Object.keys(resumen.citasPorEspecialidad).length === 0 ? (
              <p>Sin datos en el periodo.</p>
            ) : (
              <table>
                <thead><tr><th>Especialidad</th><th>Cantidad</th></tr></thead>
                <tbody>
                  {Object.entries(resumen.citasPorEspecialidad).map(([esp, cant]) => (
                    <tr key={esp}><td>{esp}</td><td>{cant}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
