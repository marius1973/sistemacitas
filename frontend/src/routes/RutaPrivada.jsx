import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * Protege una ruta segun sesion iniciada y, opcionalmente, roles permitidos.
 * Uso: <RutaPrivada roles={["MEDICO"]}><AgendaMedico /></RutaPrivada>
 */
export default function RutaPrivada({ children, roles }) {
  const { usuario } = useAuth()

  if (!usuario) return <Navigate to="/login" replace />
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/" replace />

  return children
}
