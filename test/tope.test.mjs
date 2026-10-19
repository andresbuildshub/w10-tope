import { test } from 'node:test'
import assert from 'node:assert/strict'
import { porQuincena, veredicto, guardarRegla, reglaVigente, filtrarLectura, lineaDesdeLectura, deltaBuro, quincenasRestantes } from '../lib/tope.js'

const regla = { quincena: 9500, topePct: 25, retrasoH: 48, texto: 'Ninguna cuota nueva si ya paso de 25%.' }
const L = (prestamista, monto, frecuencia, confirmada = true) => ({ prestamista, monto, frecuencia, pagosRestantes: 4, confirmada })

test('per-quincena conversion', () => {
  assert.equal(porQuincena(1000, 'quincenal'), 1000)
  assert.equal(porQuincena(1000, 'mensual'), 500)
  assert.equal(porQuincena(240, 'semanal'), 520)
  assert.equal(porQuincena(-5, 'quincenal'), null)
  assert.equal(porQuincena(100, 'diaria'), null)
})

test('verdict uses the MOST LOADED quincena (monthly lands whole), exactly at the cap = permite', () => {
  const lineas = [L('Kueski', 800, 'quincenal'), L('Mercado Pago', 1500, 'mensual')] // worst quincena = 800 + 1500 = 2300; limit 2375
  assert.equal(veredicto({ regla, lineas, oferta: { monto: 75, frecuencia: 'quincenal' } }).tipo, 'permite')
  assert.equal(veredicto({ regla, lineas, oferta: { monto: 76, frecuencia: 'quincenal' } }).tipo, 'no')
  const v = veredicto({ regla, lineas, oferta: { monto: 50, frecuencia: 'quincenal' } })
  assert.equal(v.actual, 2300); assert.equal(v.promedio, 1550); assert.equal(v.conOferta, 2350); assert.equal(v.justo, true)
  assert.equal(veredicto({ regla: { ...regla, topePct: 40 }, lineas, oferta: { monto: 50, frecuencia: 'quincenal' } }).justo, false) // 3800 cap, 1450 margin
  assert.equal(porQuincena(200, 'semanal', 'peor'), 600)
})

test('uncertain never becomes yes', () => {
  const lineas = [L('Kueski', 100, 'quincenal'), L('Aplazo', 100, 'quincenal', false)]
  const v = veredicto({ regla, lineas, oferta: { monto: 10, frecuencia: 'quincenal' } })
  assert.equal(v.tipo, 'nose'); assert.match(v.faltan[0], /Aplazo/)
  assert.equal(veredicto({ regla: null, lineas: [], oferta: { monto: 10, frecuencia: 'quincenal' } }).tipo, 'nose')
  assert.equal(veredicto({ regla, lineas: [], oferta: { monto: 10, frecuencia: 'nunca' } }).tipo, 'nose')
})

test('looser rule waits for HIS delay; tighter applies now; zero delay applies now', () => {
  const t0 = Date.UTC(2026, 9, 18, 6)
  let e = guardarRegla({}, regla, t0)
  e = guardarRegla(e, { ...regla, topePct: 40 }, t0 + 1000)
  assert.equal(reglaVigente(e, t0 + 2000).topePct, 25)
  assert.equal(reglaVigente(e, t0 + 1000 + 48 * 3600 * 1000).topePct, 40)
  const e2 = guardarRegla(guardarRegla({}, regla, t0), { ...regla, topePct: 15 }, t0 + 1000)
  assert.equal(reglaVigente(e2, t0 + 2000).topePct, 15)
  const e4 = guardarRegla(guardarRegla({}, regla, t0), { ...regla, quincena: 12000 }, t0 + 1000)
  assert.equal(reglaVigente(e4, t0 + 2000).quincena, 9500, 'a higher quincena figure is loosening too')
  const e3 = guardarRegla(guardarRegla({}, { ...regla, retrasoH: 0 }, t0), { ...regla, retrasoH: 0, topePct: 60 }, t0 + 1)
  assert.equal(reglaVigente(e3, t0 + 2).topePct, 60)
})

test('vision filter: whitelist, ranges, and "seguro" decided by quoted evidence, not by the model', () => {
  const r = filtrarLectura('ok ```{"prestamista":"Kueski Pay","monto":812.5,"frecuencia":"quincenal","pagosRestantes":4,"evidencia":{"prestamista":"Kueski Pay","monto":"$812.50","frecuencia":"Pagas cada quincena","pagosRestantes":"Te faltan 4 pagos"},"extra":"pre-aprobado"}```')
  assert.equal(r.prestamista.valor, 'Kueski Pay'); assert.equal(r.extra, undefined)
  assert.ok(['prestamista', 'monto', 'frecuencia', 'pagosRestantes'].every(k => r[k].seguro))
  // "Cuota 5 de 12" does not say how many are LEFT → not seguro, whatever the model believes
  const mp = filtrarLectura('{"prestamista":"Mercado Pago","monto":699,"frecuencia":"mensual","pagosRestantes":7,"evidencia":{"prestamista":"Mercado Pago","monto":"$699.00 / mes","frecuencia":"$699.00 / mes","pagosRestantes":"Cuota 5 de 12"}}')
  assert.equal(mp.frecuencia.seguro, true); assert.equal(mp.pagosRestantes.seguro, false)
  const l = lineaDesdeLectura(mp); assert.equal(l.confirmada, true); assert.deepEqual(l.dudosos, ['pagosRestantes'])
  const sinMonto = lineaDesdeLectura(filtrarLectura('{"prestamista":"X","monto":800,"frecuencia":"quincenal","evidencia":{"monto":"$812.50","frecuencia":"cada quincena"}}'))
  assert.equal(sinMonto.confirmada, false); assert.ok(sinMonto.dudosos.includes('monto'))
  // evidence that doesn't contain the number → not seguro
  assert.equal(filtrarLectura('{"prestamista":"X","monto":800,"evidencia":{"monto":"$812.50"}}').monto.seguro, false)
  assert.equal(filtrarLectura('{"monto":999999,"evidencia":{"monto":"999999"}}'), null)
  assert.equal(filtrarLectura('no json here'), null)
  assert.equal(filtrarLectura('{"prestamista":"X","monto":50,"frecuencia":"anual","pagosRestantes":200}').frecuencia.valor, null)
})

test('Buró delta and stack end', () => {
  assert.deepEqual(deltaBuro({ saldo: 18000, cuentas: 5 }, { saldo: 15500, cuentas: 4 }), { saldo: -2500, cuentas: -1 })
  assert.equal(deltaBuro({ saldo: '' }, { saldo: 1 }), null)
  assert.equal(quincenasRestantes({ frecuencia: 'mensual', pagosRestantes: 6 }), 12)
})
