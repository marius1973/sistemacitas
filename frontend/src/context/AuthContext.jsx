import { createContext, useContext, useState } from 'react'
import * as authApi from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('usuario')
    return guardado ? JSON.parse(guardado) : null
  })

  const guardarSesion = (data) => {
    const usuarioActual = { id: data.usuarioId, nombre: data.nombre, rol: data.rol }
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario', JSON.stringify(usuarioActual))
    setUsuario(usuarioActual)
    return usuarioActual
  }

  const iniciarSesion = async (email, password) => {
    const data = await authApi.login(email, password)
    return guardarSesion(data)
  }

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, iniciarSesion, guardarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
