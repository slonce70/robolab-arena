# RoboLab Arena Final QA / Playwright Authorized Pass

Date: 2026-04-26
Mode: Ralph continuation after user authorized Playwright fallback
Plan: `.omx/plans/robolab-arena-final-qa-plan.md` + `.omx/plans/prd-robolab-final-qa-polish.md`

## Verdict

**Playwright visual/interaction inspection: PASS.** After the earlier Browser Use blocker, the user explicitly allowed autonomous Playwright. A real Chromium run loaded the local Vite game, started gameplay, opened pause/settings, toggled sensitivity/camera, verified first-person HUD/crosshair, activated shield/rapid/overcharge effects, fired once for blaster feedback, and inspected rooms 1-12 with screenshots.

**Normal manual campaign completion: NOT CLAIMED.** Room jumps (BracketRight) were used only to inspect every arena quickly. They are not counted as proof that a human completed every objective and boss through normal input. Static route/balance tests support passability separately.

**Static/build readiness: PASS.** Fresh source tests, default tests, typecheck, and production build pass.

## What Changed in This Ralph Pass

- Pause UI polish: localized the remaining English `Restart room` button to `Перезапустити кімнату`.
- Test discovery hardening: added `vitest.config.ts` so `npm test` ignores local OMX/team/browser artifacts and only reports the real project test set.
- QA evidence updated from Browser Use-blocked to Playwright-authorized pass, while preserving the honest guardrail that dev jumps are inspection-only.

## Playwright Evidence

| Check | Result | Evidence |
|---|---|---|
| CLI prerequisite | PASS | `npx` present; wrapper `~/.codex/skills/playwright/scripts/playwright_cli.sh --help` works. |
| Wrapper smoke | PASS | `playwright-cli open http://127.0.0.1:5174/` + `snapshot` confirmed title `RoboLab Arena` and start button. |
| Autonomous Chromium QA | PASS | `node .omx/tmp/robolab-playwright-qa.mjs` -> `playwright-inspection-pass`, 12/12 rooms, 17 screenshots, bad console 0, page errors 0. |
| Report artifact | PASS | `output/playwright/robolab-autonomous-qa-2026-04-26/report.json` and `summary.md`. |

Key screenshots:

- Menu: `output/playwright/robolab-autonomous-qa-2026-04-26/00-menu.png`
- Pause/settings: `output/playwright/robolab-autonomous-qa-2026-04-26/02-pause-settings.png`
- First-person camera: `output/playwright/robolab-autonomous-qa-2026-04-26/03-first-person-resumed.png`
- Effects + shot: `output/playwright/robolab-autonomous-qa-2026-04-26/04-effects-shot.png`
- Boss room: `output/playwright/robolab-autonomous-qa-2026-04-26/12-room-12.png`

## Room Ledger

| Room | Camera HUD | Objective text | Boss HUD | Observed | Result | Screenshot |
|---|---|---|---|---|---|---|
| 1 | Вид: 3-я особа | 0/5 мішеней - Нова велика арена. Збий п’ять мішеней, збери шестерні й знай зелений вихід. | - | standard room check; HUD/progress/canvas OK | Inspection pass | output/playwright/robolab-autonomous-qa-2026-04-26/01-room-1.png |
| 2 | Вид: 3-я особа | 0/5 роботів - Дрони патрулюють ангар. Використовуй укриття і не стій на місці. | - | standard room check; HUD/progress/canvas OK | Inspection pass | output/playwright/robolab-autonomous-qa-2026-04-26/02-room-2.png |
| 3 | Вид: 3-я особа | 0/3 кнопки - Знайди три кнопки в лабіринті. Коли всі світяться, біжи до виходу. | - | standard room check; HUD/progress/canvas OK | Inspection pass | output/playwright/robolab-autonomous-qa-2026-04-26/03-room-3.png |
| 4 | Вид: 3-я особа | дійди до виходу - Довга лазерна траса. Ривок і стрибок допоможуть пройти небезпечні смуги. | - | standard room check; HUD/progress/canvas OK | Inspection pass | output/playwright/robolab-autonomous-qa-2026-04-26/04-room-4.png |
| 5 | Вид: 3-я особа | 0/7 роботів - Майстерня широка. Вороги заходять з боків, аптечки заховані біля стін. | - | standard room check; HUD/progress/canvas OK | Inspection pass | output/playwright/robolab-autonomous-qa-2026-04-26/05-room-5.png |
| 6 | Вид: 3-я особа | 0/4 кнопки - Реактор має чотири кнопки. Натискай їх, ухиляючись від лазерів і дронів. | - | priority room checked; HUD/progress/canvas OK | Inspection pass | output/playwright/robolab-autonomous-qa-2026-04-26/06-room-6.png |
| 7 | Вид: 3-я особа | дійди до виходу - Тунель став довшим. Плануй ривки між укриттями і не забувай про аптечку. | - | standard room check; HUD/progress/canvas OK | Inspection pass | output/playwright/robolab-autonomous-qa-2026-04-26/07-room-7.png |
| 8 | Вид: 3-я особа | 0/7 роботів - Башти контролюють центр. Обходь флангами, збирай аптечки і вимикай турелі. | - | standard room check; HUD/progress/canvas OK | Inspection pass | output/playwright/robolab-autonomous-qa-2026-04-26/08-room-8.png |
| 9 | Вид: 3-я особа | 0/6 мішеней - Мішені заховані між контейнерами. Рухайся по всій карті, щоб знайти їх. | - | standard room check; HUD/progress/canvas OK | Inspection pass | output/playwright/robolab-autonomous-qa-2026-04-26/09-room-9.png |
| 10 | Вид: 3-я особа | 0/5 кнопки - П’ять кнопок, дві двері, багато ворогів. Це вже справжній виклик. | - | priority room checked; HUD/progress/canvas OK | Inspection pass | output/playwright/robolab-autonomous-qa-2026-04-26/10-room-10.png |
| 11 | Вид: 3-я особа | 0/8 роботів - Остання перевірка перед босом. Вороги наступають хвилями з усіх боків. | - | standard room check; HUD/progress/canvas OK | Inspection pass | output/playwright/robolab-autonomous-qa-2026-04-26/11-room-11.png |
| 12 | Вид: 3-я особа | ядро боса 100% - Фінал на великій карті. Лікуйся аптечками, рухайся колом і бий ядро боса. | Турбо-Вартовий 100% | priority room checked; HUD/progress/canvas OK | Inspection pass | output/playwright/robolab-autonomous-qa-2026-04-26/12-room-12.png |

## Guardrails

- Playwright was used only after the user's 2026-04-26 override: "может попробуй через playwright автономно".
- QA jumps are classified as **Inspection pass**, not `Pass` for human campaign completion.
- The browser warnings generated by screenshot readback were filtered as benign Chromium/WebGL `ReadPixels` performance messages; no app console errors or page errors remained.
- Browser Use remains a separate runtime blocker from the previous team lane; this document now records the authorized Playwright fallback evidence.

## Automated Verification Evidence

| Gate | Result | Output summary |
|---|---|---|
| Source-only tests | PASS | `npx vitest run --dir src` -> 13 files, 50 tests passed. |
| Default test script | PASS | `npm test` -> 13 files, 50 tests passed; `.omx`, `.playwright-cli`, `output` excluded by config. |
| Typecheck | PASS | `npx tsc --noEmit --pretty false --project tsconfig.json` -> no diagnostics. |
| Production build | PASS | `npm run build` completed; Vite emitted only the known >500 kB chunk warning for the Three.js game bundle. |

## Remaining Risk

The remaining gap is a true human-style full campaign victory run through all objectives and the boss without dev jumps. Current confidence is higher because Playwright verified every room visually and tests verify route reachability/balance, but this artifact intentionally does not overclaim manual completion.
