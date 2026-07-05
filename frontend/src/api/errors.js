export function extraerMensajeError(err, fallback) {
  if (!err?.response) {
    const api = import.meta.env.VITE_API_URL || '/api (proxy Vercel → Render)'
    return `No se pudo conectar con el servidor (${api}). Si usas Vercel, revisa vercel.json o VITE_API_URL y redeploy.`
  }

  if (err.response.status === 405) {
    return 'Error HTTP 405: el registro/login no llega al backend en Render. Redeploy en Vercel y verifica que VITE_API_URL sea https://sistema-citas-api.onrender.com/api (o elimina esa variable en Vercel para usar .env.production).'
  }

  const data = err.response.data
  if (typeof data === 'object' && data !== null) {
    return data.mensaje || data.message || fallback
  }

  return `${fallback} (HTTP ${err.response.status})`
}
