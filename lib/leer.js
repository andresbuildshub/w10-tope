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
 "evidencia": {"prestamista": string|null, "monto": string|null, "frecuencia": string|null, "pagosRestantes": string|null}}
En "evidencia" copia LITERALMENTE el texto de la imagen del que sacaste cada dato, con su etiqueta y su valor juntos tal como aparecen (por ejemplo "Te faltan 4 pagos" o "Pagos restantes 3"), máximo 60 caracteres. Si ningún texto lo dice directamente, pon null.
Si un dato no aparece, usa null. No inventes. No des consejos ni opiniones.`
