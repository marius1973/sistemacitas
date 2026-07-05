import client from './client'

export const registrarHistorialCita = (citaId, datos) =>
  client.post(`/historial/cita/${citaId}`, datos).then((r) => r.data)

export const listarHistorialPaciente = (pacienteId) =>
  client.get(`/historial/paciente/${pacienteId}`).then((r) => r.data)
