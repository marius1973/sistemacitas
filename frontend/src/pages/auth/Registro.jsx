import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registrarPaciente } from '../../api/auth'
import { extraerMensajeError } from '../../api/errors'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Registro() {
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', telefono: '' })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const { guardarSesion } = useAuth()
  const navigate = useNavigate()

  const actualizar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      const data = await registrarPaciente({
        ...form,
        email: form.email.trim().toLowerCase(),
      })
      if (!data?.token) {
        setError('El servidor no devolvio una sesion valida.')
        return
      }
      guardarSesion(data)
      navigate('/')
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo completar el registro'))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 420, margin: '40px auto' }}>
        <h2>Registro de paciente</h2>
        <form onSubmit={handleSubmit}>
          <input placeholder="Nombre" value={form.nombre} onChange={actualizar('nombre')} required disabled={cargando} />
          <input placeholder="Apellido" value={form.apellido} onChange={actualizar('apellido')} required disabled={cargando} />
          <input type="email" placeholder="Email" value={form.email} onChange={actualizar('email')} required disabled={cargando} />
          <input type="password" placeholder="Contrasena" value={form.password} onChange={actualizar('password')} required disabled={cargando} />
          <input placeholder="Telefono" value={form.telefono} onChange={actualizar('telefono')} disabled={cargando} />
          {error && <p className="mensaje-error">{error}</p>}
          <button type="submit" disabled={cargando}>{cargando ? 'Registrando...' : 'Crear cuenta'}</button>
        </form>
      </div>
    </div>
  )
}
