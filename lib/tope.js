// Tope's rule engine. Pure functions, no LLM: the decision is arithmetic on HIS numbers and HIS rule.

export const FRECUENCIAS = {
  semanal: { nombre: 'cada semana', factor: 52 / 24 },
  catorcenal: { nombre: 'cada 14 días', factor: 26 / 24 },
  quincenal: { nombre: 'cada quincena', factor: 1 },
  mensual: { nombre: 'cada mes', factor: 0.5 },
}
export const RETRASOS = [0, 24, 48, 72]
const HORA = 3600 * 1000

const redondear = n => Math.round(n * 100) / 100
export function acotar(n, min, max) {
  const x = Number(n)
  if (!Number.isFinite(x)) return null
  return Math.min(max, Math.max(min, x))
}

// What one line costs him per quincena.
export function porQuincena(monto, frecuencia) {
  const f = FRECUENCIAS[frecuencia]
  const m = Number(monto)
  if (!f || !Number.isFinite(m) || m <= 0) return null
  return redondear(m * f.factor)
}

// Which rule answers right now: a looser pending rule waits for HIS delay; a tighter one applies at once.
export function reglaVigente(estado, ahora = Date.now()) {
  const r = estado?.regla
  if (!r) return null
  const p = estado?.pendiente
  if (p && ahora >= p.aplicaDesde) return { ...r, ...p.regla }
  return r
}

export function esMasFlexible(actual, nueva) {
  if (!actual) return false
  return nueva.topePct > actual.topePct || nueva.retrasoH < actual.retrasoH
}

// Saving a rule: returns the new state. Looser changes become pending for the CURRENT rule's delay (his own choice, zero allowed).
export function guardarRegla(estado, nueva, ahora = Date.now()) {
  const actual = reglaVigente(estado, ahora)
  const base = { ...estado, regla: actual ? { ...actual } : null, pendiente: null }
  if (actual && esMasFlexible(actual, nueva) && actual.retrasoH > 0) {
    return { ...base, pendiente: { regla: nueva, aplicaDesde: ahora + actual.retrasoH * HORA } }
  }
  return { ...base, regla: { ...nueva, desde: ahora } }
}

// The answer: 'no' | 'permite' | 'nose'. Uncertain never becomes yes.
export function veredicto({ regla, lineas = [], oferta }) {
  const faltan = []
  if (!regla || !(regla.quincena > 0) || !(regla.topePct > 0)) faltan.push('tu regla (quincena y tope)')
  const sinConfirmar = lineas.filter(l => !l.confirmada)
  for (const l of sinConfirmar) faltan.push(`la línea de ${l.prestamista || 'un prestamista'} (sin confirmar)`)
  const nueva = oferta ? porQuincena(oferta.monto, oferta.frecuencia) : null
  if (oferta && nueva === null) faltan.push('el monto y la frecuencia de la oferta')

  const actual = redondear(lineas.filter(l => l.confirmada).reduce((s, l) => s + (porQuincena(l.monto, l.frecuencia) || 0), 0))
  const limite = regla?.quincena > 0 ? redondear(regla.quincena * regla.topePct / 100) : null
  const conOferta = redondear(actual + (nueva || 0))
  const pct = v => (regla?.quincena > 0 ? Math.round(v / regla.quincena * 1000) / 10 : null)
  const r = { actual, nueva, conOferta, limite, pctActual: pct(actual), pctCon: pct(conOferta), faltan }

  if (faltan.length) return { tipo: 'nose', ...r }
  return { tipo: conOferta <= limite + 0.005 ? 'permite' : 'no', ...r }
}

// When does the stack end? The quincena number in which the last current line is paid off.
export function quincenasRestantes(linea) {
  const f = FRECUENCIAS[linea.frecuencia]
  if (!f || !(linea.pagosRestantes > 0)) return null
  return Math.ceil(linea.pagosRestantes / f.factor)
}

// Model readings outside the range are DISCARDED, not clamped: a misread 999,999 must not become a "sure" 200,000.
function enRango(n, min, max) {
  const x = Number(n)
  return Number.isFinite(x) && x >= min && x <= max ? x : null
}

// Whatever the vision model says, only these 4 fields survive, each with its own "seguro" flag.
export function filtrarLectura(salida) {
  let o = salida
  if (typeof salida === 'string') {
    const m = salida.match(/\{[\s\S]*\}/)
    try { o = JSON.parse(m ? m[0] : salida) } catch { return null }
  }
  if (!o || typeof o !== 'object') return null
  const seg = o.seguro && typeof o.seguro === 'object' ? o.seguro : {}
  const prest = typeof o.prestamista === 'string' ? o.prestamista.replace(/[^\p{L}\p{N} .&'-]/gu, '').trim().slice(0, 40) : ''
  const monto = enRango(o.monto, 1, 200000)
  const pagos = enRango(o.pagosRestantes, 1, 60)
  const frec = typeof o.frecuencia === 'string' && FRECUENCIAS[o.frecuencia] ? o.frecuencia : null
  const out = {
    prestamista: { valor: prest || null, seguro: !!prest && seg.prestamista === true },
    monto: { valor: monto >= 1 ? redondear(monto) : null, seguro: monto >= 1 && seg.monto === true },
    frecuencia: { valor: frec, seguro: !!frec && seg.frecuencia === true },
    pagosRestantes: { valor: pagos >= 1 ? Math.round(pagos) : null, seguro: pagos >= 1 && seg.pagosRestantes === true },
  }
  if (!out.monto.valor && !out.prestamista.valor) return null
  return out
}

export function lineaDesdeLectura(l) {
  const todoSeguro = ['prestamista', 'monto', 'frecuencia', 'pagosRestantes'].every(k => l[k].seguro)
  return {
    prestamista: l.prestamista.valor || '',
    monto: l.monto.valor,
    frecuencia: l.frecuencia.valor || '',
    pagosRestantes: l.pagosRestantes.valor,
    dudosos: Object.keys(l).filter(k => !l[k].seguro),
    confirmada: todoSeguro,
    origen: 'captura',
  }
}

export function deltaBuro(a, b) {
  const n = x => (Number.isFinite(Number(x)) && x !== '' ? Number(x) : null)
  const s1 = n(a?.saldo), s2 = n(b?.saldo), c1 = n(a?.cuentas), c2 = n(b?.cuentas)
  if (s1 === null || s2 === null) return null
  return { saldo: redondear(s2 - s1), cuentas: c1 !== null && c2 !== null ? c2 - c1 : null }
}
