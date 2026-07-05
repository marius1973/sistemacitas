import { useEffect, useState } from 'react'
import * as citasApi from '../../api/citas'
import { extraerMensajeError } from '../../api/errors'

const REPROGRAMABLES = ['PENDIENTE', 'CONFIRMADA', 'REPROGRAMADA']

export default function MisCitas() {
  const [citas, setCitas] = useState([])
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(true)
  const [citaReprogramar, setCitaReprogramar] = useState(null)
  const [fecha, setFecha] = useState('')
  const [disponibilidad, setDisponibilidad] = useState([])
  const [reprogramando, setReprogramando] = useState(false)

  const cargar = () => {
    setCargando(true)
    setError('')
    return citasApi.listarMisCitas()
      .then(setCitas)
      .catch((err) => setError(extraerMensajeError(err, 'No se pudieron cargar tus citas')))
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargar() }, [])

  useEffect(() => {
    if (!citaReprogramar || !fecha) return
    citasApi.obtenerDisponibilidad(citaReprogramar.medicoId, fecha)
      .then(setDisponibilidad)
      .catch((err) => setError(extraerMensajeError(err, 'No se pudo cargar disponibilidad')))
  }, [citaReprogramar, fecha])

  const cancelar = async (id) => {
    setError('')
    try {
      await citasApi.cancelarCita(id)
      await cargar()
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo cancelar la cita'))
    }
  }

  const abrirReprogramar = (cita) => {
    setCitaReprogramar(cita)
    setFecha('')
    setDisponibilidad([])
    setMensaje('')
    setError('')
  }

  const cerrarReprogramar = () => {
    setCitaReprogramar(null)
    setFecha('')
    setDisponibilidad([])
  }

  const reprogramar = async (horaInicio) => {
    setReprogramando(true)
    setError('')
    try {
      await citasApi.reprogramarCita(citaReprogramar.id, { fecha, horaInicio })
      setMensaje('Cita reprogramada correctamente.')
      cerrarReprogramar()
      await cargar()
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo reprogramar la cita'))
    } finally {
      setReprogramando(false)
    }
  }

  return (
    <div className="container">
      <h2>Mis citas</h2>
      {error && <p className="mensaje-error">{error}</p>}
      {mensaje && <p className="mensaje-ok">{mensaje}</p>}
      {cargando && <p>Cargando citas...</p>}
      {!cargando && citas.length === 0 && !error && (
        <p>No tienes citas registradas.</p>
      )}
      {citas.length > 0 && (
        <div className="card">
          <table>
            <thead>
              <tr><th>Fecha</th><th>Hora</th><th>Medico</th><th>Especialidad</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              {citas.map((c) => (
                <tr key={c.id}>
                  <td>{c.fecha}</td>
                  <td>{c.horaInicio}</td>
                  <td>{c.medicoNombre}</td>
                  <td>{c.especialidad}</td>
                  <td><span className={`estado estado-${c.estado}`}>{c.estado}</span></td>
                  <td style={{ display: 'flex', gap: 4 }}>
                    {REPROGRAMABLES.includes(c.estado) && (
                      <button onClick={() => abrirReprogramar(c)}>Reprogramar</button>
                    )}
                    {c.estado !== 'CANCELADA' && c.estado !== 'COMPLETADA' && c.estado !== 'NO_ASISTIO' && (
                      <button onClick={() => cancelar(c.id)} style={{ background: '#dc2626' }}>Cancelar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {citaReprogramar && (
        <div className="card">
          <h3>Reprogramar cita con {citaReprogramar.medicoNombre}</h3>
          <p>Actual: {citaReprogramar.fecha} · {citaReprogramar.horaInicio}</p>
          <label>Nueva fecha</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} disabled={reprogramando} />
          {disponibilidad.length > 0 && (
            <>
              <h4>Horarios disponibles</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {disponibilidad.map((d, i) => (
                  <button key={i} disabled={!d.disponible || reprogramando}
                          onClick={() => reprogramar(d.horaInicio)}
                          style={{ opacity: d.disponible ? 1 : 0.4 }}>
                    {d.horaInicio}
                  </button>
                ))}
              </div>
            </>
          )}
          <button onClick={cerrarReprogramar} style={{ marginTop: 8, background: '#6b7280' }} disabled={reprogramando}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}
