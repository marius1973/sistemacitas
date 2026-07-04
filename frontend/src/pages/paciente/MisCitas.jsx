import { useEffect, useState } from 'react'
import * as citasApi from '../../api/citas'

export default function MisCitas() {
  const [citas, setCitas] = useState([])

  const cargar = () => citasApi.listarMisCitas().then(setCitas)

  useEffect(() => { cargar() }, [])

  const cancelar = async (id) => {
    await citasApi.cancelarCita(id)
    cargar()
  }

  return (
    <div className="container">
      <h2>Mis citas</h2>
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
    </div>
  )
}
