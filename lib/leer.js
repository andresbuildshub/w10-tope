// The ONLY place an LLM touches Tope: reading 4 fields off a screenshot of a cuota screen.
// It never decides, never advises, never writes anything he'll read as an opinion.

export const MODELO = 'google/gemini-2.5-flash-lite' // served by the class19 AI Gateway free tier (Week 9)
export const TIPOS = ['image/png', 'image/jpeg', 'image/webp']
export const MAX_BYTES = 4 * 1024 * 1024

export const SISTEMA = `Lees capturas de pantalla de apps de pagos a plazos en México (por ejemplo Kueski Pay, Aplazo, Mercado Pago, Coppel, tarjetas con meses sin intereses).
Extrae SOLO estos 4 campos de UNA deuda: el próximo pago, no el total de la compra.
Responde SOLO con JSON, sin texto extra:
{"prestamista": string,
 "monto": número (lo que se paga en CADA pago, en pesos, sin signo),
 "frecuencia": "semanal" | "catorcenal" | "quincenal" | "mensual",
 "pagosRestantes": número entero (pagos que faltan, incluyendo el próximo),
 "seguro": {"prestamista": bool, "monto": bool, "frecuencia": bool, "pagosRestantes": bool}}
Marca seguro=true SOLO si el dato aparece escrito claramente en la imagen. Si lo deduces, lo calculas o no se ve, pon seguro=false.
Si un dato no aparece, usa null. No inventes. No des consejos ni opiniones.`
