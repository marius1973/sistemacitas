import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import Inicio from './pages/Inicio.jsx'
import Login from './pages/auth/Login.jsx'
import Registro from './pages/auth/Registro.jsx'
import ReservarCita from './pages/paciente/ReservarCita.jsx'
import MisCitas from './pages/paciente/MisCitas.jsx'
import AgendaDelDia from './pages/medico/AgendaDelDia.jsx'
import MonitorCitas from './pages/recepcionista/MonitorCitas.jsx'
import GestionEspecialidades from './pages/admin/GestionEspecialidades.jsx'
import RutaPrivada from './routes/RutaPrivada.jsx'

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        <Route path="/reservar" element={
          <RutaPrivada roles={['PACIENTE']}><ReservarCita /></RutaPrivada>
        } />
        <Route path="/mis-citas" element={
          <RutaPrivada roles={['PACIENTE']}><MisCitas /></RutaPrivada>
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
      </Routes>
    </>
  )
}
