import { useEffect, useState } from 'react'
import * as medicosApi from '../../api/medicos'
import * as horariosApi from '../../api/horarios'
import { extraerMensajeError } from '../../api/errors'

const DIAS = [
  { value: 'MONDAY', label: 'Lunes' },
  { value: 'TUESDAY', label: 'Martes' },
  { value: 'WEDNESDAY', label: 'Miercoles' },
  { value: 'THURSDAY', label: 'Jueves' },
  { value: 'FRIDAY', label: 'Viernes' },
  { value: 'SATURDAY', label: 'Sabado' },
  { value: 'SUNDAY', label: 'Domingo' },
]

const etiquetaDia = (valor) => DIAS.find((d) => d.value === valor)?.label || valor

export default function GestionHorarios() {
  const [medicos, setMedicos] = useState([])
  const [medicoId, setMedicoId] = useState('')
  const [horarios, setHorarios] = useState([])
  const [form, setForm] = useState({
    diaSemana: 'MONDAY',
    horaInicio: '08:00',
    horaFin: '12:00',
    duracionCitaMinutos: 30,
  })
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    medicosApi.listarMedicos()
      .then(setMedicos)
      .catch((err) => setError(extraerMensajeError(err, 'No se pudieron cargar los medicos')))
  }, [])

  const cargarHorarios = (id) => {
    if (!id) return
    setCargando(true)
    setError('')
    horariosApi.listarHorariosMedico(id)
      .then(setHorarios)
      .catch((err) => setError(extraerMensajeError(err, 'No se pudieron cargar los horarios')))
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargarHorarios(medicoId) }, [medicoId])

  const actualizar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  const validarFormulario = () => {
    if (!medicoId) {
      setError('Seleccione un medico antes de agregar el horario')
      return false
    }
    if (form.horaFin <= form.horaInicio) {
      setError('La hora de fin debe ser posterior a la hora de inicio')
      return false
    }
    const duracion = Number(form.duracionCitaMinutos)
    if (!duracion || duracion < 15 || duracion > 120) {
      setError('La duracion de la cita debe estar entre 15 y 120 minutos')
      return false
    }
    return true
  }

  const crear = async (e) => {
    e.preventDefault()
    setError('')
    setMensaje('')
    if (!validarFormulario()) return
    setCargando(true)
    try {
      const nuevo = await horariosApi.crearHorario({
        medicoId: Number(medicoId),
        diaSemana: form.diaSemana,
        horaInicio: form.horaInicio,
        horaFin: form.horaFin,
        duracionCitaMinutos: Number(form.duracionCitaMinutos),
      })
      setMensaje('Horario agregado correctamente.')
      setHorarios((prev) => [...prev, nuevo])
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo crear el horario'))
    } finally {
      setCargando(false)
    }
  }

  const toggleActivo = async (horario) => {
    setError('')
    setMensaje('')
    try {
      if (horario.activo) {
        await horariosApi.desactivarHorario(horario.id)
        setMensaje('Horario desactivado.')
      } else {
        await horariosApi.activarHorario(horario.id)
        setMensaje('Horario activado.')
      }
      cargarHorarios(medicoId)
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo actualizar el horario'))
    }
  }

  return (
    <div className="container">
      <h2>Horarios por medico</h2>
      {error && <p className="mensaje-error">{error}</p>}
      {mensaje && <p className="mensaje-ok">{mensaje}</p>}

      <div className="card">
        <label>Medico</label>
        <select value={medicoId} onChange={(e) => setMedicoId(e.target.value)}>
          <option value="">Seleccione un medico...</option>
          {medicos.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombre} {m.apellido} — {m.especialidadNombre}
            </option>
          ))}
        </select>
      </div>

      {medicoId && (
        <>
          <div className="card">
            <h3>Agregar horario</h3>
            <form onSubmit={crear}>
              <label>Dia de la semana</label>
              <select value={form.diaSemana} onChange={actualizar('diaSemana')}>
                {DIAS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>

              <label>Hora inicio</label>
              <input type="time" value={form.horaInicio} onChange={actualizar('horaInicio')} required />

              <label>Hora fin</label>
              <input type="time" value={form.horaFin} onChange={actualizar('horaFin')} required />

              <label>Duracion cita (minutos)</label>
              <input type="number" min="15" max="120" step="15"
                     value={form.duracionCitaMinutos} onChange={actualizar('duracionCitaMinutos')} required />

              <button type="submit" disabled={cargando}>
                {cargando ? 'Guardando...' : 'Agregar horario'}
              </button>
            </form>
          </div>

          <div className="card">
            <h3>Horarios registrados</h3>
            {cargando && <p>Cargando...</p>}
            {!cargando && horarios.length === 0 && <p>Este medico no tiene horarios configurados.</p>}
            {horarios.length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th>Dia</th><th>Inicio</th><th>Fin</th><th>Duracion</th><th>Estado</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {horarios.map((h) => (
                    <tr key={h.id}>
                      <td>{etiquetaDia(h.diaSemana)}</td>
                      <td>{String(h.horaInicio).slice(0, 5)}</td>
                      <td>{String(h.horaFin).slice(0, 5)}</td>
                      <td>{h.duracionCitaMinutos} min</td>
                      <td>
                        <span className={`estado ${h.activo ? 'estado-CONFIRMADA' : 'estado-CANCELADA'}`}>
                          {h.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <button type="button" onClick={() => toggleActivo(h)}>
                          {h.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
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
