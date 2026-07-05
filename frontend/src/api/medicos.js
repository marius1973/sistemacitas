import client from './client'

export const listarMedicos = (especialidadId) =>
  client.get('/medicos', { params: especialidadId ? { especialidadId } : {} }).then((r) => r.data)

export const obtenerMedico = (id) =>
  client.get(`/medicos/${id}`).then((r) => r.data)

export const crearMedico = (datos) =>
  client.post('/medicos', datos).then((r) => r.data)

export const actualizarMedico = (id, datos) =>
  client.put(`/medicos/${id}`, datos).then((r) => r.data)

export const desactivarMedico = (id) =>
  client.patch(`/medicos/${id}/desactivar`).then((r) => r.data)

export const activarMedico = (id) =>
  client.patch(`/medicos/${id}/activar`).then((r) => r.data)
