import { useEffect, useState } from 'react'
import * as citasApi from '../../api/citas'

export default function GestionEspecialidades() {
  const [especialidades, setEspecialidades] = useState([])

  useEffect(() => { citasApi.listarEspecialidades().then(setEspecialidades) }, [])

  return (
    <div className="container">
      <h2>Especialidades</h2>
      <div className="card">
        <table>
          <thead><tr><th>Nombre</th><th>Descripcion</th></tr></thead>
          <tbody>
            {especialidades.map((e) => (
              <tr key={e.id}><td>{e.nombre}</td><td>{e.descripcion}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
