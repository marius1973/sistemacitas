import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { extraerMensajeError } from '../../api/errors'
import { despertarServidor } from '../../api/health'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [servidorListo, setServidorListo] = useState(false)
  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    despertarServidor().then((data) => setServidorListo(Array.isArray(data)))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      await iniciarSesion(email.trim().toLowerCase(), password)
      navigate('/')
    } catch (err) {
      setError(extraerMensajeError(err, 'Credenciales invalidas'))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 400, margin: '40px auto' }}>
        <h2>Iniciar sesion</h2>
        {!servidorListo && (
          <p className="mensaje-info">Despertando servidor... (plan free de Render, puede tardar ~1 min)</p>
        )}
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email}
                 onChange={(e) => setEmail(e.target.value)} required disabled={cargando} />
          <input type="password" placeholder="Contrasena" value={password}
                 onChange={(e) => setPassword(e.target.value)} required disabled={cargando} />
          {error && <p className="mensaje-error">{error}</p>}
          {cargando && (
            <p className="mensaje-info">Conectando con el servidor, espera un momento...</p>
          )}
          <button type="submit" disabled={cargando}>{cargando ? 'Entrando...' : 'Entrar'}</button>
        </form>
        <p>¿No tienes cuenta? <Link to="/registro">Registrate</Link></p>
        <p><Link to="/recuperar-contrasena">¿Olvidaste tu contrasena?</Link></p>
      </div>
    </div>
  )
}
