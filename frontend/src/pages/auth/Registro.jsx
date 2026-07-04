import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registrarPaciente } from '../../api/auth'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Registro() {
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', telefono: '' })
  const [error, setError] = useState('')
  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()

  const actualizar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await registrarPaciente(form)
      await iniciarSesion(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError('No se pudo completar el registro')
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 420, margin: '40px auto' }}>
        <h2>Registro de paciente</h2>
        <form onSubmit={handleSubmit}>
          <input placeholder="Nombre" value={form.nombre} onChange={actualizar('nombre')} required />
          <input placeholder="Apellido" value={form.apellido} onChange={actualizar('apellido')} required />
          <input type="email" placeholder="Email" value={form.email} onChange={actualizar('email')} required />
          <input type="password" placeholder="Contrasena" value={form.password} onChange={actualizar('password')} required />
          <input placeholder="Telefono" value={form.telefono} onChange={actualizar('telefono')} />
          {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
          <button type="submit">Crear cuenta</button>
        </form>
      </div>
    </div>
  )
}
