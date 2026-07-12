import { useEffect, useState } from 'react'
import * as medicosApi from '../../api/medicos'
import * as espApi from '../../api/especialidades'
import { extraerMensajeError } from '../../api/errors'

const formVacio = {
  nombre: '', apellido: '', email: '', password: '', telefono: '',
  numeroColegiado: '', especialidadId: '', biografia: '',
}

export default function GestionMedicos() {
  const [medicos, setMedicos] = useState([])
  const [especialidades, setEspecialidades] = useState([])
  const [form, setForm] = useState(formVacio)
  const [editandoId, setEditandoId] = useState(null)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  const cargar = () => {
    medicosApi.listarMedicos().then(setMedicos)
    espApi.listarEspecialidades().then(setEspecialidades)
  }

  useEffect(() => { cargar() }, [])

  const actualizar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  const limpiar = () => {
    setForm(formVacio)
    setEditandoId(null)
    setError('')
    setMensaje('')
  }

  const editar = (m) => {
    setEditandoId(m.id)
    setForm({
      nombre: m.nombre, apellido: m.apellido, email: m.email, password: '',
      telefono: m.telefono || '', numeroColegiado: m.numeroColegiado,
      especialidadId: String(m.especialidadId), biografia: m.biografia || '',
    })
    setMensaje('')
    setError('')
  }

  const guardar = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    setMensaje('')
    const datos = {
      ...form,
      especialidadId: Number(form.especialidadId),
      password: form.password || undefined,
    }
    try {
      if (editandoId) {
        await medicosApi.actualizarMedico(editandoId, datos)
        setMensaje('Medico actualizado.')
      } else {
        if (!form.password) {
          setError('La contrasena es obligatoria al crear un medico')
          return
        }
        await medicosApi.crearMedico(datos)
        setMensaje('Medico creado.')
      }
      limpiar()
      cargar()
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo guardar el medico'))
    } finally {
      setCargando(false)
    }
  }

  const toggleActivo = async (m) => {
    setError('')
    setMensaje('')
    try {
      const updated = m.activo !== false
        ? await medicosApi.desactivarMedico(m.id)
        : await medicosApi.activarMedico(m.id)
      setMedicos((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      setMensaje(updated.activo ? 'Medico activado.' : 'Medico desactivado.')
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo cambiar el estado'))
    }
  }

  return (
    <div className="container">
      <h2>Gestion de medicos</h2>
      {error && <p className="mensaje-error">{error}</p>}
      {mensaje && <p className="mensaje-ok">{mensaje}</p>}

      <div className="card">
        <h3>{editandoId ? 'Editar medico' : 'Nuevo medico'}</h3>
        <form onSubmit={guardar}>
          <label>Nombre</label>
          <input value={form.nombre} onChange={actualizar('nombre')} required disabled={cargando} />
          <label>Apellido</label>
          <input value={form.apellido} onChange={actualizar('apellido')} required disabled={cargando} />
          <label>Email</label>
          <input type="email" value={form.email} onChange={actualizar('email')} required disabled={cargando} />
          <label>Contrasena {editandoId && '(dejar vacio para no cambiar)'}</label>
          <input type="password" value={form.password} onChange={actualizar('password')}
                 minLength={6} disabled={cargando} required={!editandoId} />
          <label>Telefono</label>
          <input value={form.telefono} onChange={actualizar('telefono')} disabled={cargando} />
          <label>Numero colegiado</label>
          <input value={form.numeroColegiado} onChange={actualizar('numeroColegiado')} required disabled={cargando} />
          <label>Especialidad</label>
          <select value={form.especialidadId} onChange={actualizar('especialidadId')} required disabled={cargando}>
            <option value="">Seleccione...</option>
            {especialidades.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
          <label>Biografia</label>
          <textarea rows={2} value={form.biografia} onChange={actualizar('biografia')} disabled={cargando} />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="submit" disabled={cargando}>{cargando ? 'Guardando...' : 'Guardar'}</button>
            {editandoId && <button type="button" onClick={limpiar} style={{ background: '#6b7280' }}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Nombre</th><th>Email</th><th>Especialidad</th><th>Colegiado</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {medicos.map((m) => (
              <tr key={m.id}>
                <td>{m.nombre} {m.apellido}</td>
                <td>{m.email}</td>
                <td>{m.especialidadNombre}</td>
                <td>{m.numeroColegiado}</td>
                <td>
                  <span className={`estado ${m.activo !== false ? 'estado-CONFIRMADA' : 'estado-CANCELADA'}`}>
                    {m.activo !== false ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: 4 }}>
                  <button type="button" onClick={() => editar(m)}>Editar</button>
                  <button type="button" onClick={() => toggleActivo(m)}
                          style={{ background: m.activo !== false ? '#dc2626' : '#059669' }}>
                    {m.activo !== false ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
