import { useEffect, useState } from 'react'
import * as citasApi from '../../api/citas'
import { extraerMensajeError } from '../../api/errors'

export default function MisCitas() {
  const [citas, setCitas] = useState([])
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)

  const cargar = () => {
    setCargando(true)
    setError('')
    return citasApi.listarMisCitas()
      .then(setCitas)
      .catch((err) => setError(extraerMensajeError(err, 'No se pudieron cargar tus citas')))
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargar() }, [])

  const cancelar = async (id) => {
    setError('')
    try {
      await citasApi.cancelarCita(id)
      await cargar()
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo cancelar la cita'))
    }
  }

  return (
    <div className="container">
      <h2>Mis citas</h2>
      {error && <p className="mensaje-error">{error}</p>}
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
                  <td>
                    {c.estado !== 'CANCELADA' && c.estado !== 'COMPLETADA' && (
                      <button onClick={() => cancelar(c.id)}>Cancelar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
