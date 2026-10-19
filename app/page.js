'use client'
import Link from 'next/link'
import { useEstado, pesos } from '../lib/estado'
import { reglaVigente, veredicto } from '../lib/tope'

export default function Inicio() {
  const [e] = useEstado()
  const regla = e ? reglaVigente(e) : null
  const lineas = e?.lineas || []
  const v = regla ? veredicto({ regla, lineas }) : null

  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-3xl font-extrabold leading-tight">¿Me alcanza?<br />Según <u>tu</u> regla.</h1>
        <p className="mt-2 text-lg">Tope suma todo lo que ya pagas en cuotas (Kueski, Aplazo, Mercado Pago, meses sin intereses, Coppel…) contra tu quincena. Cuando te ofrezcan &ldquo;paga en quincenas&rdquo;, te contesta con la regla que tú escribiste.</p>
      </section>

      <section className="nunca">
        <h2 className="mb-2 text-lg font-bold">Lo que Tope nunca hace</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Nunca te ofrece un préstamo ni te manda con nadie que preste.</li>
          <li>Nunca te escribe primero: no hay notificaciones ni recordatorios.</li>
          <li>Nunca inventa una regla por ti ni te califica.</li>
          <li>Nunca guarda tus datos en un servidor: tu regla y tus cuotas viven en este teléfono. Las capturas se mandan a leer y se borran en ese momento; nadie las guarda.</li>
          <li>Si no está seguro, no te dice que sí.</li>
        </ul>
      </section>

      {e && (
        <section className="space-y-3">
          <Paso n="1" listo={!!regla} titulo="Escribe tu regla" href="/regla"
            texto={regla ? `Tu tope: ${regla.topePct}% de ${pesos(regla.quincena)} = ${pesos(regla.quincena * regla.topePct / 100)} por quincena.` : 'Un domingo tranquilo, no a las 11 de la noche.'} />
          <Paso n="2" listo={lineas.length > 0 && lineas.every(l => l.confirmada)} titulo="Anota lo que ya debes" href="/cuotas"
            texto={lineas.length ? `${lineas.length} cuota${lineas.length > 1 ? 's' : ''}: ${pesos(v?.actual)} por quincena${v?.pctActual != null ? ` (${v.pctActual}% de tu quincena)` : ''}.${lineas.some(l => !l.confirmada) ? ' Hay datos sin confirmar.' : ''}` : 'Con una captura de pantalla o a mano.'} />
          <Paso n="3" listo={false} titulo="Pregunta antes de darle al botón" href="/alcanza" texto="¿Me alcanza esta cuota nueva?" />
        </section>
      )}
    </div>
  )
}

function Paso({ n, listo, titulo, href, texto }) {
  return (
    <Link href={href} className="tarjeta flex items-start gap-3 hover:bg-white/60">
      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold ${listo ? 'bg-si text-white' : 'bg-noche text-white'}`}>{listo ? '✓' : n}</span>
      <span><span className="block text-lg font-bold">{titulo} →</span><span className="block">{texto}</span></span>
    </Link>
  )
}
