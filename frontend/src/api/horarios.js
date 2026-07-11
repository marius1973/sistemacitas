import client from './client'

export const listarHorariosMedico = (medicoId) =>
  client.get(`/horarios/medico/${medicoId}`).then((r) => r.data)

export const crearHorario = (datos) => {
  const medicoId = Number(datos.medicoId)
  return client.post('/horarios', {
    ...datos,
    medicoId,
    // Compatibilidad con backend desplegado que espera medico.id en lugar de medicoId
    medico: { id: medicoId },
  }).then((r) => r.data)
}

export const activarHorario = (id) =>
  client.patch(`/horarios/${id}/activar`).then((r) => r.data)

export const desactivarHorario = (id) =>
  client.patch(`/horarios/${id}/desactivar`).then((r) => r.data)
