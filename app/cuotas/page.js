'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useEstado, pesos } from '../../lib/estado'
import { FRECUENCIAS, porQuincena, reglaVigente, veredicto, lineaDesdeLectura, quincenasRestantes } from '../../lib/tope'

const DEMOS = [
  { archivo: '/demo/kueski.png', nombre: 'Kueski Pay' },
  { archivo: '/demo/aplazo.png', nombre: 'Aplazo' },
  { archivo: '/demo/mercadopago.png', nombre: 'Mercado Pago' },
  { archivo: '/demo/coppel.png', nombre: 'Coppel' },
]
const VACIA = { prestamista: '', monto: '', frecuencia: 'quincenal', pagosRestantes: '', dudosos: [], origen: 'mano' }

export default function Cuotas() {
  const [e, guardar] = useEstado()
  const [borrador, setBorrador] = useState(null)
  const [leyendo, setLeyendo] = useState(false)
  const [aviso, setAviso] = useState(null)
  if (!e) return null
  const regla = reglaVigente(e)
  const v = veredicto({ regla, lineas: e.lineas })

  async function leer(blob) {
    setAviso(null); setLeyendo(true); setBorrador(null)
    try {
      if (blob.size > 4 * 1024 * 1024) throw Object.assign(new Error(), { mostrar: 'La imagen pesa más de 4 MB.' })
      const fd = new FormData(); fd.append('imagen', blob, 'captura')
      const r = await fetch('/api/leer', { method: 'POST', body: fd })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw Object.assign(new Error(), { mostrar: j.error || 'No se pudo leer la imagen.' })
      if (j.modo === 'simulado' || !j.lectura) {
        setAviso({ tipo: 'sim', texto: `${j.motivo || 'No pude leer la captura.'} Escríbela tú abajo: nada se inventa.` })
        setBorrador({ ...VACIA, origen: 'mano' })
      } else {
        setAviso({ tipo: 'ia', texto: 'La captura ya se borró. Lo amarillo no está seguro: revísalo antes de confirmar.' })
        setBorrador(lineaDesdeLectura(j.lectura))
      }
    } catch (err) {
      setAviso({ tipo: 'sim', texto: (err.mostrar || 'No se pudo leer la imagen.') + ' Puedes escribirla a mano.' })
      setBorrador({ ...VACIA })
    } finally { setLeyendo(false) }
  }

  async function demo(archivo) {
    const r = await fetch(archivo); leer(await r.blob())
  }

  function agregar(confirmada) {
    const b = borrador
    const l = { prestamista: (b.prestamista || '').trim().slice(0, 40) || 'Sin nombre', monto: Number(b.monto), frecuencia: b.frecuencia, pagosRestantes: Number(b.pagosRestantes) || null, confirmada, origen: b.origen, id: Date.now() }
    guardar({ ...e, lineas: [...e.lineas, l] })
    setBorrador(null); setAviso(null)
  }
  const borradorValido = borrador && Number(borrador.monto) >= 1 && Number(borrador.monto) <= 200000 && FRECUENCIAS[borrador.frecuencia]

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">Mis cuotas</h1>

      <section className="tarjeta">
        <p className="text-sm font-semibold uppercase text-neutral-600">Lo que ya pagas</p>
        <p className="text-3xl font-extrabold">{pesos(v.actual)} <span className="text-base font-semibold">en tu quincena más cargada</span></p>
        <p className="text-sm">(En promedio {pesos(v.promedio)}. Los pagos mensuales caen completos en una de tus dos quincenas, por eso Tope cuenta la más pesada.)</p>
        {regla ? <p className={v.actual > v.limite ? 'font-bold text-no' : ''}>{v.pctActual}% de tu quincena. Tu tope: {regla.topePct}% ({pesos(v.limite)}).{v.actual > v.limite ? ' Ya te pasaste de tu tope en esa quincena.' : ` Te quedan ${pesos(v.limite - v.actual)}.`}</p>
          : <p><Link className="liga" href="/regla">Escribe tu regla</Link> para ver qué parte de tu quincena es.</p>}
        {e.lineas.some(l => !l.confirmada) && <p className="mt-1 font-semibold text-nose">Hay cuotas sin confirmar: no cuentan en la suma y Tope te va a contestar &ldquo;No sé&rdquo; hasta que las revises.</p>}
      </section>

      <ul className="space-y-2">
        {e.lineas.map((l, i) => (
          <li key={l.id || i} className={`tarjeta ${l.confirmada ? '' : 'duda'}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold">{l.prestamista} {l.confirmada ? <span className="etiqueta et-ia">✓ confirmada</span> : <span className="etiqueta et-duda">⚠ sin confirmar · no cuenta</span>}</p>
                <p>{pesos(l.monto)} {FRECUENCIAS[l.frecuencia]?.nombre || '(frecuencia ?)'} → <b>{pesos(porQuincena(l.monto, l.frecuencia, 'peor'))} en la quincena en que cae</b></p>
                {l.pagosRestantes ? <p className="text-sm">Faltan {l.pagosRestantes} pagos (≈ {quincenasRestantes(l)} quincenas).</p> : null}
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                {!l.confirmada && <button className="boton" style={{ minHeight: 40 }} onClick={() => setBorrador({ ...l, editando: i })}>Revisar</button>}
                <button className="liga text-sm" onClick={() => guardar({ ...e, lineas: e.lineas.filter((_, j) => j !== i) })}>Quitar</button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {!borrador && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold">Agregar una cuota</h2>
          <label className="boton w-full cursor-pointer">
            {leyendo ? 'Leyendo la captura…' : '📷 Subir captura de la app'}
            <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={leyendo} onChange={ev => ev.target.files?.[0] && leer(ev.target.files[0])} />
          </label>
          <p className="text-sm">La captura se lee y se descarta: no se guarda en ningún lado. Solo se sacan 4 datos: quién te cobra, cuánto por pago, cada cuánto y cuántos pagos faltan.</p>
          <button className="boton boton-sec w-full" onClick={() => setBorrador({ ...VACIA })}>✍️ Escribirla a mano</button>
          <details className="text-sm">
            <summary className="cursor-pointer font-semibold">¿Sin capturas? Prueba con una de demostración</summary>
            <p className="my-2">Capturas inventadas para esta demo (marcadas &ldquo;DEMO · datos inventados&rdquo;).</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMOS.map(d => <button key={d.archivo} disabled={leyendo} className="boton boton-sec" style={{ minHeight: 40 }} onClick={() => demo(d.archivo)}>{d.nombre} (demo)</button>)}
            </div>
          </details>
        </section>
      )}

      {aviso && <p role="status" className="text-sm">{aviso.tipo === 'ia' ? <span className="etiqueta et-ia mr-1">Leído por IA</span> : <span className="etiqueta et-sim mr-1">Sin IA · SIMULADO</span>}{aviso.texto}</p>}

      {borrador && (
        <section className="tarjeta space-y-3">
          <h2 className="text-lg font-bold">{borrador.origen === 'captura' ? 'Revisa lo que leí' : 'Escribe la cuota'}</h2>
          <Campo nombre="prestamista" etiqueta="¿Quién te cobra?" b={borrador} set={setBorrador} />
          <Campo nombre="monto" etiqueta="¿Cuánto es cada pago? (pesos)" tipo="number" b={borrador} set={setBorrador} />
          <div>
            <label htmlFor="fr">¿Cada cuánto pagas?</label>
            <select id="fr" className={`campo mt-1 ${borrador.dudosos?.includes('frecuencia') ? 'duda' : ''}`} value={borrador.frecuencia} onChange={ev => setBorrador({ ...borrador, frecuencia: ev.target.value, dudosos: borrador.dudosos?.filter(d => d !== 'frecuencia') })}>
              <option value="">Elige…</option>
              {Object.entries(FRECUENCIAS).map(([k, f]) => <option key={k} value={k}>{f.nombre}</option>)}
            </select>
            {borrador.dudosos?.includes('frecuencia') && <p className="text-sm text-nose">No estoy seguro de este dato. Revísalo.</p>}
          </div>
          <Campo nombre="pagosRestantes" etiqueta="¿Cuántos pagos faltan? (opcional)" tipo="number" b={borrador} set={setBorrador} />
          <div className="flex flex-wrap gap-2">
            <button className="boton" disabled={!borradorValido} onClick={() => {
              if (borrador.editando !== undefined) {
                const ls = e.lineas.map((l, j) => j === borrador.editando ? { ...l, prestamista: borrador.prestamista, monto: Number(borrador.monto), frecuencia: borrador.frecuencia, pagosRestantes: Number(borrador.pagosRestantes) || null, confirmada: true } : l)
                guardar({ ...e, lineas: ls }); setBorrador(null); setAviso(null)
              } else agregar(true)
            }}>Confirmo estos datos</button>
            {borrador.origen === 'captura' && borrador.editando === undefined && <button className="boton boton-sec" disabled={!borradorValido} onClick={() => agregar(false)}>Guardar sin confirmar (no cuenta hasta que lo revises)</button>}
            <button className="liga" onClick={() => { setBorrador(null); setAviso(null) }}>Cancelar</button>
          </div>
        </section>
      )}

      {e.lineas.length > 0 && !borrador && <Link href="/alcanza" className="boton w-full">¿Me alcanza una cuota nueva? →</Link>}
    </div>
  )
}

function Campo({ nombre, etiqueta, tipo = 'text', b, set }) {
  const duda = b.dudosos?.includes(nombre)
  return (
    <div>
      <label htmlFor={nombre}>{etiqueta}</label>
      <input id={nombre} className={`campo mt-1 ${duda ? 'duda' : ''}`} type={tipo} inputMode={tipo === 'number' ? 'decimal' : undefined} maxLength={40}
        value={b[nombre] ?? ''} onChange={ev => set({ ...b, [nombre]: ev.target.value, dudosos: b.dudosos?.filter(d => d !== nombre) })} />
      {duda && <p className="text-sm text-nose">No estoy seguro de este dato. Revísalo.</p>}
    </div>
  )
}
