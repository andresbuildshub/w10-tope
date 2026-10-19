export const metadata = { title: 'Cómo funciona · Tope' }

export default function Como() {
  return (
    <article className="space-y-5 leading-relaxed">
      <h1 className="text-2xl font-extrabold">Cómo funciona y qué no hace</h1>

      <section><h2 className="text-lg font-bold">Por qué existe</h2>
        <p>En México el crédito aparece en el botón de pagar, en quincenas, ofrecido por la misma empresa que te vende. Cada cuota se ve chica; la suma no. Nadie fuera del prestamista ve todas tus cuotas en el momento de decidir: la ley que permitiría juntar esos datos (artículo 76 de la Ley Fintech, 2018) todavía no tiene sus reglas para datos transaccionales. Por eso aquí los datos los traes tú.</p></section>

      <section><h2 className="text-lg font-bold">Qué hace la IA y qué no</h2>
        <ul className="list-disc pl-5">
          <li><b>Sí:</b> un modelo con visión (Gemini 2.5 Flash-Lite, vía Vercel AI Gateway) lee 4 datos de una captura: quién cobra, cuánto por pago, cada cuánto y cuántos pagos faltan. Cada dato viene marcado como seguro o no seguro.</li>
          <li><b>No:</b> la IA nunca decide si te alcanza. Eso lo calcula una regla fija con tus números (sin IA) y lo contesta con tu regla.</li>
          <li>Si el modelo no está disponible, la pantalla lo dice (&ldquo;Sin IA · SIMULADO&rdquo;) y tú escribes el dato. Nunca se inventa una lectura.</li>
          <li>Si un dato no está seguro, no cuenta hasta que lo confirmes, y Tope contesta &ldquo;No sé&rdquo;.</li>
        </ul></section>

      <section><h2 className="text-lg font-bold">Qué se guarda</h2>
        <p>Tu regla y tus cuotas viven solo en el almacenamiento de este navegador, en este teléfono. No hay cuentas ni base de datos. La captura viaja al servidor solo para leerse y se descarta en la misma petición. &ldquo;Borrar todo&rdquo; (abajo en cada pantalla) lo elimina en un toque.</p></section>

      <section><h2 className="text-lg font-bold">Lo que Tope nunca hará</h2>
        <ol className="list-decimal pl-5">
          <li>Ofrecerte un préstamo, una consolidación o un &ldquo;pre-aprobado&rdquo;, ni mandarte con quien preste.</li>
          <li>Escribirte primero: no hay notificaciones ni recordatorios. Solo contesta cuando preguntas.</li>
          <li>Escribir, agregar o cambiar tu regla por ti, ni calificarte.</li>
          <li>Decir que sí cuando no está seguro.</li>
          <li>Cobrar por venta, por préstamo o por recomendación.</li>
        </ol></section>

      <section><h2 className="text-lg font-bold">Lo que todavía no está resuelto</h2>
        <ul className="list-disc pl-5">
          <li><b>Quién paga.</b> Esta versión es gratuita y de clase. Si un día cobra, será igual si la respuesta es sí o no, y nunca por cuenta de una tienda o un prestamista.</li>
          <li><b>Las 11 de la noche.</b> Tope no te protege de ti mismo si no le preguntas. Es a propósito: una app que te vigila la pantalla o te manda avisos para &ldquo;ayudarte&rdquo; es exactamente lo que no queremos ser.</li>
          <li><b>Formatos.</b> Cada app muestra sus cuotas distinto; la lectura puede fallar. Por eso nada cuenta sin tu confirmación.</li>
        </ul></section>

      <p className="text-sm">Proyecto de clase, Crystal Ball Studio (semana 10, &ldquo;Isle of Happiness&rdquo;). Las capturas de demostración son inventadas y están marcadas así.</p>
    </article>
  )
}
