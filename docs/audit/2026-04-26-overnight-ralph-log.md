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
