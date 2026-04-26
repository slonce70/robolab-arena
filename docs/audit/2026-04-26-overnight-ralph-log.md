# Overnight Ralph Improvement Log

Date: 2026-04-26
Mode: `$ralph` autonomous overnight improvement loop

## Iteration 1 - Pause Room Intel

Goal: make the 12-room game easier to understand without weakening gameplay.

Changes:
- Added a pause-screen room intel panel with objective, threats, support pickups, and tactical guidance.
- Added `levelIntel` helpers that derive the guidance from existing level config instead of duplicating room data in UI code.
- Added tests to ensure every room has actionable pause guidance and that boss/laser rooms mention the right tactics.
- Verified the panel in Playwright with a screenshot artifact.

Evidence:
- `node .omx/tmp/robolab-room-intel-qa.mjs` -> `room-intel-playwright-pass`, 4 intel cards, 0 bad console, 0 page errors.
- `npm test` -> 14 files, 52 tests passed.
- `npm run build` -> success with the known Vite large chunk warning.
- `git diff --check` -> clean.

Artifact:
- `output/playwright/overnight-room-intel-2026-04-26/pause-room-intel.png`
- `output/playwright/overnight-room-intel-2026-04-26/report.json`

Remaining risk:
- The intel is text/UI guidance only; it does not replace a no-jump human victory run.

## Iteration 2 - Run Feedback Stats

Goal: make success/failure feedback more satisfying and useful without changing combat balance.

Changes:
- Added run-stat helpers for elapsed time, completed rooms, and restarts.
- Added room-complete and victory summaries so players see run time and retry count.
- Counted manual restarts and defeat reloads as restarts.
- Added unit tests for duration formatting and stat transitions.

Evidence:
- `npx vitest run --dir src` -> 15 files, 54 tests passed during implementation.
- `npm test` -> 15 files, 54 tests passed.
- `npm run build` -> success with the known Vite large chunk warning.
- `git diff --check` -> clean.

Remaining risk:
- Victory overlay text is unit-covered through formatting helpers; a full normal victory browser run is still not claimed.

## Iteration 3 - Continue From Unlocked Room

Goal: reduce frustration after reloads by letting players resume from their highest unlocked room.

Changes:
- Start screen now shows `Продовжити з кімнати N` when saved progress has unlocked later rooms.
- Continue starts a fresh run directly at the saved room, with score/gears reset and normal room HUD loaded.
- Fresh start remains available and still begins at room 1.

Evidence:
- `node .omx/tmp/robolab-continue-qa.mjs` -> `continue-flow-playwright-pass`, continued to `Кімната 6/12: Секретний реактор`, bad console 0, page errors 0.
- `npm test` -> 15 files, 54 tests passed.
- `npm run build` -> success with the known Vite large chunk warning.
- `git diff --check` -> clean.

Remaining risk:
- Continue is intentionally a fresh room start, not a save-state restore of health/score/projectiles.

## Iteration 4 - Reduced Motion Effects

Goal: make the game more comfortable for motion-sensitive players while keeping the neon style available by default.

Changes:
- Added a pause setting `Ефекти: повні/спокійні` backed by the existing `reducedMotion` storage field.
- Reduced spark/pulse lifetime, scale, and CSS animation/transition intensity when calm effects are enabled.
- Kept full effects as the default.

Evidence:
- `node .omx/tmp/robolab-reduced-motion-qa.mjs` -> `reduced-motion-playwright-pass`, persisted `reducedMotion: true`, bad console 0, page errors 0.
- `npm test` -> 15 files, 54 tests passed.
- `npm run build` -> success with the known Vite large chunk warning.
- `git diff --check` -> clean.

Remaining risk:
- Canvas camera/gameplay movement is unchanged; this setting currently calms effects and UI animation, not player locomotion.

## Iteration 5 - Start Progress Summary

Goal: make saved progress visible before pressing play.

Changes:
- Start screen now shows best score and highest unlocked room when saved progress exists.
- Continue button and progress summary share the same clamped saved-room value.

Evidence:
- `node .omx/tmp/robolab-start-progress-qa.mjs` -> `start-progress-playwright-pass`, displayed `Рекорд 3450 · відкрито кімнату 10/12`, bad console 0, page errors 0.
- `npm test` -> 15 files, 54 tests passed.
- `npm run build` -> success with the known Vite large chunk warning.
- `git diff --check` -> clean.

Remaining risk:
- Progress summary appears only after saved progress exists; first-run menu remains clean by design.

## Iteration 6 - Dev Shortcut Safety

Goal: keep QA shortcuts from causing unrelated setting changes during browser verification.

Changes:
- Refactored dev-only keyboard handling into a dedicated shortcut handler.
- Dev `KeyM` room-jump now returns before the normal mute shortcut, so QA midpoint navigation no longer toggles sound.
- Production mute behavior is unchanged because dev shortcuts only run under Vite dev mode while playing.

Evidence:
- `node .omx/tmp/robolab-dev-keym-qa.mjs` -> `dev-keym-shortcut-pass`, loaded room 6, bad console 0, page errors 0.
- `npm test` -> 15 files, 54 tests passed.
- `npm run build` -> success with the known Vite large chunk warning.
- `git diff --check` -> clean.

Remaining risk:
- This is intentionally dev-mode behavior; production builds do not expose the room-jump shortcut.

## Iteration 7 - Boss phase readability polish
- Problem: the final boss HUD only showed health percent, so a tired player could not tell why the arena pressure changed between boss phases.
- Change: added `describeBossStatus` as a small pure presenter, then made the boss HUD show health, phase number, phase name, and a short tactical warning.
- Visual polish: phase-specific HUD colors now move from cyan to amber to red glow for the final phase without changing boss balance.
- Evidence:
  - `npm test` PASS: 16 files / 57 tests.
  - `npm run build` PASS; only the existing Vite chunk-size warning.
  - Playwright QA `output/playwright/overnight-boss-phase-2026-04-26/report.json`: `boss-phase-playwright-pass`, room 12 boss HUD text `Турбо-Вартовий 100% · Фаза 1: Розвідка · повільні черги`, `badConsoleMessages: []`, `pageErrors: []`.
- Remaining risk: the automated browser check validates initial boss phase visibility; deeper phase transitions still require combat progression or a future deterministic boss-damage hook.

## Iteration 8 - Player feedback vignette for shield/damage readability
- Problem: shield and damage state had world particles, but in first-person a player could still miss whether the robot was protected, hit, lasered, or critically low.
- Change: added a pure `describePlayerFeedback` helper and a non-interactive HUD vignette layer driven by health, invulnerability, laser contact, and shield timers.
- Visual polish: shield now gives a cyan edge glow, bullet damage gives a red edge flash, laser contact adds scanline heat, and critical health keeps a low red/amber warning.
- Evidence:
  - `npm test` PASS: 17 files / 60 tests.
  - `npm run build` PASS; only the existing Vite chunk-size warning.
  - Playwright QA `output/playwright/overnight-feedback-vignette-2026-04-26/report.json`: `feedback-vignette-playwright-pass`, vignette classes included `is-shielded`, power HUD showed `Щит`, `badConsoleMessages: []`, `pageErrors: []`.
- Remaining risk: browser QA uses the DEV all-effects shortcut for deterministic shield validation; real combat damage colors are covered by helper tests and should be manually felt during a combat pass.

## Iteration 9 - Full room DOM smoke after HUD polish
- Purpose: after the boss and feedback HUD changes, rechecked that every DEV-jumped room still presents a room label, objective copy, and 12-dot progress strip.
- Evidence: Playwright DOM QA `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms inspected, `badConsoleMessages: 0`, `pageErrors: 0`.
- Note: the first screenshot-heavy version was stopped because repeated WebGL screenshots stalled after room 2; the final DOM smoke avoided that machine-specific ReadPixels bottleneck and still verified room/HUD continuity.

## Iteration 10 - Pause sensitivity controls made explicit
- Problem: pause already had sensitivity, but one cycling button was easy to overshoot and not clear for a sleepy player tuning first-person aim.
- Change: replaced the single cycle with explicit `− / current / +` controls and extracted sensitivity stepping into a pure helper.
- Evidence:
  - `npm test` PASS: 18 files / 63 tests.
  - `npm run build` PASS; only the existing Vite chunk-size warning.
  - Playwright QA `output/playwright/overnight-sensitivity-2026-04-26/report.json`: `sensitivity-controls-playwright-pass`, `1.0x → 1.2x → 1.0x`, persisted `mouseSensitivity: 1`, `badConsoleMessages: []`, `pageErrors: []`.
- Remaining risk: actual mouse-look feel still needs human hand tuning; automation verifies control behavior and persistence.

## Iteration 11 - Laser lanes made visually safer
- Problem: laser damage lanes were represented by a thin beam; in hectic rooms a player could clip invisible-feeling danger at the edge.
- Change: added a translucent orange/red floor footprint under every laser, wider than the damaging beam, while leaving actual damage math unchanged.
- Evidence:
  - `npm test` PASS: 19 files / 65 tests.
  - `npm run build` PASS; only the existing Vite chunk-size warning.
  - Playwright QA `output/playwright/overnight-laser-lanes-2026-04-26/report.json`: `laser-lanes-playwright-pass`, room 6 loaded, objective HUD visible, `badConsoleMessages: []`, `pageErrors: []`.
- Remaining risk: screenshot confirms the laser-room render path stays healthy, but visual taste should still be judged by eye in the in-app browser.

## Iteration 12 - Audio cues made more expressive
- Problem: door/victory/laser/boss sounds existed, but the audio manager treated them as one-beep frequency presets, making finale and door feedback less distinctive.
- Change: extracted tested sound profiles and gave door/victory multi-tone cues while keeping laser/boss as low warning timbres.
- Evidence:
  - `npm test` PASS: 20 files / 68 tests.
  - `npm run build` PASS; only the existing Vite chunk-size warning.
  - Playwright smoke `output/playwright/overnight-audio-smoke-2026-04-26/report.json`: `audio-profile-smoke-pass`, room 12 and power effect flow stayed error-free after audio-profile scheduling, `badConsoleMessages: []`, `pageErrors: []`.
- Remaining risk: headless automation validates scheduling safety but not subjective sound taste; final audio mix needs human listening with speakers/headphones.

## Iteration 13 - Exit pad lock/open readability
- Problem: the exit pad was always green even before the room objective was complete, which could make a player think the door/exit was broken when it did not finish the room.
- Change: added a tested exit-pad status presenter and made the pad orange/muted while locked, then pulsing green only after the objective is complete.
- Evidence:
  - `npm test` PASS: 21 files / 70 tests.
  - `npm run build` PASS; only the existing Vite chunk-size warning.
  - Playwright smoke `output/playwright/overnight-exit-pad-2026-04-26/report.json`: `exit-pad-smoke-pass`, room 1 HUD and objective loaded, `badConsoleMessages: []`, `pageErrors: []`.
- Remaining risk: automated smoke does not visually compare the material color; unit tests cover the lock/open state values and browser smoke confirms the render path remains healthy.

## Iteration 14 - Architect blocker fix: laser lane remains visible while inactive
- Problem found by architect: the laser warning lane was inside the same group that was hidden whenever the damaging beam was inactive, making the inactive `0.16` warning opacity branch ineffective.
- Change: kept the laser group visible, toggled only the damaging beam/posts, and extracted `describeLaserVisibility` so the inactive-visible warning contract is regression-tested.
- Evidence:
  - `npm test` PASS: 22 files / 72 tests.
  - `npm run build` PASS; only the existing Vite chunk-size warning.
  - Playwright QA `output/playwright/overnight-laser-lanes-2026-04-26/report.json`: `laser-lanes-playwright-pass`, room 6 loaded, `badConsoleMessages: []`, `pageErrors: []`.
- Remaining risk: Playwright smoke validates the room render path; the exact inactive warning-lane visual is protected by unit state tests and should still be judged by eye in a live browser pass.

## Iteration 15 - First-person crosshair weapon-state polish
- Problem: first-person weapon state was visible on the blaster model, but the crosshair did not reflect rapid/overcharge/firing feedback.
- Change: added a pure `getCrosshairClasses` presenter and crosshair visual states for firing, rapid fire, and overcharge, with reduced-motion behavior preserving the calmer mode.
- Evidence:
  - `npm test` PASS: 23 files / 75 tests.
  - `npm run build` PASS; only the existing Vite chunk-size warning.
  - Playwright QA `output/playwright/overnight-crosshair-2026-04-26/report.json`: `crosshair-feedback-playwright-pass`, first-person crosshair classes included `is-visible`, `is-rapid`, `is-overcharged`, `badConsoleMessages: []`, `pageErrors: []`.
- Remaining risk: automated QA validates state classes; actual firing pulse timing should be judged by eye during manual first-person combat.

## Iteration 16 - Power aura animation made testable and calmer-mode aware
- Problem: shield/rapid/overcharge rings were useful, but their animation math lived inline and did not share the calmer-effects reduction rules clearly.
- Change: added a pure `describePowerAuraState` helper that controls visibility, rotation speed, and pulse scale for all player power auras, including reduced-motion scaling.
- Evidence:
  - `npm test` PASS: 24 files / 78 tests.
  - `npm run build` PASS; only the existing Vite chunk-size warning.
  - Playwright QA `output/playwright/overnight-power-aura-2026-04-26/report.json`: `power-aura-playwright-pass`, all DEV power effects present, shield vignette active, `badConsoleMessages: []`, `pageErrors: []`.
- Remaining risk: helper tests protect state math; subjective aura beauty still needs human visual review in the in-app browser.

## Iteration 17 - Late-room pacing guardrails
- Problem: rooms 6, 10, and 12 are the balance hotspots, but support-pickup expectations were only implicit in level data.
- Change: added `summarizeLevelPacing` and `validateLateRoomSupport` tests so late rooms cannot silently lose repair/power-up support during future tuning.
- Evidence:
  - `npm test` PASS: 25 files / 80 tests.
  - `npm run build` PASS; only the existing Vite chunk-size warning.
  - Playwright DOM smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms inspected, `badConsoleMessages: 0`, `pageErrors: 0`.
- Remaining risk: this is a balance guardrail, not a substitute for a real human full-run difficulty judgment.

## Iteration 18 - Door open/closed feedback
- Problem: button rooms could still feel unclear because doors moved up, but their material stayed similarly bright and button sounds fired before the actual door was fully open.
- Change: added `describeDoorVisualStatus`, stored each door material, dimmed passable doors, and played a door spark/sound exactly when a door transitions open.
- Evidence:
  - `npm test` PASS: 26 files / 82 tests.
  - `npm run build` PASS; only the existing Vite chunk-size warning.
  - Playwright QA `output/playwright/overnight-door-status-2026-04-26/report.json`: `door-status-playwright-pass`, room 10 loaded, objective HUD visible, `badConsoleMessages: []`, `pageErrors: []`.
- Remaining risk: browser smoke validates the door-room render path; actual door transition timing should be watched in a manual button-room pass.

## Iteration 19 - Room-start briefing for late-game clarity
- Problem: after room jumps or room starts, the toast only repeated the level tip; it did not summarize pressure level, support pickups, or late-game caution.
- Change: added `createRoomBrief` and room-start toasts that summarize enemy/support/collectible counts and give a final-sector caution for rooms 10-12. DEV room jumps now keep the same room briefing instead of overwriting it with `QA: кімната N`.
- Evidence:
  - `npm test` PASS: 27 files / 84 tests.
  - `npm run build` PASS; only the existing Vite chunk-size warning.
  - Playwright QA `output/playwright/overnight-room-brief-2026-04-26/report.json`: `room-brief-playwright-pass`, room 12 toast included `7 ворогів`, `5 апгрейдів`, `5 шестерень`, and `Фінальний сектор`, with `badConsoleMessages: []`, `pageErrors: []`.
- Remaining risk: copy is concise and data-derived; final wording should still be read in the in-app browser for tone.

## Iteration 20 - Post-room-brief full room smoke
- Purpose: after changing room-start toast behavior and DEV room jumps, rechecked that all 12 rooms still load sequentially with HUD labels, objective text, and progress dots.
- Evidence: Playwright DOM smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms inspected, `badConsoleMessages: 0`, `pageErrors: 0`.
- Remaining risk: DOM smoke verifies continuity, not a no-jump human victory run.

## Iteration 21 - Architect blocker fix: normal start keeps room brief
- Problem found by architect: `startGame()` called `loadLevel()` and then overwrote the new room brief with generic start/continue toast copy, so normal start/continue did not reliably show pressure/support counts.
- Change: removed the post-`loadLevel()` generic toast so `showRoomStartToast()` is the single source for room-start guidance.
- Evidence:
  - `npm test` PASS: 28 files / 86 tests.
  - `npm run build` PASS; only the existing Vite chunk-size warning.
  - Playwright QA `output/playwright/overnight-room-brief-normal-2026-04-26/report.json`: `room-brief-normal-playwright-pass`, normal start toast includes room 1 stats, continue to room 10 toast includes `Фінальний сектор` and `5 ворогів`, `badConsoleMessages: []`, `pageErrors: []`.
- Remaining risk: room brief wording still needs human tone review, but normal start/continue coverage now catches the overwrite regression.

## Iteration 22 - Target visual state made testable
- Problem: target hit/active material changes were inline, which made future target readability tweaks easy to break without focused tests.
- Change: added `describeTargetStatus` so active targets stay yellow/full-size and hit targets become green/smaller through a tested presenter.
- Evidence:
  - `npm test` PASS: 28 files / 86 tests.
  - `npm run build` PASS; only the existing Vite chunk-size warning.
  - Playwright DOM smoke previously rerun after this change: `12-room-dom-smoke-pass`, 12 rooms inspected, `badConsoleMessages: 0`, `pageErrors: 0`.
- Remaining risk: target hit animation is state-tested, but target shooting feel still needs manual aim checks.

## Iteration 23 - Build warning signal cleaned up
- Problem: Vite's large-chunk warning appeared on every build, making real future bundle regressions easier to miss even though most weight came from Three.js.
- Change: added a minimal Vite manual chunk for `three` and a focused config test that locks the cacheable vendor-chunk intent.
- Evidence:
  - `npm test` PASS: 29 files / 87 tests.
  - `npm run build` PASS with no large-chunk warning; JS split into app chunk around 81 kB and `three` chunk around 487 kB.
- Remaining risk: local Vite production build is verified; real CDN/browser-cache behavior was not measured.

## Iteration 24 - Room brief Ukrainian count polish
- Problem: room-start stats were mechanically correct but sounded rough in Ukrainian, e.g. `3 ворогів`, `1 апгрейдів`, and `1 дверей`.
- Change: added a small count formatter for room-brief nouns and locked common one/few/many forms with tests.
- Evidence:
  - TDD red: `npm test -- src/game/roomBrief.test.ts` failed on the old awkward count strings.
  - Focused green: `npm test -- src/game/roomBrief.test.ts` PASS: 3 tests.
  - Full regression: `npm test` PASS: 29 files / 88 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Playwright QA `output/playwright/overnight-room-brief-normal-2026-04-26/report.json`: `room-brief-normal-playwright-pass`, start toast now includes `1 апгрейд` and `4 шестерні`, continue toast includes `3 апгрейди` and `3 шестерні`, with `badConsoleMessages: []`, `pageErrors: []`.
- Remaining risk: `двері` is a compact game stat label; a future copy pass could switch that row to `дверний замок` if more natural specificity is desired.

## Iteration 25 - First-person blaster feedback made regression-safe
- Problem: the first-person blaster flash/recoil/coil state was visually useful but still lived inline in `Game`, making future weapon-feel polish easy to regress without focused assertions.
- Change: extracted `describeFirstPersonBlasterState` so idle, rapid-fire, and overcharge flash/recoil/coil behavior is tested independently, then reused it from the render update.
- Evidence:
  - TDD red: `npm test -- src/game/blasterFeedback.test.ts` first failed because the presenter did not exist.
  - Focused green: `npm test -- src/game/blasterFeedback.test.ts` PASS: 3 tests.
  - Full regression: `npm test` PASS: 30 files / 91 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Playwright QA `output/playwright/overnight-crosshair-2026-04-26/report.json`: `crosshair-feedback-playwright-pass`, first-person power/crosshair state healthy, `badConsoleMessages: []`, `pageErrors: []`.
- Remaining risk: exact recoil feel is still subjective and should be judged by hand while firing in first-person combat.

## Iteration 26 - Pause intel count copy polished
- Problem: pause-screen room intel still used fixed noun labels, so some rooms read mechanically (`1 турелі`, `2 ремонт`, `5 шестерні`) even after room-start briefs were polished.
- Change: extracted the Ukrainian one/few/many count formatter into a shared helper and reused it from both room-start briefs and pause intel threat/support summaries.
- Evidence:
  - Cleanup plan written before refactor: lock pause-intel copy, extract only proven count logic, reuse in room brief and level intel, then rerun focused/full/browser checks.
  - TDD red: `npm test -- src/game/levelIntel.test.ts` failed on old `1 турелі` wording.
  - Focused green: `npm test -- src/game/ukrainianCounts.test.ts src/game/levelIntel.test.ts src/game/roomBrief.test.ts` PASS: 7 tests.
  - Full regression: `npm test` PASS: 31 files / 93 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Playwright QA `output/playwright/overnight-room-intel-2026-04-26/report.json`: `room-intel-playwright-pass`, four pause intel cards present, `badConsole: 0`, `pageErrors: 0`.
- Remaining risk: wording is now grammatically cleaner, but a human copy pass could still rename English-flavored `rapid-вогонь` if desired.

## Iteration 27 - Pause support naming localized
- Problem: after count grammar was fixed, pause support copy still mixed English and Ukrainian with `rapid-вогонь`.
- Change: renamed the generated rapid support label to Ukrainian `прискорювач` forms while leaving gameplay, pickup kind, HUD power text, and level data untouched.
- Evidence:
  - TDD red: `npm test -- src/game/levelIntel.test.ts` failed while the pause support summary still contained `rapid-вогонь` instead of `прискорювач`.
  - Focused green: `npm test -- src/game/levelIntel.test.ts` PASS: 3 tests.
  - Full regression: `npm test` PASS: 31 files / 93 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Playwright QA `output/playwright/overnight-room-intel-2026-04-26/report.json`: `room-intel-playwright-pass`, four pause intel cards present, `badConsole: 0`, `pageErrors: 0`.
- Remaining risk: HUD active-power text still says `Rapid` by design for compact combat readability; it can be localized in a separate HUD-specific pass.

## Iteration 28 - Active power HUD localized
- Problem: the pause intel support label was fully Ukrainian, but the live HUD still showed `Rapid` during combat.
- Change: added a small `describePowerStatus` presenter and changed the HUD active-power text to `Прискорення`, while keeping shield/charge copy and empty state intact.
- Evidence:
  - TDD red: `npm test -- src/game/powerStatus.test.ts` failed before the presenter existed.
  - Focused green: `npm test -- src/game/powerStatus.test.ts` PASS: 2 tests.
  - Full regression: `npm test` PASS: 32 files / 95 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Playwright QA `output/playwright/overnight-crosshair-2026-04-26/report.json`: `crosshair-feedback-playwright-pass`, power text now `Прискорення 8с + Щит 9с + Заряд x1`, `badConsoleMessages: []`, `pageErrors: []`.
- Remaining risk: active power wording is now localized; final subjective HUD brevity should be judged during manual combat.

## Iteration 29 - Reduced-motion blaster feedback
- Problem: calmer effects reduced CSS/crosshair motion, but first-person blaster flash/recoil still used the full overcharge kick.
- Change: extended `describeFirstPersonBlasterState` with `reducedMotion`, calming flash scale, coil scale, and recoil while preserving normal idle/rapid/overcharge behavior.
- Evidence:
  - TDD red: `npm test -- src/game/blasterFeedback.test.ts` failed on the new reduced-motion expectation before implementation.
  - Focused green: `npm test -- src/game/blasterFeedback.test.ts` PASS: 4 tests.
  - Full regression: `npm test` PASS: 32 files / 96 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Playwright QA `output/playwright/overnight-crosshair-2026-04-26/report.json`: `crosshair-feedback-playwright-pass`, localized power text intact, `badConsoleMessages: []`, `pageErrors: []`.
- Remaining risk: reduced-motion blaster math is state-tested; subjective comfort still needs a human reduced-motion play pass.

## Iteration 30 - Objective-complete HUD glow
- Problem: completed objectives changed text and opened the exit pad, but the central objective chip did not get a stronger visual success state.
- Change: added `describeObjectiveHud`, applied an `is-complete` class when the objective is done, and styled it with a green glow so the exit-ready moment is easier to notice.
- Evidence:
  - TDD red: `npm test -- src/game/objectives.test.ts` failed before `describeObjectiveHud` existed.
  - Focused green: `npm test -- src/game/objectives.test.ts` PASS: 5 tests.
  - Full regression: `npm test` PASS: 32 files / 97 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Playwright QA `output/playwright/overnight-exit-pad-2026-04-26/report.json`: `exit-pad-smoke-pass`, room 1 objective HUD still renders, `badConsoleMessages: []`, `pageErrors: []`.
- Remaining risk: smoke verifies the HUD render path; the exact green success glow should still be judged visually after completing a room.
