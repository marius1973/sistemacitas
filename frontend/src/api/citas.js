import client from './client'

export const listarEspecialidades = () =>
  client.get('/especialidades').then((r) => r.data)

export const listarMedicos = (especialidadId) =>
  client.get('/medicos', { params: { especialidadId } }).then((r) => r.data)

export const obtenerDisponibilidad = (medicoId, fecha) =>
  client.get(`/horarios/medico/${medicoId}/disponibilidad`, { params: { fecha } }).then((r) => r.data)

export const reservarCita = (datos) =>
  client.post('/citas', datos).then((r) => r.data)

export const cancelarCita = (id) =>
  client.patch(`/citas/${id}/cancelar`).then((r) => r.data)

export const reprogramarCita = (id, datos) =>
  client.patch(`/citas/${id}/reprogramar`, datos).then((r) => r.data)

export const cambiarEstadoCita = (id, estado) =>
  client.patch(`/citas/${id}/estado`, { estado }).then((r) => r.data)

export const listarMisCitas = () =>
  client.get('/citas/mis-citas').then((r) => r.data)

export const listarCitasPaciente = (pacienteId) =>
  client.get(`/citas/paciente/${pacienteId}`).then((r) => r.data)

export const listarAgendaMedico = (medicoId, fecha) =>
  client.get(`/citas/medico/${medicoId}/agenda`, { params: { fecha } }).then((r) => r.data)
