'use client'
import { useEstado, pesos } from '../../lib/estado'
import { deltaBuro } from '../../lib/tope'

export default function Metrica() {
  const [e, guardar] = useEstado()
  if (!e) return null
  const b = e.buro || { a: {}, b: {} }
  const set = (k, campo, val) => guardar({ ...e, buro: { ...b, [k]: { ...b[k], [campo]: val } } })
  const d = deltaBuro(b.a, b.b)
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">¿Está funcionando?</h1>
      <p className="tarjeta font-semibold">Opcional. Aquí no subes nada ni se conecta a nada: solo escribes dos totales que tú ya tengas.</p>
      <p>La única forma en que Tope se mide: si lo que debes baja entre dos reportes de tu Buró de Crédito. No cuenta cuántas veces abres la app ni cuántas veces dijiste que no.</p>
      <p className="text-sm">Escribe solo los totales de cada reporte. No subas el PDF: no lo necesitamos y no lo guardamos.</p>
      {['a', 'b'].map((k, i) => (
        <section key={k} className="tarjeta space-y-3">
          <h2 className="font-bold">{i === 0 ? 'Reporte anterior' : 'Reporte más reciente'}</h2>
          <div><label htmlFor={`f${k}`}>Fecha del reporte</label><input id={`f${k}`} className="campo mt-1" type="date" value={b[k]?.fecha || ''} onChange={ev => set(k, 'fecha', ev.target.value)} /></div>
          <div><label htmlFor={`s${k}`}>Saldo total que debes (pesos)</label><input id={`s${k}`} className="campo mt-1" type="number" min="0" max="10000000" inputMode="decimal" value={b[k]?.saldo ?? ''} onChange={ev => set(k, 'saldo', ev.target.value)} /></div>
          <div><label htmlFor={`c${k}`}>Cuentas abiertas</label><input id={`c${k}`} className="campo mt-1" type="number" min="0" max="99" inputMode="numeric" value={b[k]?.cuentas ?? ''} onChange={ev => set(k, 'cuentas', ev.target.value)} /></div>
        </section>
      ))}
      {d && (
        <section role="status" className="tarjeta">
          <p className="text-2xl font-extrabold">{d.saldo < 0 ? `Debes ${pesos(-d.saldo)} menos` : d.saldo > 0 ? `Debes ${pesos(d.saldo)} más` : 'Debes lo mismo'}</p>
          {d.cuentas !== null && <p>{d.cuentas < 0 ? `${-d.cuentas} cuenta(s) abierta(s) menos` : d.cuentas > 0 ? `${d.cuentas} cuenta(s) abierta(s) más` : 'Mismas cuentas abiertas'}.</p>}
        </section>
      )}
      <section className="text-sm">
        <h2 className="font-bold">Lo que esta métrica no puede decirte</h2>
        <ul className="list-disc pl-5">
          <li>Si una app de pagos a plazos no reporta al Buró, esa deuda no aparece aquí.</li>
          <li>Si bajó porque te llegó el aguinaldo o un aumento, no fue Tope. No hay forma de separarlo.</li>
          <li>Tu reporte especial del Buró es gratuito una vez cada 12 meses; pedirlo más seguido puede costar.</li>
        </ul>
      </section>
    </div>
  )
}
