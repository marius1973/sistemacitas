import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registrarPaciente } from '../../api/auth'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Registro() {
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', telefono: '' })
  const [error, setError] = useState('')
  const { guardarSesion } = useAuth()
  const navigate = useNavigate()

  const actualizar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const data = await registrarPaciente({
        ...form,
        email: form.email.trim().toLowerCase(),
      })
      guardarSesion(data)
      navigate('/')
    } catch (err) {
      if (!err.response) {
        setError('No se pudo conectar con el servidor. Revisa que VITE_API_URL apunte al backend en Render.')
      } else {
        setError(err.response.data?.mensaje || 'No se pudo completar el registro')
      }
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
