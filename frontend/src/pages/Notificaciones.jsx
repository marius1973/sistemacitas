import { useEffect, useState } from 'react'
import * as notifApi from '../api/notificaciones'
import { extraerMensajeError } from '../api/errors'

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([])
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)

  const cargar = () => {
    setCargando(true)
    setError('')
    return notifApi.listarNotificaciones()
      .then(setNotificaciones)
      .catch((err) => setError(extraerMensajeError(err, 'No se pudieron cargar las notificaciones')))
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargar() }, [])

  const marcarLeida = async (id) => {
    try {
      await notifApi.marcarLeida(id)
      await cargar()
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo marcar como leida'))
    }
  }

  return (
    <div className="container">
      <h2>Notificaciones</h2>
      {error && <p className="mensaje-error">{error}</p>}
      {cargando && <p>Cargando...</p>}
      {!cargando && notificaciones.length === 0 && !error && (
        <p>No tienes notificaciones.</p>
      )}
      {notificaciones.length > 0 && (
        <div className="card">
          <table>
            <thead>
              <tr><th>Fecha</th><th>Tipo</th><th>Mensaje</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              {notificaciones.map((n) => (
                <tr key={n.id} style={{ opacity: n.leido ? 0.6 : 1 }}>
                  <td>{new Date(n.fechaEnvio).toLocaleString()}</td>
                  <td>{n.tipo}</td>
                  <td>{n.mensaje}</td>
                  <td>{n.leido ? 'Leida' : 'Nueva'}</td>
                  <td>
                    {!n.leido && (
                      <button onClick={() => marcarLeida(n.id)}>Marcar leida</button>
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
