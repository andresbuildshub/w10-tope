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

test('verdict: no / permite / exactly at the cap is permite', () => {
  const lineas = [L('Kueski', 800, 'quincenal'), L('Mercado Pago', 1500, 'mensual')] // 800 + 750 = 1550; limit 2375
  assert.equal(veredicto({ regla, lineas, oferta: { monto: 825, frecuencia: 'quincenal' } }).tipo, 'permite') // 2375 exactly
  assert.equal(veredicto({ regla, lineas, oferta: { monto: 826, frecuencia: 'quincenal' } }).tipo, 'no')
  const v = veredicto({ regla, lineas, oferta: { monto: 500, frecuencia: 'quincenal' } })
  assert.equal(v.actual, 1550); assert.equal(v.conOferta, 2050); assert.equal(v.limite, 2375); assert.equal(v.pctCon, 21.6)
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
  const e3 = guardarRegla(guardarRegla({}, { ...regla, retrasoH: 0 }, t0), { ...regla, retrasoH: 0, topePct: 60 }, t0 + 1)
  assert.equal(reglaVigente(e3, t0 + 2).topePct, 60)
})

test('vision output filter: whitelist, ranges, seguro must be explicit', () => {
  const r = filtrarLectura('ok ```{"prestamista":"Kueski Pay","monto":812.5,"frecuencia":"quincenal","pagosRestantes":3,"seguro":{"prestamista":true,"monto":true,"frecuencia":false,"pagosRestantes":true},"extra":"pre-aprobado"}```')
  assert.equal(r.prestamista.valor, 'Kueski Pay'); assert.equal(r.frecuencia.seguro, false); assert.equal(r.extra, undefined)
  const l = lineaDesdeLectura(r); assert.equal(l.confirmada, false); assert.deepEqual(l.dudosos, ['frecuencia'])
  assert.equal(filtrarLectura('{"monto":999999,"seguro":{"monto":true}}'), null)
  assert.equal(filtrarLectura('no json here'), null)
  assert.equal(filtrarLectura('{"prestamista":"X","monto":50,"frecuencia":"anual","pagosRestantes":200}').frecuencia.valor, null)
})

test('Buró delta and stack end', () => {
  assert.deepEqual(deltaBuro({ saldo: 18000, cuentas: 5 }, { saldo: 15500, cuentas: 4 }), { saldo: -2500, cuentas: -1 })
  assert.equal(deltaBuro({ saldo: '' }, { saldo: 1 }), null)
  assert.equal(quincenasRestantes({ frecuencia: 'mensual', pagosRestantes: 6 }), 12)
})
