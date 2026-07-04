import { useAuth } from '../context/AuthContext.jsx'

export default function Inicio() {
  const { usuario } = useAuth()
  return (
    <div className="container">
      <div className="card">
        <h2>Bienvenido{usuario ? `, ${usuario.nombre}` : ''}</h2>
        <p>Sistema de Gestion de Citas Medicas.</p>
      </div>
    </div>
  )
}
