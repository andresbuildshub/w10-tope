# Implementation prompt — w10-tope (generated from docs/PACKET.md)

> Given to the coding agent after the packet was committed. Small testable features, acceptance criteria, commit plan.

You are building **Tope**, a phone-first Next.js 15 + Tailwind 4 app in Spanish (tú). Read `docs/CHARTER.md` and `docs/PACKET.md` first; the Charter's "never" list overrides any feature request. No database, no auth, no analytics, no notifications. All user state lives in `localStorage` under one key (`tope.v1`).

## F1 — Rule engine (`lib/tope.js`, pure functions) → commit "feat: rule engine + unit tests"
- `porQuincena(monto, frecuencia)`: quincenal ×1, semanal ×(52/24), mensual ×0.5, catorcenal ×(26/24).
- `veredicto({quincena, topePct, lineas, oferta})` → `{tipo:'no'|'permite'|'nose', actual, conOferta, pctActual, pctCon, limite, faltan[]}`. NO SÉ if any line `confirmada === false` or quincena missing. Exactly at the limit = permite.
- `reglaVigente(estado, ahora)`: a looser pending rule applies only after `aplicaDesde`; tighter applies immediately.
- `filtrarLectura(json)`: whitelist {prestamista (≤40 chars), monto (1–200000), frecuencia (enum), pagosRestantes (1–60)} each with `seguro:boolean`; anything else dropped.
**Accept:** `npm test` green; boundaries covered.

## F2 — Vision API (`app/api/leer/route.js`) → commit "feat: /api/leer vision reader (stateless, whitelisted)"
- POST multipart `imagen`; reject non png/jpg/webp or >4 MB (413/415); rate limit 12 per 10 min per IP.
- `generateText` with `google/gemini-2.5-flash-lite`, image + system prompt asking ONLY the 4 fields + seguro flags as JSON; temperature 0.
- Pass through `filtrarLectura`; on failure return `{modo:'simulado', motivo}` and the UI asks him to type it. Never fabricate a reading. Nothing logged but error class.
**Accept:** invented screenshots return fields; garbage image returns no "seguro" fields.

## F3 — Screens → commit "feat: regla, cuotas, alcanza screens"
- `/` what Tope never does + next step; `/regla` (quincena, tope %, su regla en sus palabras ≤200, retraso 0/24/48/72h, pending logic); `/cuotas` (add by screenshot or typed; no-seguro fields highlighted and must be confirmed; per-quincena total); `/alcanza` (oferta → big verdict + his rule quoted + his numbers; no links, no alternatives).
- Footer on every page: "Borrar todo" (confirm, then clears `tope.v1`).
**Accept:** E2E flow passes on phone viewport.

## F4 — `/metrica` and `/como` → commit "feat: metrica (Buró delta) + como (método y límites)"
- Two report totals → delta + caveats. `/como`: what is real (vision, if available) vs SIMULADO, what is stored (nothing on server), the open payer question, the never-list.

## F5 — Hardening → commit "chore: security headers, input clamps, demo screenshots"
- CSP self-only; Permissions-Policy blocks notifications/camera/geo; clamp all numeric inputs; demo screenshots in `public/demo/` watermarked "DEMO · datos inventados".

## Tests → commit "test: e2e vs prod + vision accuracy log"
- `test/tope.test.mjs` (unit), `test/e2e.mjs` (Playwright vs prod), `test/vision.mjs` (4 invented screenshots vs truth).

Session Close every session: DECISIONS.md line per decision, tomorrow's first move, commit, push.
