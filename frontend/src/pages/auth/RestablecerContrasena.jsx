import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import * as authApi from '../../api/auth'
import { extraerMensajeError } from '../../api/errors'

export default function RestablecerContrasena() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensaje('')
    setError('')
    if (password !== confirmar) {
      setError('Las contrasenas no coinciden')
      return
    }
    if (!token) {
      setError('Enlace invalido. Solicita uno nuevo desde recuperar contrasena.')
      return
    }
    setCargando(true)
    try {
      const res = await authApi.restablecerContrasena(token, password)
      setMensaje(res.mensaje)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(extraerMensajeError(err, 'No se pudo restablecer la contrasena'))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 400, margin: '40px auto' }}>
        <h2>Nueva contrasena</h2>
        <form onSubmit={handleSubmit}>
          <input type="password" placeholder="Nueva contrasena" value={password}
                 onChange={(e) => setPassword(e.target.value)} required minLength={6} disabled={cargando} />
          <input type="password" placeholder="Confirmar contrasena" value={confirmar}
                 onChange={(e) => setConfirmar(e.target.value)} required minLength={6} disabled={cargando} />
          {mensaje && <p className="mensaje-ok">{mensaje}</p>}
          {error && <p className="mensaje-error">{error}</p>}
          <button type="submit" disabled={cargando}>
            {cargando ? 'Guardando...' : 'Restablecer contrasena'}
          </button>
        </form>
        <p><Link to="/login">Volver al login</Link></p>
      </div>
    </div>
  )
}
