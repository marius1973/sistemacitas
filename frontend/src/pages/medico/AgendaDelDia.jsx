import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import * as citasApi from '../../api/citas'

export default function AgendaDelDia() {
  const { usuario } = useAuth()
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [citas, setCitas] = useState([])

  useEffect(() => {
    citasApi.listarAgendaMedico(usuario.id, fecha).then(setCitas)
  }, [fecha])

  return (
    <div className="container">
      <h2>Mi agenda</h2>
      <div className="card">
        <label>Fecha</label>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Hora</th><th>Paciente</th><th>Motivo</th><th>Estado</th></tr></thead>
          <tbody>
            {citas.map((c) => (
              <tr key={c.id}>
                <td>{c.horaInicio}</td>
                <td>{c.pacienteNombre}</td>
                <td>{c.motivo}</td>
                <td><span className={`estado estado-${c.estado}`}>{c.estado}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
