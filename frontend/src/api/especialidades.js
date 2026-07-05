import client from './client'

export const listarEspecialidades = () =>
  client.get('/especialidades').then((r) => r.data)

export const crearEspecialidad = (datos) =>
  client.post('/especialidades', datos).then((r) => r.data)
