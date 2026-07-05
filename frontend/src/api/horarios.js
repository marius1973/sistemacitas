import client from './client'

export const listarHorariosMedico = (medicoId) =>
  client.get(`/horarios/medico/${medicoId}`).then((r) => r.data)

export const crearHorario = (datos) =>
  client.post('/horarios', datos).then((r) => r.data)

export const activarHorario = (id) =>
  client.patch(`/horarios/${id}/activar`).then((r) => r.data)

export const desactivarHorario = (id) =>
  client.patch(`/horarios/${id}/desactivar`).then((r) => r.data)
