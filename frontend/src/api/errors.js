export function extraerMensajeError(err, fallback) {
  if (!err?.response) {
    const api = import.meta.env.VITE_API_URL || '/api (proxy Vercel → Render)'
    return `No se pudo conectar con el servidor (${api}). Si usas Vercel, revisa vercel.json o VITE_API_URL y redeploy.`
  }

  if (err.response.status === 405) {
    return 'Error de configuracion (HTTP 405): el login no llega al backend. Actualiza la URL de Render en frontend/vercel.json o configura VITE_API_URL y redeploy.'
  }

  const data = err.response.data
  if (typeof data === 'object' && data !== null) {
    return data.mensaje || data.message || fallback
  }

  return `${fallback} (HTTP ${err.response.status})`
}
