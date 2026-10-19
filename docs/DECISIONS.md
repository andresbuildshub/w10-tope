# Decisions — w10-tope

> Session close ritual, every session: one line per decision with the why, tomorrow's first move at the top, commit, push.

**Tomorrow's first move:** when the T4 Blueprint exists, re-check the packet's "Conditions → build" table against its conditions (esp. the shadow clause wording); then decide whether `/regla` should come after `/cuotas` in the nav too (persona r3: blind % pick).

---

<!-- newest first: YYYY-MM-DD — decision — why -->
2026-10-18 — Persona r3 REJECTED fixes, kept as dissent: (a) "la mayoría elige 20–35%" hint, (b) preselect 48 h, (c) make Borrar todo keep the cooldown — (a)(b) = Tope writing his rule for him (Charter never-list #3); (c) one-tap deletion is condition 2 and outranks the cooldown; stated honestly on /como instead.
2026-10-18 — Persona r3 fixes: overshoot stated "en tu quincena más cargada" (not "cada quincena", which was false); "cabría cuando termine X" computed from HIS lines only; "Contando:" list on every verdict; NO SÉ gray-dashed vs "justo" amber; metric moved out of the global footer (read as loan-app).
2026-10-18 — Persona r2 fixes: no "Buró" in nav; plain "viaja a una IA de Google y se borra" before upload; "save unconfirmed" demoted to a text link; "antes de tu tope"; green only with >10% margin, threshold shown; text/number mismatch warning; cuotas before rule on home.
2026-10-18 — Persona r1 (T1/T2/T4 PARTIAL): verdict now uses the MOST LOADED quincena — averaging monthly charges ($699 → $349.50) gave Brandon a false "permite" in the quincena MP lands; that's the exact false yes the Charter forbids.
2026-10-18 — Raising the quincena figure counts as loosening (persona r1: it raised the peso limit without waiting out his delay).
2026-10-18 — No delay preselected; save is blocked until he picks one (persona r1: preselected 24 h contradicted "nunca inventa una regla por ti").
2026-10-18 — "Seguro" is decided by a rule over the literal text the model quotes, not by the model — Gemini Flash-Lite marked EVERY field unsure (even "$812.50" in 30pt), so its own flag carried no signal.
2026-10-18 — Only amount + frequency gate the verdict; payments-left is flagged but doesn't block — the model quotes value cells without labels, and payments-left never changes the yes/no.
2026-10-18 — Vision test on 4 invented screenshots: 15/16 fields right, 0 wrong-and-sure; the miss is Mercado Pago "Cuota 5 de 12" (7 vs 8 left), correctly flagged for review.
2026-10-18 — Unit test caught: out-of-range readings were CLAMPED (999,999 → a "sure" 200,000); now discarded.
2026-10-18 — No account, no database: rule + cuotas live in localStorage; screenshots processed in memory and discarded — condition 2; security floor auth/RLS items don't apply (nothing personal on a server), stated on /como.
2026-10-18 — The decision is deterministic (lib/tope.js), the LLM only reads 4 fields off a screenshot — Week 9 lesson: models state false rules with confidence; a debt verdict can't depend on one.
2026-10-18 — Pull-only enforced in headers too (Permissions-Policy notifications=()) — shadow clause: Tope never starts a conversation.
2026-10-18 — Built before the T4 Blueprint, from my brief's conditional survivor (Debt guardrail) — the course allows "own surviving idea"; packet table gets re-checked against the Blueprint.
