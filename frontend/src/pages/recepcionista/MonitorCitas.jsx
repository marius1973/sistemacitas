import { useEffect, useState } from 'react'
import * as citasApi from '../../api/citas'
import * as medicosApi from '../../api/medicos'
import { extraerMensajeError } from '../../api/errors'

const CAMBIABLES = ['PENDIENTE', 'REPROGRAMADA']

export default function MonitorCitas() {
  const [medicos, setMedicos] = useState([])
  const [medicoId, setMedicoId] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [citas, setCitas] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    medicosApi.listarMedicos().then(setMedicos).catch(() => {})
  }, [])

  const buscar = async () => {
    if (!medicoId || !fecha) return
    setError('')
    try {
      const datos = await citasApi.listarAgendaMedico(medicoId, fecha)
      setCitas(datos)
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo cargar la agenda'))
    }
  }

  useEffect(() => { if (medicoId) buscar() }, [])

  const cambiarEstado = async (id, estado) => {
    setError('')
    try {
      await citasApi.cambiarEstadoCita(id, estado)
      await buscar()
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo cambiar el estado'))
    }
  }

  return (
    <div className="container">
      <h2>Monitoreo de citas</h2>
      {error && <p className="mensaje-error">{error}</p>}
      <div className="card">
        <label>Medico</label>
        <select value={medicoId} onChange={(e) => setMedicoId(e.target.value)}>
          <option value="">Seleccione...</option>
          {medicos.map((m) => (
            <option key={m.id} value={m.id}>{m.nombre} {m.apellido} — {m.especialidadNombre}</option>
          ))}
        </select>
        <label>Fecha</label>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <button onClick={buscar}>Buscar</button>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Hora</th><th>Paciente</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {citas.map((c) => (
              <tr key={c.id}>
                <td>{c.horaInicio}</td>
                <td>{c.pacienteNombre}</td>
                <td><span className={`estado estado-${c.estado}`}>{c.estado}</span></td>
                <td style={{ display: 'flex', gap: 4 }}>
                  {CAMBIABLES.includes(c.estado) && (
                    <button onClick={() => cambiarEstado(c.id, 'CONFIRMADA')}>Confirmar</button>
                  )}
                  {['PENDIENTE', 'CONFIRMADA', 'REPROGRAMADA'].includes(c.estado) && (
                    <button onClick={() => cambiarEstado(c.id, 'NO_ASISTIO')} style={{ background: '#6b7280' }}>
                      No asistio
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
