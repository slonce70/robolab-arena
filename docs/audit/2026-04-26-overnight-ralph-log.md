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
