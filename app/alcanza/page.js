'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useEstado, pesos } from '../../lib/estado'
import { FRECUENCIAS, reglaVigente, veredicto, proximasEnTerminar } from '../../lib/tope'

export default function Alcanza() {
  const [e] = useEstado()
  const [o, setO] = useState({ monto: '', frecuencia: 'quincenal', pagos: '' })
  const [v, setV] = useState(null)
  if (!e) return null
  const regla = reglaVigente(e)

  function preguntar(ev) {
    ev.preventDefault()
    setV(veredicto({ regla, lineas: e.lineas, oferta: { monto: Number(o.monto), frecuencia: o.frecuencia } }))
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">¿Me alcanza?</h1>
      <p>Antes de darle a &ldquo;paga en quincenas&rdquo;, escribe la cuota que te ofrecen.</p>

      <form onSubmit={preguntar} className="space-y-4">
        <div>
          <label htmlFor="m">¿Cuánto sería cada pago? (pesos)</label>
          <input id="m" className="campo mt-1" type="number" inputMode="decimal" min="1" max="200000" placeholder="Ej. 650" value={o.monto} onChange={ev => { setO({ ...o, monto: ev.target.value }); setV(null) }} />
        </div>
        <div>
          <label htmlFor="f">¿Cada cuánto?</label>
          <select id="f" className="campo mt-1" value={o.frecuencia} onChange={ev => { setO({ ...o, frecuencia: ev.target.value }); setV(null) }}>
            {Object.entries(FRECUENCIAS).map(([k, f]) => <option key={k} value={k}>{f.nombre}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="p">¿Cuántos pagos? (opcional)</label>
          <input id="p" className="campo mt-1" type="number" inputMode="numeric" min="1" max="60" placeholder="Ej. 5" value={o.pagos} onChange={ev => { setO({ ...o, pagos: ev.target.value }); setV(null) }} />
        </div>
        <button className="boton w-full" disabled={!(Number(o.monto) >= 1 && Number(o.monto) <= 200000)}>¿Me alcanza?</button>
      </form>

      {v && <Respuesta v={v} regla={regla} pagos={Number(o.pagos) || null} monto={Number(o.monto)} lineas={e.lineas} />}
    </div>
  )
}

function Respuesta({ v, regla, pagos, monto, lineas }) {
  if (v.tipo === 'nose') return (
    <section role="status" className="v-nose rounded-2xl p-4">
      <p className="text-3xl font-extrabold">No sé.</p>
      <p className="mt-1 text-tinta">No te voy a decir que sí sin estar seguro. Me falta:</p>
      <ul className="mt-1 list-disc pl-5 text-tinta">{v.faltan.map(f => <li key={f}>{f}</li>)}</ul>
      <p className="mt-2 text-tinta"><Link className="liga" href={v.faltan.some(f => f.startsWith('tu regla')) ? '/regla' : '/cuotas'}>Revísalo aquí →</Link></p>
    </section>
  )
  const no = v.tipo === 'no'
  const terminan = no ? proximasEnTerminar(lineas) : []
  return (
    <section role="status" className={`${no ? 'v-no' : v.justo ? 'v-nose' : 'v-si'} rounded-2xl p-4`}>
      <p className="text-3xl font-extrabold">{no ? 'Tu regla dice NO.' : v.justo ? 'Cabe, pero justo.' : 'Tu regla lo permite.'}</p>
      <p className="mt-1 font-semibold text-tinta">{no ? `Con esta cuota pasarías tu tope de ${regla.topePct}% en tu quincena más cargada.` : `Con esta cuota quedas dentro de tu tope de ${regla.topePct}%.`}</p>
      {regla.texto && <p className="cita mt-3 text-tinta">&ldquo;{regla.texto}&rdquo;<span className="block text-xs not-italic">— tú, cuando escribiste tu regla de {regla.topePct}%</span></p>}
      <dl className="mt-3 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 text-tinta">
        <dt>Ya pagas (quincena más cargada)</dt><dd className="text-right font-semibold">{pesos(v.actual)} ({v.pctActual}%)</dd>
        <dt>Con esta cuota</dt><dd className="text-right font-bold">{pesos(v.conOferta)} ({v.pctCon}%)</dd>
        <dt>Tu tope ({regla.topePct}% de {pesos(regla.quincena)})</dt><dd className="text-right font-semibold">{pesos(v.limite)}</dd>
      </dl>
      <p className="mt-3 font-bold">{no ? `Te pasarías por ${pesos(v.conOferta - v.limite)} cada quincena.` : `Te quedarían ${pesos(v.limite - v.conOferta)} antes de tu tope.`}</p>
      {pagos && <p className="mt-1 text-sm text-tinta">En total serían {pagos} pagos de {pesos(monto)}: {pesos(monto * pagos)}.</p>}
      {terminan.length > 0 && <div className="mt-3 text-sm text-tinta"><p className="font-semibold">Lo que termina primero, según tus cuotas:</p><ul className="list-disc pl-5">{terminan.map(t => <li key={t.prestamista}>{t.prestamista}: en ≈{t.quincenas} quincena{t.quincenas > 1 ? 's' : ''} (libera {pesos(t.libera)})</li>)}</ul></div>}
      <p className="mt-3 text-xs text-tinta">Calculado con tu regla y tus cuotas confirmadas, sin IA. Tope no sabe si la compra vale la pena: eso lo decides tú.</p>
    </section>
  )
}
