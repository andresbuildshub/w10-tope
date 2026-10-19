'use client'
import { useState } from 'react'
import { borrarTodo } from '../lib/estado'

export default function Borrar() {
  const [paso, setPaso] = useState(0)
  if (paso === 2) return <p className="font-semibold">Listo: se borró todo de este teléfono.</p>
  if (paso === 1) return (
    <div className="flex flex-wrap items-center gap-2">
      <span>¿Borrar tu regla y todas tus cuotas de este teléfono?</span>
      <button className="boton" style={{ minHeight: 40, background: 'var(--color-no)' }} onClick={() => { borrarTodo(); setPaso(2); setTimeout(() => location.assign('/'), 900) }}>Sí, borrar todo</button>
      <button className="boton boton-sec" style={{ minHeight: 40 }} onClick={() => setPaso(0)}>No</button>
    </div>
  )
  return <button className="liga" onClick={() => setPaso(1)}>Borrar todo</button>
}
