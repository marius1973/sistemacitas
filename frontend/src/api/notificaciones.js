import client from './client'

export const listarNotificaciones = () =>
  client.get('/notificaciones/mis-notificaciones').then((r) => r.data)

export const contarNoLeidas = () =>
  client.get('/notificaciones/no-leidas').then((r) => r.data)

export const marcarLeida = (id) =>
  client.patch(`/notificaciones/${id}/leer`).then((r) => r.data)
