import { useEffect, useState } from 'react'
import * as citasApi from '../../api/citas'

/**
 * Vista de monitoreo para recepcion/administracion.
 * En este scaffold inicial consulta la agenda de un medico especifico;
 * en una siguiente iteracion se puede exponer un endpoint /api/citas
 * con filtros por fecha/estado para ver todas las citas de la clinica.
 */
export default function MonitorCitas() {
  const [medicoId, setMedicoId] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [citas, setCitas] = useState([])

  const buscar = async () => {
    if (medicoId && fecha) {
      const datos = await citasApi.listarAgendaMedico(medicoId, fecha)
      setCitas(datos)
    }
  }

  useEffect(() => { buscar() }, [])

  return (
    <div className="container">
      <h2>Monitoreo de citas</h2>
      <div className="card">
        <label>ID de medico</label>
        <input value={medicoId} onChange={(e) => setMedicoId(e.target.value)} />
        <label>Fecha</label>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <button onClick={buscar}>Buscar</button>
      </div>
      <div className="card">
        <table>
          <thead><tr><th>Hora</th><th>Paciente</th><th>Estado</th></tr></thead>
          <tbody>
            {citas.map((c) => (
              <tr key={c.id}>
                <td>{c.horaInicio}</td>
                <td>{c.pacienteNombre}</td>
                <td><span className={`estado estado-${c.estado}`}>{c.estado}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
