import { useEffect, useState } from 'react'
import * as espApi from '../../api/especialidades'
import { extraerMensajeError } from '../../api/errors'

export default function GestionEspecialidades() {
  const [especialidades, setEspecialidades] = useState([])
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  const cargar = () => espApi.listarEspecialidades().then(setEspecialidades)

  useEffect(() => { cargar() }, [])

  const crear = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    setMensaje('')
    try {
      await espApi.crearEspecialidad({ nombre, descripcion })
      setMensaje('Especialidad creada.')
      setNombre('')
      setDescripcion('')
      cargar()
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo crear la especialidad'))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="container">
      <h2>Especialidades</h2>
      {error && <p className="mensaje-error">{error}</p>}
      {mensaje && <p className="mensaje-ok">{mensaje}</p>}

      <div className="card">
        <h3>Nueva especialidad</h3>
        <form onSubmit={crear}>
          <label>Nombre</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required disabled={cargando} />
          <label>Descripcion</label>
          <textarea rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} disabled={cargando} />
          <button type="submit" disabled={cargando}>{cargando ? 'Guardando...' : 'Crear'}</button>
        </form>
      </div>

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
