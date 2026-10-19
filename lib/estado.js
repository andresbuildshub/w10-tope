'use client'
import { useEffect, useState, useCallback } from 'react'

// Everything Tope knows lives here, on HIS phone, under one key. Nothing goes to a server except a screenshot being read.
export const CLAVE = 'tope.v1'
const VACIO = { regla: null, pendiente: null, lineas: [], buro: { a: {}, b: {} } }

export function leerEstado() {
  try { return { ...VACIO, ...JSON.parse(localStorage.getItem(CLAVE) || '{}') } } catch { return { ...VACIO } }
}

export function useEstado() {
  const [estado, setEstado] = useState(null)
  useEffect(() => { setEstado(leerEstado()) }, [])
  const guardar = useCallback(nuevo => {
    setEstado(nuevo)
    try { localStorage.setItem(CLAVE, JSON.stringify(nuevo)) } catch {}
  }, [])
  return [estado, guardar]
}

export function borrarTodo() {
  try { localStorage.removeItem(CLAVE) } catch {}
}

export const pesos = n => (n === null || n === undefined || !Number.isFinite(Number(n)) ? '—' : '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 }))
export const fecha = t => new Date(t).toLocaleString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
