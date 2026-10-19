'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useEstado, pesos, fecha } from '../../lib/estado'
import { guardarRegla, reglaVigente, veredicto, RETRASOS, acotar } from '../../lib/tope'

export default function Regla() {
  const [e, guardar] = useEstado()
  const [f, setF] = useState({ quincena: '', topePct: '', texto: '', retrasoH: null })
  const [msg, setMsg] = useState(null)
  const vigente = e ? reglaVigente(e) : null

  useEffect(() => { if (vigente) setF({ quincena: vigente.quincena, topePct: vigente.topePct, texto: vigente.texto || '', retrasoH: vigente.retrasoH }) }, [!!vigente]) // eslint-disable-line

  if (!e) return null
  const q = acotar(f.quincena, 500, 200000), p = acotar(f.topePct, 1, 90)
  const okQ = Number(f.quincena) >= 500, okP = Number(f.topePct) >= 1 && Number(f.topePct) <= 90, okR = RETRASOS.includes(f.retrasoH)
  const valido = okQ && okP && okR
  const hoy = e.lineas?.length && okQ ? veredicto({ regla: { quincena: q, topePct: 100 }, lineas: e.lineas }) : null

  function enviar(ev) {
    ev.preventDefault()
    if (!valido) return
    const nueva = { quincena: q, topePct: p, texto: f.texto.trim().slice(0, 200), retrasoH: f.retrasoH }
    const pcts = (nueva.texto.match(/(\d{1,2})\s*%/g) || []).map(x => parseInt(x))
    const choca = pcts.length && !pcts.includes(nueva.topePct)
    const nuevoEstado = guardarRegla(e, nueva)
    guardar(nuevoEstado)
    setMsg(nuevoEstado.pendiente
      ? `Tu regla nueva es más flexible, así que empieza el ${fecha(nuevoEstado.pendiente.aplicaDesde)} (tú elegiste esperar ${vigente.retrasoH} horas). Hasta entonces contesta tu regla actual`
      : 'Listo. Desde ahora Tope contesta con esta regla.') + (choca ? ` Ojo: tu frase dice ${pcts[0]}% y tu número dice ${nueva.topePct}%. Tope contesta con el número; cambia tu frase para que digan lo mismo.` : '')
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">Mi regla</h1>
      <p>Escríbela en calma. A las 11 de la noche Tope solo te va a repetir lo que tú decidas aquí.</p>

      {vigente && (
        <section className="tarjeta">
          <p className="text-sm font-semibold uppercase text-neutral-600">Tu regla de hoy</p>
          <p className="text-lg"><b>Máximo {vigente.topePct}%</b> de tu quincena de {pesos(vigente.quincena)} en cuotas = <b>{pesos(vigente.quincena * vigente.topePct / 100)}</b>.</p>
          {vigente.texto && <p className="cita mt-2">&ldquo;{vigente.texto}&rdquo;</p>}
          <p className="mt-2 text-sm">Si la quieres aflojar, esperas {vigente.retrasoH === 0 ? 'cero horas (así lo elegiste)' : `${vigente.retrasoH} horas`}. Si la aprietas, aplica de inmediato.</p>
          {e.pendiente && <p className="mt-2 rounded-lg bg-[#fff6dc] p-2 text-sm">Cambio pendiente: {e.pendiente.regla.topePct}% de {pesos(e.pendiente.regla.quincena)}, desde el {fecha(e.pendiente.aplicaDesde)}</p>}
        </section>
      )}

      <form onSubmit={enviar} className="space-y-4">
        <div>
          <label htmlFor="q">Lo que te depositan cada quincena (neto)</label>
          <input id="q" className="campo mt-1" inputMode="decimal" type="number" min="500" max="200000" placeholder="Ej. 9500" value={f.quincena} onChange={ev => setF({ ...f, quincena: ev.target.value })} />
        </div>
        <div>
          <label htmlFor="p">Lo máximo de tu quincena que puede irse en cuotas (%)</label>
          <input id="p" className="campo mt-1" inputMode="numeric" type="number" min="1" max="90" placeholder="Tú decides el número" value={f.topePct} onChange={ev => setF({ ...f, topePct: ev.target.value })} />
          {okQ && okP && <p className="mt-1 text-sm">= {pesos(q * p / 100)} por quincena.</p>}
          {hoy && <p className="mt-1 text-sm">Para que decidas con tus números: hoy tus cuotas confirmadas ya son <b>{hoy.pctActual}%</b> de esa quincena (en la quincena más cargada).</p>}
          {!hoy && <p className="mt-1 text-xs text-neutral-600">Si primero anotas <Link className="liga" href="/cuotas">tus cuotas</Link>, aquí verás qué porcentaje ya pagas.</p>}
        </div>
        <div>
          <label htmlFor="t">Tu regla, en tus palabras (opcional)</label>
          <textarea id="t" className="campo mt-1" rows="2" maxLength={200} placeholder="Con tus palabras. Es solo para que te la recuerde." value={f.texto} onChange={ev => setF({ ...f, texto: ev.target.value })} />
          <p className="mt-1 text-xs text-neutral-600">{f.texto.length}/200 · Tope te la cita tal cual, pero contesta con el número de arriba: que digan lo mismo.</p>
        </div>
        <fieldset>
          <legend className="font-semibold">Si un día quieres aflojar tu regla, ¿cuánto esperas antes de que cuente?</legend>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {RETRASOS.map(h => (
              <label key={h} className={`flex min-h-12 cursor-pointer items-center justify-center rounded-xl border-2 font-bold ${f.retrasoH === h ? 'border-noche bg-noche text-white' : 'border-[#b9b2a2] bg-white'}`}>
                <input type="radio" name="r" className="sr-only" checked={f.retrasoH === h} onChange={() => setF({ ...f, retrasoH: h })} />{h === 0 ? 'Nada' : `${h} h`}
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-neutral-600">Tú eliges, incluso &ldquo;nada&rdquo;. Aflojar = subir tu porcentaje, subir tu quincena o acortar esta espera. Apretar aplica de inmediato.</p>
        </fieldset>
        <button className="boton w-full" disabled={!valido}>Guardar mi regla</button>
        {!valido && <p className="text-sm">Falta: {[!okQ && 'tu quincena (desde $500)', !okP && 'tu porcentaje (1 a 90)', !okR && 'cuántas horas esperar'].filter(Boolean).join(' · ')}</p>}
      </form>
      {msg && <p role="status" className="tarjeta font-semibold">{msg} <Link className="liga" href="/cuotas">Sigue: tus cuotas →</Link></p>}
    </div>
  )
}
