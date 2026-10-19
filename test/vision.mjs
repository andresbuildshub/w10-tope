// Vision accuracy log: the 4 invented demo screenshots vs the truth I wrote into them.
// Run: vercel env pull .env.local && set -a && source .env.local && node test/vision.mjs [--raw]
import { generateText } from 'ai'
import fs from 'node:fs'
import { MODELO, SISTEMA } from '../lib/leer.js'
import { filtrarLectura } from '../lib/tope.js'

const VERDAD = {
  kueski: { prestamista: 'Kueski Pay', monto: 812.5, frecuencia: 'quincenal', pagosRestantes: 4 },
  aplazo: { prestamista: 'Aplazo', monto: 649, frecuencia: 'quincenal', pagosRestantes: 3 },
  mercadopago: { prestamista: 'Mercado Pago', monto: 699, frecuencia: 'mensual', pagosRestantes: 8 }, // "Cuota 5 de 12": ambiguous on purpose (7 or 8)
  coppel: { prestamista: 'Coppel', monto: 415, frecuencia: 'quincenal', pagosRestantes: null }, // count not shown: must not be "seguro"
}
let malSeguro = 0, bien = 0, total = 0
for (const [n, v] of Object.entries(VERDAD)) {
  const bytes = new Uint8Array(fs.readFileSync(`public/demo/${n}.png`))
  const { text } = await generateText({ model: MODELO, system: SISTEMA, temperature: 0, maxOutputTokens: 200,
    messages: [{ role: 'user', content: [{ type: 'text', text: 'Lee esta captura y responde solo el JSON.' }, { type: 'image', image: bytes, mediaType: 'image/png' }] }] })
  if (process.argv.includes('--raw')) console.log(n, 'RAW:', text.replace(/\s+/g, ' '))
  const l = filtrarLectura(text)
  for (const k of Object.keys(v)) {
    total++
    const got = l?.[k]?.valor ?? null, ok = String(got).toLowerCase() === String(v[k]).toLowerCase() || (k === 'prestamista' && got && String(got).toLowerCase().includes(String(v[k]).toLowerCase().split(' ')[0]))
    if (ok) bien++
    if (!ok && l?.[k]?.seguro) malSeguro++
    console.log(`${n.padEnd(12)} ${k.padEnd(15)} verdad=${String(v[k]).padEnd(12)} leído=${String(got).padEnd(12)} seguro=${l?.[k]?.seguro ? 'sí' : 'no'} ${ok ? '✓' : '✗'}`)
  }
}
console.log(`\n${bien}/${total} campos correctos · ${malSeguro} errores marcados como "seguro" (el riesgo de un sí falso)`)
