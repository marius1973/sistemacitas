import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import * as citasApi from '../../api/citas'
import * as historialApi from '../../api/historial'
import { extraerMensajeError } from '../../api/errors'

const ESTADOS_ATENDIBLES = ['PENDIENTE', 'CONFIRMADA', 'REPROGRAMADA']

export default function AgendaDelDia() {
  const { usuario } = useAuth()
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [citas, setCitas] = useState([])
  const [citaSeleccionada, setCitaSeleccionada] = useState(null)
  const [form, setForm] = useState({ diagnostico: '', tratamiento: '', notas: '' })
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const cargar = () => {
    setCargando(true)
    setError('')
    citasApi.listarAgendaMedico(usuario.id, fecha)
      .then(setCitas)
      .catch((err) => setError(extraerMensajeError(err, 'No se pudo cargar la agenda')))
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargar() }, [fecha])

  const cambiarEstado = async (citaId, estado) => {
    setError('')
    try {
      await citasApi.cambiarEstadoCita(citaId, estado)
      cargar()
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo cambiar el estado'))
    }
  }

  const abrirAtencion = (cita) => {
    setCitaSeleccionada(cita)
    setForm({ diagnostico: '', tratamiento: '', notas: '' })
    setError('')
    setMensaje('')
  }

  const cerrarAtencion = () => {
    setCitaSeleccionada(null)
    setForm({ diagnostico: '', tratamiento: '', notas: '' })
  }

  const actualizar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  const guardarHistorial = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setError('')
    setMensaje('')
    try {
      await historialApi.registrarHistorialCita(citaSeleccionada.id, form)
      setMensaje(`Historial registrado para ${citaSeleccionada.pacienteNombre}.`)
      cerrarAtencion()
      cargar()
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo registrar el historial'))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="container">
      <h2>Mi agenda</h2>
      {error && !citaSeleccionada && <p className="mensaje-error">{error}</p>}
      {mensaje && <p className="mensaje-ok">{mensaje}</p>}

      <div className="card">
        <label>Fecha</label>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </div>

      {cargando && <p>Cargando agenda...</p>}

      {!cargando && citas.length === 0 && !error && (
        <p>No hay citas para esta fecha.</p>
      )}

      {citas.length > 0 && (
        <div className="card">
          <table>
            <thead>
              <tr><th>Hora</th><th>Paciente</th><th>Motivo</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              {citas.map((c) => (
                <tr key={c.id}>
                  <td>{c.horaInicio}</td>
                  <td>{c.pacienteNombre}</td>
                  <td>{c.motivo || '—'}</td>
                  <td><span className={`estado estado-${c.estado}`}>{c.estado}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {['PENDIENTE', 'REPROGRAMADA'].includes(c.estado) && (
                        <button onClick={() => cambiarEstado(c.id, 'CONFIRMADA')}>Confirmar</button>
                      )}
                      {['PENDIENTE', 'CONFIRMADA', 'REPROGRAMADA'].includes(c.estado) && (
                        <button onClick={() => cambiarEstado(c.id, 'NO_ASISTIO')} style={{ background: '#6b7280' }}>
                          No asistio
                        </button>
                      )}
                      {ESTADOS_ATENDIBLES.includes(c.estado) && (
                        <button onClick={() => abrirAtencion(c)}>Atender</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {citaSeleccionada && (
        <div className="card">
          <h3>Registrar atencion — {citaSeleccionada.pacienteNombre}</h3>
          <p>{citaSeleccionada.fecha} · {citaSeleccionada.horaInicio}</p>
          <form onSubmit={guardarHistorial}>
            <label>Diagnostico *</label>
            <textarea rows={3} value={form.diagnostico} onChange={actualizar('diagnostico')} required disabled={guardando} />

            <label>Tratamiento</label>
            <textarea rows={2} value={form.tratamiento} onChange={actualizar('tratamiento')} disabled={guardando} />

            <label>Notas</label>
            <textarea rows={2} value={form.notas} onChange={actualizar('notas')} disabled={guardando} />

            {error && <p className="mensaje-error">{error}</p>}

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="submit" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar historial'}
              </button>
              <button type="button" onClick={cerrarAtencion} disabled={guardando} style={{ background: '#6b7280' }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
