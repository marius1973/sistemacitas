import client from './client'

export const login = (email, password) =>
  client.post('/auth/login', { email, password }).then((r) => r.data)

export const registrarPaciente = (datos) =>
  client.post('/auth/registro', datos).then((r) => r.data)

export const solicitarRecuperacion = (email) =>
  client.post('/auth/recuperar-contrasena', { email }).then((r) => r.data)

export const restablecerContrasena = (token, nuevaPassword) =>
  client.post('/auth/restablecer-contrasena', { token, nuevaPassword }).then((r) => r.data)

export const registrarStaff = (datos) =>
  client.post('/auth/registro-staff', datos).then((r) => r.data)
