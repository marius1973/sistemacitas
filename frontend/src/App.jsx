import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import Inicio from './pages/Inicio.jsx'
import Login from './pages/auth/Login.jsx'
import Registro from './pages/auth/Registro.jsx'
import RecuperarContrasena from './pages/auth/RecuperarContrasena.jsx'
import RestablecerContrasena from './pages/auth/RestablecerContrasena.jsx'
import ReservarCita from './pages/paciente/ReservarCita.jsx'
import MisCitas from './pages/paciente/MisCitas.jsx'
import AgendaDelDia from './pages/medico/AgendaDelDia.jsx'
import MonitorCitas from './pages/recepcionista/MonitorCitas.jsx'
import GestionEspecialidades from './pages/admin/GestionEspecialidades.jsx'
import GestionMedicos from './pages/admin/GestionMedicos.jsx'
import GestionUsuarios from './pages/admin/GestionUsuarios.jsx'
import GestionHorarios from './pages/admin/GestionHorarios.jsx'
import Reportes from './pages/admin/Reportes.jsx'
import Notificaciones from './pages/Notificaciones.jsx'
import RutaPrivada from './routes/RutaPrivada.jsx'

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
        <Route path="/restablecer-contrasena" element={<RestablecerContrasena />} />

        <Route path="/reservar" element={
          <RutaPrivada roles={['PACIENTE']}><ReservarCita /></RutaPrivada>
        } />
        <Route path="/mis-citas" element={
          <RutaPrivada roles={['PACIENTE']}><MisCitas /></RutaPrivada>
        } />
        <Route path="/notificaciones" element={
          <RutaPrivada roles={['PACIENTE', 'MEDICO', 'RECEPCIONISTA', 'ADMINISTRADOR']}>
            <Notificaciones />
          </RutaPrivada>
        } />

        <Route path="/agenda" element={
          <RutaPrivada roles={['MEDICO']}><AgendaDelDia /></RutaPrivada>
        } />

        <Route path="/monitoreo" element={
          <RutaPrivada roles={['RECEPCIONISTA', 'ADMINISTRADOR']}><MonitorCitas /></RutaPrivada>
        } />
        <Route path="/especialidades" element={
          <RutaPrivada roles={['ADMINISTRADOR']}><GestionEspecialidades /></RutaPrivada>
        } />
        <Route path="/medicos" element={
          <RutaPrivada roles={['ADMINISTRADOR']}><GestionMedicos /></RutaPrivada>
        } />
        <Route path="/usuarios" element={
          <RutaPrivada roles={['ADMINISTRADOR']}><GestionUsuarios /></RutaPrivada>
        } />
        <Route path="/horarios" element={
          <RutaPrivada roles={['MEDICO', 'ADMINISTRADOR', 'RECEPCIONISTA']}><GestionHorarios /></RutaPrivada>
        } />
        <Route path="/reportes" element={
          <RutaPrivada roles={['RECEPCIONISTA', 'ADMINISTRADOR']}><Reportes /></RutaPrivada>
        } />
      </Routes>
    </>
  )
}
