import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function NavBar() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  const salir = () => { cerrarSesion(); navigate('/login') }

  return (
    <header className="site-header">
      <div className="site-banner">Clinica Grupo 8</div>
      <nav>
      <Link to="/">Inicio</Link>
      {usuario && <Link to="/notificaciones">Notificaciones</Link>}
      {usuario?.rol === 'PACIENTE' && <>
        <Link to="/reservar">Reservar cita</Link>
        <Link to="/mis-citas">Mis citas</Link>
      </>}
      {usuario?.rol === 'MEDICO' && <>
        <Link to="/agenda">Mi agenda</Link>
        <Link to="/horarios">Mis horarios</Link>
      </>}
      {usuario?.rol === 'RECEPCIONISTA' && <>
        <Link to="/monitoreo">Monitoreo</Link>
        <Link to="/horarios">Horarios</Link>
        <Link to="/reportes">Reportes</Link>
      </>}
      {usuario?.rol === 'ADMINISTRADOR' && <>
        <Link to="/monitoreo">Monitoreo</Link>
        <Link to="/especialidades">Especialidades</Link>
        <Link to="/medicos">Medicos</Link>
        <Link to="/usuarios">Personal</Link>
        <Link to="/horarios">Horarios</Link>
        <Link to="/reportes">Reportes</Link>
      </>}
      <div style={{ marginLeft: 'auto' }}>
        {usuario ? (
          <button onClick={salir}>Cerrar sesion</button>
        ) : (
          <Link to="/login" style={{ color: '#fff' }}>Iniciar sesion</Link>
        )}
      </div>
    </nav>
    </header>
  )
}
