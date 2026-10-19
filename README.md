# Tope — ¿me alcanza, según mi regla?

Crystal Ball Studio · Week 10 (AI 2041 ch. 9 "Isle of Happiness") · Andrés Álvarez Morphy Namnum · T4 ADVERSARY.

**Live:** https://w10-tope.vercel.app

A debt guardrail for the online installment buyer: add up every cuota you already owe (Kueski, Aplazo, Mercado Pago MSI, Coppel…) against your quincena, write your own rule on a calm Sunday, and at 11pm ask "¿me alcanza?". It answers NO / LO PERMITE / NO SÉ with your rule and your numbers — never offers credit, never notifies, never stores anything on a server.

- `lib/tope.js` — deterministic rule engine (most-loaded quincena, his delay for loosening, NO SÉ on unconfirmed lines)
- `app/api/leer` — the only AI: Gemini 2.5 Flash-Lite (Vercel AI Gateway) reads 4 fields off a screenshot; "seguro" is rule-checked against the text it quotes; image discarded
- Docs: `docs/CHARTER.md`, `docs/PACKET.md` (written before code), `docs/PROMPTS.md`, `docs/DECISIONS.md`
- Tests: `npm test` (unit) · `test/vision.mjs` (+ log) · `test/e2e.cjs` (Playwright vs prod, + log)

Demo screenshots in `public/demo/` are invented and watermarked.
