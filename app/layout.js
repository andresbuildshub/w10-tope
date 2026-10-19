import './globals.css'
import Link from 'next/link'
import Borrar from './Borrar'

export const metadata = {
  title: 'Tope',
  description: 'Suma todas tus cuotas contra tu quincena y te contesta con TU regla: ¿me alcanza o no?',
}
export const viewport = { width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <header className="bg-noche text-white">
          <nav className="mx-auto flex max-w-xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
            <Link href="/" className="mr-auto text-xl font-extrabold tracking-tight">Tope</Link>
            <Link href="/regla" className="text-sm font-semibold">Mi regla</Link>
            <Link href="/cuotas" className="text-sm font-semibold">Mis cuotas</Link>
            <Link href="/alcanza" className="text-sm font-semibold underline underline-offset-4">¿Me alcanza?</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-xl px-4 py-5">{children}</main>
        <footer className="mx-auto max-w-xl border-t border-arena px-4 pb-10 pt-4 text-sm text-neutral-700">
          <div className="mb-3"><Borrar /></div>
          <p className="mb-2"><Link className="liga" href="/como">Cómo funciona y qué no hace</Link> · <Link className="liga" href="/metrica">Mi métrica (Buró)</Link></p>
          <p className="text-xs">Proyecto de clase (Crystal Ball Studio, semana 10). No es un servicio financiero, no presta, no recomienda y no guarda nada en un servidor: tu regla y tus cuotas viven solo en este teléfono.</p>
        </footer>
      </body>
    </html>
  )
}
