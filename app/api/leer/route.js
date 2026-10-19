import { generateText } from 'ai'
import { MODELO, SISTEMA, TIPOS, MAX_BYTES } from '../../../lib/leer'
import { filtrarLectura } from '../../../lib/tope'

export const maxDuration = 30
const golpes = new Map()
function excedido(ip) {
  const ahora = Date.now()
  const r = (golpes.get(ip) || []).filter(t => ahora - t < 10 * 60 * 1000)
  r.push(ahora); golpes.set(ip, r)
  return r.length > 12
}

// Stateless: the image lives only in this request's memory. Nothing is stored or logged about it.
export async function POST(req) {
  const tam = Number(req.headers.get('content-length') || 0)
  if (tam > MAX_BYTES + 64 * 1024) return Response.json({ error: 'La imagen pesa más de 4 MB.' }, { status: 413 })
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local'
  if (excedido(ip)) return Response.json({ error: 'Demasiadas capturas seguidas. Espera unos minutos o escríbelo a mano.' }, { status: 429 })

  let archivo
  try { archivo = (await req.formData()).get('imagen') } catch { return Response.json({ error: 'Solicitud inválida' }, { status: 400 }) }
  if (!archivo || typeof archivo === 'string') return Response.json({ error: 'Falta la imagen' }, { status: 400 })
  if (!TIPOS.includes(archivo.type)) return Response.json({ error: 'Solo PNG, JPG o WEBP.' }, { status: 415 })
  if (archivo.size > MAX_BYTES) return Response.json({ error: 'La imagen pesa más de 4 MB.' }, { status: 413 })
  const bytes = new Uint8Array(await archivo.arrayBuffer())

  try {
    const { text } = await generateText({
      model: MODELO, system: SISTEMA, temperature: 0, maxOutputTokens: 200,
      messages: [{ role: 'user', content: [
        { type: 'text', text: 'Lee esta captura y responde solo el JSON.' },
        { type: 'image', image: bytes, mediaType: archivo.type },
      ] }],
    })
    const lectura = filtrarLectura(text)
    if (!lectura) return Response.json({ modo: 'real', modelo: MODELO, lectura: null, motivo: 'El modelo no encontró una cuota en la imagen.' })
    return Response.json({ modo: 'real', modelo: MODELO, lectura })
  } catch (e) {
    const msg = String(e?.message || '') + ' ' + String(e?.responseBody || '')
    console.error('leer:', e?.name, msg.slice(0, 160))
    const motivo = /403|forbidden|free tier|credit card|customer_verification/i.test(msg) ? 'El plan gratuito de AI Gateway no dio acceso al modelo.'
      : /429|rate/i.test(msg) ? 'AI Gateway limitó las solicitudes del plan gratuito.'
      : 'No se pudo llamar al modelo.'
    return Response.json({ modo: 'simulado', motivo, lectura: null })
  }
}
