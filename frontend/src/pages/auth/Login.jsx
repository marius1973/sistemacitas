import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await iniciarSesion(email, password)
      navigate('/')
    } catch (err) {
      setError('Credenciales invalidas')
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 400, margin: '40px auto' }}>
        <h2>Iniciar sesion</h2>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email}
                 onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Contrasena" value={password}
                 onChange={(e) => setPassword(e.target.value)} required />
          {error && <p style={{ color: '#b91c1c' }}>{error}</p>}
          <button type="submit">Entrar</button>
        </form>
        <p>¿No tienes cuenta? <Link to="/registro">Registrate</Link></p>
      </div>
    </div>
  )
}
