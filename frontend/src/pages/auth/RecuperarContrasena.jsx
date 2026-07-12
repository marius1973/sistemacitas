import { useState } from 'react'
import { Link } from 'react-router-dom'
import * as authApi from '../../api/auth'
import { extraerMensajeError } from '../../api/errors'

export default function RecuperarContrasena() {
  const [email, setEmail] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensaje('')
    setError('')
    setCargando(true)
    try {
      const res = await authApi.solicitarRecuperacion(email.trim().toLowerCase())
      setMensaje(res.mensaje)
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo procesar la solicitud'))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 400, margin: '40px auto' }}>
        <h2>Recuperar contrasena</h2>
        <p>Ingresa tu correo y te enviaremos un enlace para restablecer tu contrasena.</p>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email}
                 onChange={(e) => setEmail(e.target.value)} required disabled={cargando} />
          {mensaje && <p className="mensaje-ok">{mensaje}</p>}
          {error && <p className="mensaje-error">{error}</p>}
          <button type="submit" disabled={cargando}>
            {cargando ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>
        <p><Link to="/login">Volver al login</Link></p>
      </div>
    </div>
  )
}
