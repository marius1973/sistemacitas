import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import * as citasApi from '../../api/citas'
import { extraerMensajeError } from '../../api/errors'

export default function ReservarCita() {
  const { usuario } = useAuth()
  const [especialidades, setEspecialidades] = useState([])
  const [medicos, setMedicos] = useState([])
  const [disponibilidad, setDisponibilidad] = useState([])
  const [especialidadId, setEspecialidadId] = useState('')
  const [medicoId, setMedicoId] = useState('')
  const [fecha, setFecha] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    setCargando(true)
    citasApi.listarEspecialidades()
      .then(setEspecialidades)
      .catch((err) => setError(extraerMensajeError(err, 'No se pudieron cargar las especialidades')))
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => {
    if (!especialidadId) return
    citasApi.listarMedicos(especialidadId)
      .then(setMedicos)
      .catch((err) => setError(extraerMensajeError(err, 'No se pudieron cargar los medicos')))
  }, [especialidadId])

  useEffect(() => {
    if (!medicoId || !fecha) return
    citasApi.obtenerDisponibilidad(medicoId, fecha)
      .then(setDisponibilidad)
      .catch((err) => setError(extraerMensajeError(err, 'No se pudo cargar la disponibilidad')))
  }, [medicoId, fecha])

  const reservar = async (horaInicio) => {
    setMensaje('')
    setError('')
    try {
      await citasApi.reservarCita({ pacienteId: usuario.id, medicoId, fecha, horaInicio })
      setMensaje('Cita reservada correctamente.')
      const datos = await citasApi.obtenerDisponibilidad(medicoId, fecha)
      setDisponibilidad(datos)
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo reservar la cita'))
    }
  }

  return (
    <div className="container">
      <h2>Reservar cita</h2>
      {error && <p className="mensaje-error">{error}</p>}
      {cargando && <p>Cargando especialidades...</p>}
      <div className="card">
        <label>Especialidad</label>
        <select value={especialidadId} onChange={(e) => setEspecialidadId(e.target.value)}>
          <option value="">Seleccione...</option>
          {especialidades.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>

        <label>Medico</label>
        <select value={medicoId} onChange={(e) => setMedicoId(e.target.value)} disabled={!especialidadId}>
          <option value="">Seleccione...</option>
          {medicos.map((m) => <option key={m.id} value={m.id}>{m.nombre} {m.apellido}</option>)}
        </select>

        <label>Fecha</label>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} disabled={!medicoId} />

        {mensaje && <p className="mensaje-ok">{mensaje}</p>}
      </div>

      {disponibilidad.length > 0 && (
        <div className="card">
          <h3>Horarios disponibles</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {disponibilidad.map((d, i) => (
              <button key={i} disabled={!d.disponible} onClick={() => reservar(d.horaInicio)}
                      style={{ opacity: d.disponible ? 1 : 0.4 }}>
                {d.horaInicio}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
