import { useEffect, useState } from 'react'
import * as authApi from '../../api/auth'
import * as espApi from '../../api/especialidades'
import { extraerMensajeError } from '../../api/errors'

const formVacio = {
  nombre: '', apellido: '', email: '', password: '', telefono: '',
  rol: 'RECEPCIONISTA', numeroColegiado: '', especialidadId: '', biografia: '',
}

export default function GestionUsuarios() {
  const [form, setForm] = useState(formVacio)
  const [especialidades, setEspecialidades] = useState([])
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => { espApi.listarEspecialidades().then(setEspecialidades) }, [])

  const actualizar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  const guardar = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    setMensaje('')
    const datos = {
      nombre: form.nombre,
      apellido: form.apellido,
      email: form.email.trim().toLowerCase(),
      password: form.password,
      telefono: form.telefono || null,
      rol: form.rol,
    }
    if (form.rol === 'MEDICO') {
      datos.numeroColegiado = form.numeroColegiado
      datos.especialidadId = Number(form.especialidadId)
      datos.biografia = form.biografia || null
    }
    try {
      const res = await authApi.registrarStaff(datos)
      setMensaje(res.mensaje)
      setForm(formVacio)
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo registrar el usuario'))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="container">
      <h2>Registrar personal</h2>
      <p>Crea cuentas de medico o recepcionista. Solo administradores.</p>
      {error && <p className="mensaje-error">{error}</p>}
      {mensaje && <p className="mensaje-ok">{mensaje}</p>}

      <div className="card">
        <form onSubmit={guardar}>
          <label>Rol</label>
          <select value={form.rol} onChange={actualizar('rol')} disabled={cargando}>
            <option value="RECEPCIONISTA">Recepcionista</option>
            <option value="MEDICO">Medico</option>
          </select>

          <label>Nombre</label>
          <input value={form.nombre} onChange={actualizar('nombre')} required disabled={cargando} />
          <label>Apellido</label>
          <input value={form.apellido} onChange={actualizar('apellido')} required disabled={cargando} />
          <label>Email</label>
          <input type="email" value={form.email} onChange={actualizar('email')} required disabled={cargando} />
          <label>Contrasena</label>
          <input type="password" value={form.password} onChange={actualizar('password')}
                 minLength={6} required disabled={cargando} />
          <label>Telefono</label>
          <input value={form.telefono} onChange={actualizar('telefono')} disabled={cargando} />

          {form.rol === 'MEDICO' && (
            <>
              <label>Numero colegiado</label>
              <input value={form.numeroColegiado} onChange={actualizar('numeroColegiado')}
                     required disabled={cargando} />
              <label>Especialidad</label>
              <select value={form.especialidadId} onChange={actualizar('especialidadId')}
                      required disabled={cargando}>
                <option value="">Seleccione...</option>
                {especialidades.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
              <label>Biografia</label>
              <textarea rows={2} value={form.biografia} onChange={actualizar('biografia')} disabled={cargando} />
            </>
          )}

          <button type="submit" disabled={cargando}>
            {cargando ? 'Registrando...' : 'Registrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
