import client from './client'

/** Despierta el backend en Render (plan free) antes del login. */
export const despertarServidor = () =>
  client.get('/especialidades', { timeout: 120000 })
    .then((r) => r.data)
    .catch(() => null)
