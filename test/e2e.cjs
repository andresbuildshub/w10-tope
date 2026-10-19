// E2E against prod, phone viewport. Run: NODE_PATH=<dir with playwright>/node_modules node test/e2e.cjs [url] [shotsDir]
const { chromium } = require('playwright')
const URL = process.argv[2] || 'https://w10-tope.vercel.app'
const SHOTS = process.argv[3]
let n = 0, fallas = 0
const ok = (c, m) => { n++; if (!c) fallas++; console.log(`${c ? '✓' : '✗'} ${m}`) }
;(async () => {
  const b = await chromium.launch()
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'es-MX' })
  const p = await ctx.newPage()
  const shot = async nombre => { if (SHOTS) await p.screenshot({ path: `${SHOTS}/${nombre}.png`, fullPage: true }) }
  const externos = async () => p.$$eval('a[href]', as => as.map(a => a.href).filter(h => !h.startsWith(location.origin)))

  const r = await p.goto(URL); const pp = r.headers()['permissions-policy'] || ''
  ok(pp.includes('notifications=()'), 'header blocks notifications (pull-only enforced)')
  ok(await p.getByText('Lo que Tope nunca hace').isVisible(), 'home shows the never-list'); await shot('01-inicio')

  await p.goto(URL + '/alcanza'); await p.fill('#m', '650'); await p.click('button:has-text("¿Me alcanza?")')
  ok(await p.getByText('No sé.').isVisible(), 'no rule yet → NO SÉ, not a yes'); await shot('02-alcanza-sin-regla')

  await p.goto(URL + '/regla'); await shot('03-regla-vacia')
  await p.fill('#q', '9500'); await p.fill('#p', '30')
  ok(await p.getByText('Falta:').isVisible(), 'save blocked until he picks his own delay (nothing preselected)')
  await p.fill('#t', 'Máximo 30% de mi quincena en cuotas, aunque la oferta se vea chiquita.')
  await p.click('label:has-text("48 h")'); await p.click('button:has-text("Guardar mi regla")')
  ok(await p.getByText('Desde ahora Tope contesta con esta regla').isVisible(), 'rule saved'); await shot('04-regla-guardada')

  await p.goto(URL + '/cuotas')
  for (const d of ['Kueski Pay', 'Aplazo', 'Mercado Pago', 'Coppel']) {
    await p.click('summary'); await p.click(`button:has-text("${d} (demo)")`)
    await p.waitForSelector('text=Revisa lo que leí, text=Escribe la cuota', { timeout: 30000 }).catch(() => {})
    const ia = await p.getByText('Leído por IA', { exact: true }).isVisible().catch(() => false)
    ok(ia, `${d}: read by real vision model`)
    if (d === 'Kueski Pay') await shot('05-cuotas-revisa-lectura')
    if (d === 'Mercado Pago') ok(await p.locator('#pagosRestantes.duda').count() === 1, 'Mercado Pago "5 de 12": payments-left flagged for review')
    await p.click('button:has-text("Confirmo estos datos")')
  }
  const total = await p.locator('text=en tu quincena más cargada').first().locator('..').innerText()
  ok(/2,575\.50/.test(total), `most-loaded quincena = $2,575.50 (monthly MP lands whole) (got: ${total.replace(/\s+/g, ' ').slice(0, 40)})`); await shot('06-cuotas-lista')

  await p.goto(URL + '/alcanza'); await p.fill('#m', '650'); await p.fill('#p', '5'); await p.click('button:has-text("¿Me alcanza?")')
  ok(await p.getByText('Tu regla dice NO.').isVisible(), '650 on top of 2,575.50 vs 2,850 → NO')
  ok(await p.getByText('Te pasarías por $375.50 cada quincena.').isVisible(), 'shows the overshoot in his numbers')
  ok(await p.locator('.cita').innerText().then(t => t.includes('aunque la oferta')), 'quotes HIS rule text')
  ok(await p.getByText('Lo que termina primero').isVisible(), 'NO shows which of his lines end first (facts, no advice)')
  const verdicto = await p.locator('[role=status]').innerText()
  ok(!/préstamo|consolida|aprobado|solicita/i.test(verdicto), 'verdict contains no credit offer'); await shot('07-alcanza-no')
  await p.fill('#m', '140'); await p.click('button:has-text("¿Me alcanza?")')
  ok(await p.getByText('Cabe, pero justo.').isVisible(), '140 → fits with $134.50 left (<10%) → amber "justo", not green'); await shot('08-alcanza-justo')
  await p.goto(URL + '/cuotas'); await p.locator('button:has-text("Quitar")').last().click()
  await p.goto(URL + '/alcanza'); await p.fill('#m', '50'); await p.click('button:has-text("¿Me alcanza?")')
  ok(await p.getByText('Tu regla lo permite.').isVisible(), 'Coppel paid off, 50 → green permite (2,210.50 vs 2,850, margin > 10%)'); await shot('08b-alcanza-permite')

  await p.goto(URL + '/regla'); await p.waitForSelector('text=Tu regla de hoy'); await p.fill('#p', '40'); await p.click('button:has-text("Guardar mi regla")')
  ok(await p.getByText('es más flexible').isVisible(), 'loosening waits for his 48 h'); await shot('09-regla-pendiente')
  await p.goto(URL + '/alcanza'); await p.fill('#m', '700'); await p.click('button:has-text("¿Me alcanza?")')
  ok(await p.getByText('Tu regla dice NO.').isVisible(), 'pending 40% rule does not answer yet: 700 still NO under 30% (would fit under 40%)')

  await p.evaluate(() => { const s = JSON.parse(localStorage.getItem('tope.v1')); s.lineas.push({ prestamista: 'Nelo', monto: 300, frecuencia: 'quincenal', confirmada: false }); localStorage.setItem('tope.v1', JSON.stringify(s)) })
  await p.goto(URL + '/alcanza'); await p.fill('#m', '10'); await p.click('button:has-text("¿Me alcanza?")')
  ok(await p.getByText('No sé.').isVisible() && await p.getByText('Nelo').isVisible(), 'unconfirmed line → NO SÉ naming it')

  for (const ruta of ['/', '/regla', '/cuotas', '/alcanza', '/metrica', '/como']) { await p.goto(URL + ruta); ok((await externos()).length === 0, `${ruta}: no external links (no lender, no store)`) }
  await p.goto(URL + '/metrica'); await p.fill('#sa', '18000'); await p.fill('#ca', '5'); await p.fill('#sb', '15500'); await p.fill('#cb', '4')
  ok(await p.getByText('Debes $2,500 menos').isVisible(), 'Buró delta computed'); await shot('10-metrica')
  await p.goto(URL + '/como'); await shot('11-como')

  await p.click('button:has-text("Borrar todo")'); await p.click('button:has-text("Sí, borrar todo")')
  await p.waitForTimeout(1500)
  ok(await p.evaluate(() => localStorage.getItem('tope.v1')) === null, 'Borrar todo empties the phone')
  await b.close(); console.log(`\n${n - fallas}/${n} checks passed`); process.exit(fallas ? 1 : 0)
})()
