export function extraerMensajeError(err, fallback) {
  if (!err?.response) {
    const api = import.meta.env.VITE_API_URL || '(no configurada — usa proxy local)'
    return `No se pudo conectar con el servidor (${api}). Si usas Vercel, configura VITE_API_URL y redeploy.`
  }

  const data = err.response.data
  if (typeof data === 'object' && data !== null) {
    return data.mensaje || data.message || fallback
  }

  return `${fallback} (HTTP ${err.response.status})`
}
