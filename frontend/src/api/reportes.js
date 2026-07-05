import client from './client'

export const obtenerResumen = (desde, hasta) =>
  client.get('/reportes/resumen', { params: { desde, hasta } }).then((r) => r.data)
