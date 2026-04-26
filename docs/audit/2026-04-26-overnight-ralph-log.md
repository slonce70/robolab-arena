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

## Iteration 31 - Run summary copy polished
- Problem: room/victory summaries used rough counter order such as `пройдено 1 · рестарти 1`, which looked less polished than the rest of the localized HUD.
- Change: reused `formatUkrainianCount` for completed-room and restart counts so summaries read `пройдено 1 кімнату · 1 рестарт` and `пройдено 2 кімнати`.
- Evidence:
  - TDD red: `npm test -- src/game/runStats.test.ts` failed on the old rough summary wording.
  - Focused green: `npm test -- src/game/runStats.test.ts` PASS: 2 tests.
  - Full regression: `npm test` PASS: 32 files / 97 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
- Remaining risk: final victory copy is string-tested, but the complete victory overlay still needs a true normal full-run playthrough to judge pacing.

## Iteration 32 - Controls hint matches actual inputs
- Problem: the HUD hint listed Space for jump but the gameplay code also supports `E`, and it did not mention Escape pause.
- Change: extracted `getControlsHint` and updated the HUD hint to include `Space/E - стрибок` and `Esc - пауза`.
- Evidence:
  - TDD red: `npm test -- src/game/controlsHint.test.ts` failed before the helper existed.
  - Focused green: `npm test -- src/game/controlsHint.test.ts` PASS: 1 test.
  - Full regression: `npm test` PASS: 33 files / 98 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Playwright QA `output/playwright/overnight-exit-pad-2026-04-26/report.json`: `exit-pad-smoke-pass`, first room HUD still renders, `badConsoleMessages: []`, `pageErrors: []`.
- Remaining risk: hint text is more complete; narrow/mobile HUD wrapping still needs visual review on very small screens.

## Iteration 33 - Architect blocker fix: Esc hint made truthful
- Problem found by architect: the new hint said `Esc - пауза`, but in first-person pointer capture the first Escape frees the cursor before a later Escape pauses.
- Change: changed the tested hint copy to `Esc - курсор/пауза`, accurately covering both first-person cursor release and normal pause behavior.
- Evidence:
  - TDD red: `npm test -- src/game/controlsHint.test.ts` failed when the test expected `Esc - курсор/пауза` but the helper still said `Esc - пауза`.
  - Focused green: `npm test -- src/game/controlsHint.test.ts` PASS: 1 test.
  - Full regression: `npm test` PASS: 33 files / 98 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
- Remaining risk: text is truthful now; narrow/mobile wrapping remains a separate visual-review item.

## Iteration 34 - Narrow HUD browser evidence
- Purpose: after extending the controls hint, verify the documented narrow/mobile wrapping risk instead of changing CSS blindly.
- Evidence:
  - Playwright QA `output/playwright/overnight-narrow-hud-2026-04-26/report.json`: `narrow-hud-pass` at 390x844 mobile viewport.
  - The long hint is hidden on narrow layout (`hintDisplay: none`), objective chip stays inside viewport (`x: 10`, `right: 380` on width 390), status row stays inside viewport (`x: 10`, `right: 380`), `badConsole: 0`, `pageErrors: 0`.
- Change: no code change; evidence only.
- Remaining risk: phone landscape and very short desktop are covered by CSS media rules but not re-smoked in this specific iteration.

## Iteration 35 - Fresh 12-room continuity smoke after polish batch
- Purpose: after the HUD/copy/accessibility polish batch, rerun broad browser continuity to ensure every room still loads and reports clean DOM/HUD state.
- Evidence:
  - Playwright DOM smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms inspected, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `npm test` PASS: 33 files / 98 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
- Change: no code change; broad regression evidence only.
- Remaining risk: still not a normal human no-jump victory run; it is a room-load/HUD continuity smoke.

## Iteration 36 - Pause intel label color protected
- Problem: pause-room intel labels referenced an undefined CSS token (`--accent`), so the intended cyan label color depended on CSS fallback/inheritance instead of the design token system.
- Change: changed the pause intel label color to the existing `--cyan` token and added a regression test that fails on any undefined CSS custom-property reference in `src/styles.css`.
- Evidence:
  - TDD red: `npm test -- src/game/styleTokens.test.ts` failed with missing token `accent` before the CSS fix.
  - Focused green: `npm test -- src/game/styleTokens.test.ts` PASS: 1 test.
  - Full regression: `npm test` PASS: 34 files / 99 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning after the test was changed to use Vite `?raw` instead of Node-only imports.
  - Playwright QA `output/playwright/overnight-pause-label-color-2026-04-26/report.json`: `pause-label-color-pass`, all four pause intel labels computed as `rgb(84, 241, 255)`, `badConsole: []`, `pageErrors: []`.
  - `git diff --check` PASS.
- Remaining risk: this protects CSS token hygiene and pause label color; it does not replace a full human no-jump victory run.

## Iteration 37 - Camera HUD copy fully Ukrainian
- Problem: the live HUD and pause camera button still used mixed `3-я/1-а особа` wording, which was understandable but less polished than the rest of the Ukrainian interface.
- Change: updated the camera presenter copy to `Вид: від 3-ї особи` / `Вид: від 1-ї особи` and locked it in `CameraController` tests.
- Evidence:
  - TDD red: `npm test -- src/game/camera/CameraController.test.ts` failed when the test expected the polished Ukrainian labels and production still returned the old mixed wording.
  - Focused green: `npm test -- src/game/camera/CameraController.test.ts` PASS: 7 tests.
  - Full regression: `npm test` PASS: 34 files / 99 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Playwright QA `output/playwright/overnight-camera-label-2026-04-26/report.json`: `camera-label-pass`; HUD showed `Вид: від 3-ї особи`, after camera toggle `Вид: від 1-ї особи`, and pause camera button also showed `Вид: від 1-ї особи`; `badConsole: []`, `pageErrors: []`.
  - `git diff --check` PASS.
- Remaining risk: labels are verified in HUD and pause overlay; this still does not claim a full normal human no-jump victory run.

## Iteration 38 - Objective counters read naturally
- Problem: objective HUD counters used compact slash wording like `0/3 кнопки`, which was short but awkward in Ukrainian, especially for button rooms.
- Change: changed target/enemy/button objective counters to `done з total noun` wording using the shared Ukrainian count helper with objective-specific genitive forms.
- Evidence:
  - TDD red: `npm test -- src/game/objectives.test.ts` failed when tests expected `3 з 5 мішеней`, `1 з 1 мішені`, and `2 з 4 кнопок` while production still returned slash counters.
  - Focused green: `npm test -- src/game/objectives.test.ts` PASS: 6 tests.
  - Full regression: `npm test` PASS: 34 files / 100 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Playwright QA `output/playwright/overnight-objective-copy-2026-04-26/report.json`: `objective-copy-pass`; room 1 objective started with `0 з 5 мішеней`, room 3 objective started with `0 з 3 кнопок`, `badConsole: []`, `pageErrors: []`.
  - `git diff --check` PASS.
- Remaining risk: objective copy is more natural and browser-smoked in rooms 1 and 3; this still does not claim a full normal human no-jump victory run.

## Iteration 39 - Power HUD typography polish
- Problem: the power HUD still used technical typography (`Апгрейди -`, `Заряд x2`) while the rest of the UI had moved toward polished localized copy.
- Change: changed the empty power state to `Апгрейди —` and overcharge counts to `Заряд ×N`.
- Evidence:
  - TDD red: `npm test -- src/game/powerStatus.test.ts` failed when tests expected the em dash and multiplication sign while production still returned hyphen/Latin `x`.
  - Focused green: `npm test -- src/game/powerStatus.test.ts` PASS: 2 tests.
  - Full regression: `npm test` PASS: 34 files / 100 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Playwright QA `output/playwright/overnight-crosshair-2026-04-26/report.json`: `crosshair-feedback-playwright-pass`, active power text now `Прискорення 8с + Щит 9с + Заряд ×1`, `badConsoleMessages: []`, `pageErrors: []`.
  - `git diff --check` PASS.
- Remaining risk: typographic HUD polish is verified; it still does not replace a full normal human no-jump victory run.

## Iteration 40 - Saved progress cap hardened
- Problem: `loadSettings`/`saveSettings` clamped saved progress at the low end but allowed impossible high room unlock values, so corrupted localStorage could store progress beyond the 12-room campaign even though the menu later had to clamp it.
- Change: tied storage sanitization to `LEVELS.length` and capped `highestUnlockedRoom` at the campaign length.
- Evidence:
  - TDD red: `npm test -- src/game/storage.test.ts` failed when a new test expected `highestUnlockedRoom: 99` to sanitize to the campaign length but production returned `99`.
  - Focused green: `npm test -- src/game/storage.test.ts` PASS: 6 tests.
  - Full regression: `npm test` PASS: 34 files / 101 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Playwright QA `output/playwright/overnight-progress-cap-2026-04-26/report.json`: `progress-cap-pass`; corrupted `highestUnlockedRoom: 99` rendered as `відкрито кімнату 12/12`, continue button targeted room 12 (`data-start-level="11"`), `badConsole: []`, `pageErrors: []`.
  - Fresh 12-room smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: progress corruption is now bounded; this still does not claim a full normal human no-jump victory run.

## Iteration 41 - Pause intel prose dash polish
- Problem: the room 1 pause intel fallback threat text still used a plain hyphen in prose (`головна загроза - маршрут і таймінг`), which stood out after the broader UI typography polish.
- Change: changed fallback pause intel prose to use an em dash for both no-threat and no-support fallback copy.
- Evidence:
  - TDD red: `npm test -- src/game/levelIntel.test.ts` failed when the new test expected `головна загроза — маршрут і таймінг` and production still returned the hyphenated phrase.
  - Focused green: `npm test -- src/game/levelIntel.test.ts` PASS: 4 tests.
  - Full regression: `npm test` PASS: 34 files / 102 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Playwright QA `output/playwright/overnight-room-intel-2026-04-26/report.json`: `room-intel-playwright-pass`, 4 pause intel cards, `badConsole: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: fallback prose is polished and pause-smoked; this still does not claim a full normal human no-jump victory run.

## Iteration 42 - Objective chip separator polish
- Problem: the objective HUD had natural Ukrainian counters, but `Game` still joined the counter and room tip inline with a plain ` - ` separator.
- Change: added `formatObjectiveHint` to the objective presenter and changed the live HUD to use an em dash separator (`—`) instead of inline string assembly in `Game`.
- Evidence:
  - TDD red: `npm test -- src/game/objectives.test.ts` failed because `formatObjectiveHint` did not exist before implementation.
  - Focused green: `npm test -- src/game/objectives.test.ts` PASS: 7 tests.
  - Full regression: `npm test` PASS: 34 files / 103 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Playwright QA `output/playwright/overnight-objective-copy-2026-04-26/report.json`: `objective-copy-pass`; room 1 objective rendered `0 з 5 мішеней — ...`, room 3 rendered `0 з 3 кнопок — ...`, `badConsole: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: objective HUD typography is browser-smoked; this still does not claim a full normal human no-jump victory run.

## Iteration 43 - First-person cursor toast copy polished
- Problem: first-person pointer/cursor toasts still used plain hyphens in prose and kept those strings inline in `Game`, making future copy polish easy to miss.
- Change: added `getPointerLockToast` next to the pointer-lock rules and changed first-person capture/release toasts to use em dash separators.
- Evidence:
  - TDD red: `npm test -- src/game/pointerLock.test.ts` failed because `getPointerLockToast` did not exist before implementation.
  - Focused green: `npm test -- src/game/pointerLock.test.ts` PASS: 3 tests.
  - Full regression: `npm test` PASS: 34 files / 104 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Playwright QA `output/playwright/overnight-pointer-toast-2026-04-26/report.json`: `pointer-toast-pass`; first-person capture toast `Приціл активний. Esc — показати курсор.`, release toast `Курсор вільний. Клік по арені — повернути приціл.`, `badConsole: []`, `pageErrors: []`.
  - `git diff --check` PASS.
- Remaining risk: first-person toast copy is browser-smoked; this still does not claim a full normal human no-jump victory run.

## Iteration 44 - Victory copy honest after continue
- Problem: if a player continued from a late unlocked room and beat the boss, the final overlay still used the full-run wording, even though the current run statistics only covered the resumed segment.
- Change: added `formatVictoryOverlayIntro` so the victory overlay celebrates a full 12-room run only when the current run completed all rooms, and otherwise describes the finished late-game segment honestly.
- Evidence:
  - TDD red: `npm test -- src/game/victoryCopy.test.ts` failed before `victoryCopy.ts` existed.
  - Focused green: `npm test -- src/game/victoryCopy.test.ts` PASS: 2 tests.
  - Full regression: `npm test` PASS: 35 files / 106 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: victory copy logic is unit-covered and broad room smoke still passes, but the exact final victory overlay text was not browser-triggered through a normal no-jump boss kill in this iteration.

## Iteration 45 - Room-start pressure guardrail
- Purpose: protect the “no weird immediate damage / no bad spawn” requirement with a regression guard while moving from UI polish back into gameplay balance.
- Change: added a level validation test that ensures every room starts the player away from immediate enemy, laser, and obstacle pressure.
- Evidence:
  - Focused guard: `npm test -- src/game/levelValidation.test.ts` PASS: 5 tests; all current rooms already satisfy the spawn-clearance invariant.
  - Full regression: `npm test` PASS: 35 files / 107 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: this is a protective geometry/balance invariant, not a human normal no-jump full victory run.

## Iteration 46 - Reward placement readability fixes
- Problem: the campaign had a few rewards too close to enemies: room 8 rapid pickup shared the shieldBot position, room 11 overcharge sat beside the rear turret, and final-room corner gears were too close to rear turrets.
- Change: added a reward readability guard that prevents collectibles/power-ups from being hidden inside enemies or obstacles, then moved the overlapping rewards to nearby readable positions without removing support.
- Evidence:
  - TDD red: `npm test -- src/game/levelValidation.test.ts` failed on reward/enemy overlap (`Сторожові башти`, then later-room overlaps after the first fix) before the reward positions were moved.
  - Focused green: `npm test -- src/game/levelValidation.test.ts` PASS: 6 tests.
  - Full regression: `npm test` PASS: 35 files / 108 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: reward placement is geometry-guarded and room-smoked; this still does not claim a full normal human no-jump victory run.

## Iteration 47 - Laser spawn guard uses runtime beam footprint
- Problem: architect review found the room-start laser invariant only measured distance to laser centers, while runtime damage is a long beam segment with optional sweep; this could miss unfair spawn damage from long lasers.
- Change: added `getLaserDangerClearance` beside the laser footprint presenter, covering damaging beam length, 0.35 half-width, and full sweep envelope; changed the spawn-pressure guard to use that runtime-shaped clearance.
- Evidence:
  - TDD red: `npm test -- src/game/laserHazard.test.ts` failed because `getLaserDangerClearance` did not exist, with regression cases showing a point >4 units from the laser center but still inside the damaging beam.
  - Focused green: `npm test -- src/game/levelValidation.test.ts src/game/laserHazard.test.ts` PASS: 2 files / 10 tests.
  - Full regression: `npm test` PASS: 35 files / 110 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: laser spawn safety is now runtime-footprint guarded, but this still does not claim a full normal human no-jump victory run.

## Iteration 48 - Rewards avoid active laser lanes
- Problem: after the runtime-shaped laser clearance helper existed, the reward readability guard still covered enemies and obstacles but not active/sweeping laser lanes; room 6 support pickups and room 7 gears sat inside damaging laser envelopes.
- Change: extended the reward readability invariant to require laser clearance, then moved room 6 support pickups off the vertical reactor beam and room 7 early gears out of the sweeping tunnel lane.
- Evidence:
  - TDD red: `npm test -- src/game/levelValidation.test.ts` failed on `Секретний реактор reward/laser overlap: expected -0.35 to be greater than or equal to 1.2` after adding the reward/laser guard.
  - Focused green: `npm test -- src/game/levelValidation.test.ts` PASS: 6 tests.
  - Full regression: `npm test` PASS: 35 files / 110 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: reward/laser placement is geometry-guarded and smoke-tested; this still does not claim a full normal human no-jump victory run.

## Iteration 49 - Shared runtime laser damage geometry
- Cleanup plan: lock the instantaneous beam hitbox in `laserHazard.test`, then replace the inline `Game.updateLasers` beam math with the shared helper so validation and runtime geometry do not drift again.
- Change: added `isPointInLaserDamage` beside the laser clearance helpers and made `Game.updateLasers` call it for live laser contact damage.
- Evidence:
  - TDD red: `npm test -- src/game/laserHazard.test.ts` failed because `isPointInLaserDamage` did not exist before implementation.
  - Focused green: `npm test -- src/game/laserHazard.test.ts` PASS: 5 tests.
  - Full regression: `npm test` PASS: 35 files / 111 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: runtime laser damage math is now shared and test-covered; this still does not claim a full normal human no-jump victory run.

## Iteration 50 - Laser contact audio cooldown
- Problem: continuous laser damage could call the laser sound every frame while the player stood in the beam, making laser contact feel noisy instead of readable.
- Change: added `shouldPlayLaserContactAudio` so laser damage remains continuous, but the laser sound only fires when the existing contact flash timer has cooled down.
- Evidence:
  - TDD red: `npm test -- src/game/playerFeedback.test.ts` failed because `shouldPlayLaserContactAudio` did not exist before implementation.
  - Focused green: `npm test -- src/game/playerFeedback.test.ts` PASS: 4 tests.
  - Full regression: `npm test` PASS: 35 files / 112 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: laser audio is throttled through the existing feedback timer, but this still does not claim a full normal human no-jump victory run.

## Iteration 51 - Sweeping laser warning corridors
- Problem: sweeping lasers moved their damaging beam across a wider corridor, but the orange floor warning lane still displayed only the narrow static beam footprint, making room 6 and 7 laser motion less readable.
- Change: expanded `getLaserHazardFootprint` so sweep distance widens the warning lane perpendicular to the laser axis while preserving the actual beam length.
- Evidence:
  - TDD red: `npm test -- src/game/laserHazard.test.ts` failed because a sweeping x-axis laser still reported `depth: 0.72` instead of the full `6.72` corridor.
  - Focused green: `npm test -- src/game/laserHazard.test.ts` PASS: 6 tests.
  - Full regression: `npm test` PASS: 35 files / 113 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: sweep warning geometry is unit-covered and smoke-tested, but this still does not claim a full normal human no-jump victory run.

## Iteration 52 - Static sweep warning corridor anchoring
- Problem: architect review correctly blocked Iteration 51 because the widened warning lane was still a child of the moving laser group, so the full corridor shifted with the beam instead of staying centered on the base sweep envelope.
- Change: added `getLaserWarningLaneOffset` and applied it in `Game.updateLasers` so sweeping warning lanes remain visually anchored to `basePosition` while beam/posts keep moving.
- Evidence:
  - TDD red: `npm test -- src/game/laserHazard.test.ts` failed because `getLaserWarningLaneOffset` did not exist before implementation.
  - Focused green: `npm test -- src/game/laserHazard.test.ts` PASS: 7 tests.
  - Full regression: `npm test` PASS: 35 files / 114 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: static sweep warning anchoring is helper-covered and browser-smoked; this still does not claim a full normal human no-jump victory run.

## Iteration 53 - Pause settings browser QA
- Purpose: verify the user-facing pause/settings surface as a real browser flow before adding more code.
- Result: no defect found in the current pause controls.
- Evidence:
  - Playwright QA `output/playwright/overnight-pause-settings-2026-04-26/report.json`: `pause-settings-pass`.
  - Verified pause opens on `Escape`, room title is `Кімната 1: Великий запуск`, sensitivity changes from `1.0x` to `1.2x`, camera button switches to `Вид: від 1-ї особи`, sound button switches to `Звук: вимкнено`, restart hides overlay and keeps room 1 loaded, resume hides overlay, `badConsole: []`, `pageErrors: []`.
- Remaining risk: pause settings have browser-flow evidence; this still does not claim a full normal human no-jump victory run.

## Iteration 54 - Expressive boss phase visuals
- Problem: boss phases were communicated through HUD text and attack pattern, but the boss core/crown visuals did not clearly shift color and urgency between phases.
- Change: added `describeBossPhaseVisual` and wired boss update to phase-specific core/crown color, emissive intensity, scale pulse, and crown rotation speed, with reduced-motion calming preserved.
- Evidence:
  - TDD red: `npm test -- src/game/bossPhaseVisual.test.ts` failed because `bossPhaseVisual.ts` did not exist before implementation.
  - Focused green: `npm test -- src/game/bossPhaseVisual.test.ts src/game/bossStatus.test.ts` PASS: 2 files / 6 tests.
  - Full regression: `npm test` PASS: 36 files / 117 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: boss phase visuals are unit-covered and room-smoked; this still does not claim a full normal human no-jump victory run.

## Iteration 55 - Controls hint typography polish
- Problem: the always-visible controls hint still used plain hyphen separators while the rest of the Ukrainian UI copy had been polished to use em dashes.
- Change: updated `getControlsHint` copy to use em dash separators for each shortcut/action pair.
- Evidence:
  - TDD red: `npm test -- src/game/controlsHint.test.ts` failed because the hint still contained `C - вид` instead of `C — вид`.
  - Focused green: `npm test -- src/game/controlsHint.test.ts` PASS: 1 test.
  - Browser QA `output/playwright/overnight-controls-hint-2026-04-26/report.json`: `controls-hint-pass`, visible hint `WASD — рух, мишка — приціл, клік — постріл, C — вид, Shift — ривок, Space/E — стрибок, R — перезапуск, Esc — курсор/пауза`, no `badConsole`, no `pageErrors`.
  - Full regression: `npm test` PASS: 36 files / 117 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: HUD hint typography is unit/browser covered; this still does not claim a full normal human no-jump victory run.

## Iteration 56 - Support pickup route guard
- Purpose: strengthen the full-campaign geometry guard so optional support is not only present and well-placed, but actually reachable during normal play.
- Change: extended `campaignPlaythrough.test.ts` to include collectibles and power-ups in the reachable route validation after doors are open.
- Evidence:
  - Focused guard: `npm test -- src/game/campaignPlaythrough.test.ts` PASS: support pickups in all 12 rooms are reachable with current geometry.
  - Full regression: `npm test` PASS: 36 files / 117 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: support reachability is now geometry-guarded, but this still does not claim a full normal human no-jump victory run.

## Iteration 57 - Pre-door support reachability guard
- Purpose: make the support route guard stricter for pressure rooms: support pickups should be reachable before doors open, not only after the objective has already been solved.
- Change: changed the support pickup route validation to use closed-door reachability/solids.
- Evidence:
  - Focused guard: `npm test -- src/game/campaignPlaythrough.test.ts` PASS: all current collectibles and power-ups are reachable before doors open.
  - Full regression: `npm test` PASS: 36 files / 117 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: pre-door support reachability is guarded, but this still does not claim a full normal human no-jump victory run.

## Iteration 58 - Level-complete overlay indentation cleanup
- Cleanup plan: keep this pass behavior-neutral, touch only the visibly misindented `completeLevel()` branch, then rerun focused and full gates.
- Change: fixed indentation/blank-line structure around the non-final `showOverlay('Кімнату пройдено!')` branch for readability.
- Evidence:
  - Focused behavior-adjacent tests: `npm test -- src/game/victoryCopy.test.ts src/game/runStats.test.ts` PASS: 2 files / 4 tests.
  - Full regression: `npm test` PASS: 36 files / 117 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: cleanup is behavior-neutral and smoke-tested; this still does not claim a full normal human no-jump victory run.

## Iteration 59 - Exit pad locked/open label clarity
- Problem: the exit pad color/pulse changed when the room objective opened, but the floating label could still look like a generic exit sign before the player was allowed to leave.
- Change: added player-facing exit labels to `describeExitPadStatus`, initialized room exit signs as `ЗАЧИНЕНО`, and swapped the sprite to `ВИХІД` when the objective completes while disposing the old sprite material/texture.
- Evidence:
  - TDD red: `npm test -- src/game/exitStatus.test.ts` failed before implementation because `status.label` was undefined for the open state.
  - Focused green: `npm test -- src/game/exitStatus.test.ts` PASS: 2 tests.
  - Full regression: `npm test` PASS: 36 files / 117 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: exit label text is presenter-covered and browser-smoked, but canvas sprite text is not DOM-readable and this still does not claim a full normal human no-jump victory run.

## Iteration 60 - Door-open feedback toast
- Problem: pressure doors had audio/spark feedback when they opened, but the HUD text did not clearly tell the player that the route was now passable, which could make multi-button rooms feel uncertain.
- Change: added `describeDoorOpenedToast` for polished Ukrainian one/many door copy and show one concise toast after any doors open during the frame.
- Evidence:
  - TDD red: `npm test -- src/game/doorStatus.test.ts` failed because `describeDoorOpenedToast` did not exist before implementation.
  - Focused green: `npm test -- src/game/doorStatus.test.ts` PASS: 3 tests.
  - Full regression: `npm test` PASS: 36 files / 118 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: door-open copy is helper-covered and smoke-tested; this still does not claim a full normal human no-jump victory run.

## Iteration 61 - First-person resume recaptures aim
- Problem: after pausing in first-person, the player could press `Продовжити` and remain in first-person view without immediately refreshing pointer capture, forcing an extra arena click before mouse-look felt right.
- Change: added a pointer-lock resume rule and made `resumeFromPause()` request first-person capture again after hiding the pause overlay.
- Evidence:
  - TDD red: `npm test -- src/game/pointerLock.test.ts` failed because `shouldRefreshFirstPersonCaptureOnResume` did not exist before implementation.
  - Focused green: `npm test -- src/game/pointerLock.test.ts` PASS: 4 tests.
  - Full regression: `npm test` PASS: 36 files / 119 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: pointer-lock APIs remain browser-permission dependent; this keeps resume best-effort and still does not claim a full normal human no-jump victory run.

## Iteration 62 - Grouped door-open audio
- Problem: multi-door rooms could play one door sound per opened panel in the same frame, stacking identical audio on top of the new aggregated door-open toast.
- Change: moved door-open audio to the same grouped feedback branch as the toast and added `shouldPlayDoorOpenAudio` to keep the policy testable.
- Evidence:
  - TDD red: `npm test -- src/game/doorStatus.test.ts` failed because `shouldPlayDoorOpenAudio` did not exist before implementation.
  - Focused green: `npm test -- src/game/doorStatus.test.ts` PASS: 4 tests.
  - Full regression: `npm test` PASS: 36 files / 120 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: audio is policy/unit-covered and smoke-tested, but this still does not claim a full normal human no-jump victory run.

## Iteration 63 - Final boss overcharge support
- Problem: the final boss arena had repairs, rapid fire, and shield support, but no high-impact overcharge pickup to make the finale feel more explosive and forgiving after a long run.
- Change: added an overcharge pickup to room 12 near the starting half of the arena and locked it with pacing, geometry, and reachability checks.
- Evidence:
  - TDD red: `npm test -- src/game/levelPacing.test.ts` failed because the boss arena did not contain an `overcharge` pickup.
  - Focused green: `npm test -- src/game/levelPacing.test.ts src/game/campaignPlaythrough.test.ts src/game/levelValidation.test.ts` PASS: 3 files / 10 tests.
  - Full regression: `npm test` PASS: 36 files / 121 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: final support placement is test/reachability guarded, but this still does not claim a full normal human no-jump victory run.

## Iteration 64 - Boss overcharge balance fix
- Problem: architect review blocked the first boss-overcharge placement because `(0, 15)` was only 5 units from spawn and could become an immediate boss opener when combined with carried overcharge shots.
- Change: added `validateBossOverchargeSupport`, required exactly one boss overcharge away from both spawn and boss core, and moved the room 12 pickup to a side-risk position at `(-14, 1)`.
- Evidence:
  - Architect rejection: commit `dfe35ab` was blocked for immediate-spawn overcharge placement and weak existence-only pacing tests.
  - TDD red: `npm test -- src/game/levelPacing.test.ts` first failed because `validateBossOverchargeSupport` did not exist, then failed with `Level 12 boss overcharge is too close to spawn.`
  - Focused green: `npm test -- src/game/levelPacing.test.ts src/game/campaignPlaythrough.test.ts src/game/levelValidation.test.ts` PASS: 3 files / 10 tests.
  - Full regression: `npm test` PASS: 36 files / 121 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: boss support placement is now stricter-test guarded, but this still does not claim a full normal human no-jump victory run.

## Iteration 65 - Fold boss overcharge policy into late-room guard
- Problem: the boss-overcharge placement policy was only covered by a dedicated test, while the main `validateLateRoomSupport` guard could still miss future boss arenas without the required comeback pickup.
- Change: made `validateLateRoomSupport` include `validateBossOverchargeSupport` and added a regression that removes the boss overcharge from room 12 to prove the guard reports the issue.
- Evidence:
  - TDD red: `npm test -- src/game/levelPacing.test.ts` failed because `validateLateRoomSupport` returned `[]` when the boss overcharge was removed.
  - Focused green: `npm test -- src/game/levelPacing.test.ts` PASS: 4 tests.
  - Full regression: `npm test` PASS: 36 files / 122 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: late-room support guard is stronger, but this still does not claim a full normal human no-jump victory run.

## Iteration 66 - Health chip critical/shield glow
- Problem: low health and active shield were visible through the edge vignette, but the HUD health chip itself stayed visually flat, making the most important survival state less glanceable.
- Change: added `describeHealthHud`, wired `Game.updateHud()` to apply critical/shielded classes to the health chip, and added CSS glow states for shield and critical health.
- Evidence:
  - TDD red: `npm test -- src/game/playerFeedback.test.ts` failed because `describeHealthHud` did not exist before implementation.
  - Focused green: `npm test -- src/game/playerFeedback.test.ts` PASS: 5 tests.
  - Full regression: `npm test` PASS: 36 files / 123 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: HUD health states are unit-covered and smoke-tested, but this still does not claim a full normal human no-jump victory run.

## Iteration 67 - Layer critical and shield health glow
- Problem: architect review approved the health-chip states but noted that critical health visually won over shield, hiding the shield state on the chip when both were active.
- Change: added a combined `.health-chip.is-critical.is-shielded` layered glow and changed the CSS token test to read the actual stylesheet file so selector regressions are no longer masked by an empty raw CSS import.
- Evidence:
  - TDD red: `npm test -- src/game/styleTokens.test.ts` failed because the combined critical+shield selector did not exist.
  - Focused green: `npm test -- src/game/styleTokens.test.ts` PASS: 2 tests.
  - Build fix: `npm run build` initially failed when the CSS test used Node imports without local declarations; `src/vite-env.d.ts` now declares the minimal `node:fs`/`node:url` APIs used by tests.
  - Full regression: `npm test` PASS: 36 files / 124 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: layered HUD glow is stylesheet-tested and smoke-tested, but this still does not claim a full normal human no-jump victory run.

## Iteration 68 - Power chip active-state glow
- Problem: active upgrades were listed as text, but the power HUD chip stayed visually flat, so rapid fire, shield, and overcharge were not as glanceable as the new health states.
- Change: added `describePowerHud`, wired `Game.updateHud()` to apply active upgrade classes to the power chip, and added rapid/shield/overcharge glow styles.
- Evidence:
  - TDD red: `npm test -- src/game/powerStatus.test.ts` failed because `describePowerHud` did not exist before implementation.
  - Focused green: `npm test -- src/game/powerStatus.test.ts` PASS: 3 tests.
  - Full regression: `npm test` PASS: 36 files / 125 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: power chip states are unit-covered and smoke-tested, but this still does not claim a full normal human no-jump victory run.

## Iteration 69 - Layer simultaneous power glows
- Problem: architect review caught that rapid, shield, and overcharge power-chip rules had equal specificity, so the last overcharge rule hid the yellow/cyan glows when all states were active.
- Change: added stylesheet coverage for the combined power-chip selector and a layered shadow that keeps rapid, shield, and overcharge visible together.
- Evidence:
  - TDD red: `npm test -- src/game/styleTokens.test.ts` failed because `.power-chip.is-rapid.is-shielded.is-overcharged` did not exist.
  - Focused green: `npm test -- src/game/styleTokens.test.ts` PASS: 3 tests.
  - Full regression: `npm test` PASS: 36 files / 126 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: combined HUD glow is stylesheet-tested and smoke-tested, but this still does not claim a full normal human no-jump victory run.

## Iteration 70 - Pairwise power glow coverage
- Problem: architect review caught that the all-three power glow selector still left pairwise power combinations to collapse into the later single-state CSS rule.
- Change: added pairwise rapid+shield, rapid+overcharge, and shield+overcharge layered selectors, then expanded the stylesheet test to require every emitted multi-state combination to preserve its colors.
- Evidence:
  - TDD red: `npm test -- src/game/styleTokens.test.ts` failed on `.power-chip.is-rapid.is-overcharged` before pairwise selectors existed.
  - Focused green: `npm test -- src/game/styleTokens.test.ts` PASS: 3 tests.
  - Full regression: `npm test` PASS: 36 files / 126 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: pairwise CSS composition is stylesheet-tested and smoke-tested, but this still does not claim a full normal human no-jump victory run.

## Iteration 71 - Exact selector CSS test hardening
- Problem: architect review confirmed runtime power-glow CSS was fixed, but the regression test used prefix matching, so one pairwise selector could be deleted while the all-three selector still made the test pass.
- Change: replaced prefix slicing with exact selector block extraction in the stylesheet test.
- Evidence:
  - TDD red: first exact-selector edit failed on an invalid escape expression, proving the test file was executed rather than silently skipped.
  - Focused green: `npm test -- src/game/styleTokens.test.ts` PASS: 3 tests.
  - Full regression: `npm test` PASS: 36 files / 126 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: test hardening is focused/full/smoke verified, but this still does not claim a full normal human no-jump victory run.

## Iteration 72 - First-person hit-confirm crosshair
- Problem: first-person firing had recoil/flash, but successful shots only produced world sparks and toast text, so precision hits were not instantly readable at the reticle.
- Change: added a short hit-confirm state to weapon feedback, set it on target/enemy hits, and styled the crosshair with a green/gold confirmation glow while respecting reduced-motion scale rules.
- Evidence:
  - TDD red: `npm test -- src/game/weaponFeedback.test.ts` failed because `getCrosshairClasses()` did not emit `is-hit-confirmed` for a positive hit timer.
  - Focused green: `npm test -- src/game/weaponFeedback.test.ts` PASS: 4 tests.
  - Full regression: `npm test` PASS: 36 files / 127 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: hit-confirm reticle is unit/build/smoke covered, but the exact reticle feel still needs a human first-person shooting pass.

## Iteration 73 - Weapon-state projectile visuals
- Problem: first-person HUD/crosshair states showed rapid and overcharge, but actual player projectiles stayed the same cyan size, so power shots were less expressive in third-person and world view.
- Change: added a tested projectile theme helper and wired player bullets to use yellow rapid shots and larger hot-orange overcharge shots without changing damage, cooldown, or range.
- Evidence:
  - TDD red: `npm test -- src/game/weaponFeedback.test.ts` failed because `getPlayerProjectileTheme()` did not exist.
  - Focused green: `npm test -- src/game/weaponFeedback.test.ts` PASS: 6 tests.
  - Full regression: `npm test` PASS: 36 files / 129 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: projectile colors/size are unit/build/smoke covered, but exact feel still needs a human combat pass.

## Iteration 74 - Pickup burst polish
- Problem: power-up pickups had distinct colors, but every pickup emitted the same single spark/ring pattern, so shield and overcharge did not feel as special as their HUD/aura states.
- Change: added a tested pickup-burst presenter and wired pickups to emit calmer repair bursts, stronger rapid/shield bursts, and a three-ring overcharge burst while reduced-motion keeps only one calmer ring.
- Evidence:
  - TDD red: `npm test -- src/game/transientEffects.test.ts` failed because `transientEffects.ts` did not exist.
  - Focused green: `npm test -- src/game/transientEffects.test.ts` PASS: 2 tests.
  - Full regression: `npm test` PASS: 37 files / 131 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: pickup burst math is unit/build/smoke covered, but exact pickup feel still needs a human visual pass.

## Iteration 75 - Enemy hit flash polish
- Problem: successful shots produced sparks and reticle confirmation, but enemy bodies themselves did not briefly react, making some distant hits feel less physical.
- Change: added a tested enemy-hit feedback presenter and wired enemy hit timers to pulse enemy emissive intensity and body scale briefly, with a calmer reduced-motion scale boost.
- Evidence:
  - TDD red: `npm test -- src/game/enemyFeedback.test.ts` failed because `enemyFeedback.ts` did not exist.
  - Focused green: `npm test -- src/game/enemyFeedback.test.ts` PASS: 3 tests.
  - Full regression: `npm test` PASS: 38 files / 134 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: enemy hit flash math is unit/build/smoke covered, but exact flash feel still needs a human combat pass.

## Iteration 76 - Feedback helper contract hardening
- Problem: recent projectile and enemy-hit feedback helpers were behaviorally covered, but tests mostly used relative assertions, which could allow accidental color/intensity drift.
- Change: tightened projectile theme tests to exact base/rapid/overcharge values and added enemy-hit exact/clamp coverage for negative and over-window timers.
- Evidence:
  - Focused verification: `npm test -- src/game/enemyFeedback.test.ts src/game/weaponFeedback.test.ts` PASS: 2 files / 10 tests.
  - Full regression: `npm test` PASS: 38 files / 135 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: this is test hardening only; no new human gameplay evidence added.

## Iteration 77 - Projectile precedence test hardening
- Problem: architect review approved the feedback helper tests but noted rapid+overcharge precedence only asserted color, leaving radius/emissive precedence less explicit.
- Change: changed the rapid+overcharge projectile test to assert the full overcharge theme object.
- Evidence:
  - Focused verification: `npm test -- src/game/weaponFeedback.test.ts` PASS: 6 tests.
  - Full regression: `npm test` PASS: 38 files / 135 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: this is test hardening only; no new human gameplay evidence added.

## Iteration 78 - Room 10 shield support
- Problem: room 10 is one of the user-highlighted balance risks; it had two repair pickups and rapid fire, but no shield support despite five buttons, two doors, lasers, and enemies.
- Change: added a late-room pacing guard requiring shield support in room 10 and placed a reachable shield pickup before the doors near the lower reactor lane.
- Evidence:
  - TDD red: `npm test -- src/game/levelPacing.test.ts` first failed because the missing-shield mutant was not reported, then failed the campaign guard until a real room 10 shield was added.
  - Focused green: `npm test -- src/game/levelPacing.test.ts src/game/campaignPlaythrough.test.ts` PASS: 2 files / 6 tests.
  - Full regression: `npm test` PASS: 38 files / 136 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: room 10 support is route/balance guarded, but this still does not claim a full normal human no-jump victory run.

## Iteration 79 - Pause difficulty setting scaffold
- Problem: pause/settings covered sound, camera, sensitivity, and effects, but there was no visible difficulty preference for future balance tuning, despite the project now having several balance-sensitive rooms.
- Change: added a persisted `difficulty` setting with Ukrainian labels and a pause-menu cycle button. This is intentionally UI/state scaffolding only; gameplay damage/speed numbers are unchanged until a separately tested balance pass.
- Evidence:
  - TDD red: `npm test -- src/game/storage.test.ts` failed until `difficulty` was added to saved settings and sanitization.
  - TDD red: `npm test -- src/game/difficulty.test.ts` failed until the difficulty label/cycle helper existed.
  - Focused green: `npm test -- src/game/storage.test.ts src/game/difficulty.test.ts` PASS: 2 files / 8 tests.
  - Full regression: `npm test` PASS: 39 files / 138 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: difficulty currently persists as a setting scaffold only; no damage/speed rebalance is claimed.

## Iteration 80 - Difficulty affects incoming damage
- Problem: the pause difficulty setting existed as a visible preference, but it did not yet make the balance more forgiving or more challenging for players who need it.
- Change: wired difficulty into incoming player damage only. Normal remains the original balance (`1.0x`), easy reduces incoming damage to `0.8x`, and hard increases it to `1.2x`; shield math still applies predictably before the difficulty multiplier.
- Evidence:
  - TDD red: `npm test -- src/game/combat.test.ts` failed on easy/hard damage expectations before the multiplier existed.
  - Focused green: `npm test -- src/game/difficulty.test.ts src/game/combat.test.ts` PASS: 2 files / 6 tests.
  - Full regression: `npm test` PASS: 39 files / 140 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Browser pause/settings smoke: `node .omx/tmp/robolab-pause-settings-qa.mjs` PASS with visible difficulty cycle `Нормально` -> `Важко` and persisted `hard`.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: this changes damage only, not enemy speed/health; a later balance pass should decide whether difficulty should also affect enemy pacing.

## Iteration 81 - Boss phase burst polish
- Problem: boss phase changes changed color/speed and toast text, but the arena did not get a strong spatial burst when the boss entered later phases.
- Change: added a tested boss phase transition burst descriptor and wired phase changes to spawn color-matched pulse rings plus a spark at the boss core. Reduced-motion mode keeps the cue to one calmer ring.
- Evidence:
  - TDD red: `npm test -- src/game/bossPhaseVisual.test.ts` failed until `describeBossPhaseTransitionBurst` existed.
  - Focused green: `npm test -- src/game/bossPhaseVisual.test.ts` PASS: 1 file / 4 tests.
  - Full regression: `npm test` PASS: 39 files / 141 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: phase burst is covered by helper tests and browser smoke, but not by a pixel-perfect visual assertion.

## Iteration 82 - Show difficulty in the HUD
- Problem: difficulty affected incoming damage after the balance pass, but the active choice was visible only in the pause overlay, making easy/hard easy to forget during play.
- Change: the health chip keeps normal mode uncluttered and appends `Легко` or `Важко` only when the player has selected a non-normal difficulty.
- Evidence:
  - TDD red: `npm test -- src/game/playerFeedback.test.ts` failed until health HUD copy accepted difficulty labels.
  - Focused green: `npm test -- src/game/playerFeedback.test.ts` PASS: 1 file / 6 tests.
  - Full regression: `npm test` PASS: 39 files / 142 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Browser pause/settings smoke: `node .omx/tmp/robolab-pause-settings-qa.mjs` PASS with difficulty persistence.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: label visibility is unit-covered; the browser smoke still exercises pause difficulty persistence rather than a dedicated HUD assertion.

## Iteration 83 - Lock full boss burst constants
- Problem: boss phase burst tests covered ring count and ring scale, but the emitted spark still used an implicit `maxScale * 0.55` calculation in `Game`, leaving part of the visual cue unowned by the helper contract.
- Change: moved `sparkScale` into `describeBossPhaseTransitionBurst`, added reduced-motion phase-2 coverage, and wired `Game` to use the helper-provided spark scale.
- Evidence:
  - TDD red: `npm test -- src/game/bossPhaseVisual.test.ts` failed until `sparkScale` existed in the burst descriptor.
  - Focused green: `npm test -- src/game/bossPhaseVisual.test.ts` PASS: 1 file / 4 tests.
  - Full regression: `npm test` PASS: 39 files / 142 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: constants are unit-covered; final appearance is still validated by smoke rather than pixel matching.

## Iteration 84 - Semantic shield guard for laser-button pressure
- Problem: the late-room support validator required shield support specifically in room 10, which protected the current map but would miss the same risk if another late multi-button laser room moved or changed IDs.
- Change: replaced the room-id check with a semantic late-pressure guard: room id >= 6, button objective, at least five buttons, and at least two lasers requires a shield pickup.
- Evidence:
  - TDD red: `npm test -- src/game/levelPacing.test.ts` failed for a synthetic late laser/button room without shield support.
  - Focused green: `npm test -- src/game/levelPacing.test.ts` PASS: 1 file / 6 tests.
  - Full regression: `npm test` PASS: 39 files / 143 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: this is still static validation; it does not prove human route comfort by itself.

## Iteration 85 - Difficulty change feedback toast
- Problem: changing difficulty in pause immediately affected combat math and HUD state, but the click itself had no explicit confirmation beyond the button label changing.
- Change: added a tested Ukrainian difficulty-change message and shows it as a short toast whenever the pause difficulty action cycles modes.
- Evidence:
  - TDD red: `npm test -- src/game/difficulty.test.ts` failed until `describeDifficultyChange` existed.
  - Focused green: `npm test -- src/game/difficulty.test.ts` PASS: 1 file / 3 tests.
  - Full regression: `npm test` PASS: 39 files / 144 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Browser pause/settings smoke: `node .omx/tmp/robolab-pause-settings-qa.mjs` PASS with difficulty persistence and health HUD suffix.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: toast copy is unit-covered; browser smoke currently verifies difficulty button/HUD persistence, not the toast text.

## Iteration 86 - Inline pause difficulty confirmation
- Problem: architect review found the difficulty confirmation toast was inside the hidden HUD while paused, so the confirmation could appear late after resume instead of confirming the pause click.
- Change: moved the difficulty confirmation to an inline `pause-status` row inside the pause panel and updated the browser pause smoke to assert the visible message before resume.
- Evidence:
  - Browser red: `node .omx/tmp/robolab-pause-settings-qa.mjs` failed with empty `difficultyStatus` before the inline pause status existed.
  - Browser green: `node .omx/tmp/robolab-pause-settings-qa.mjs` PASS with `difficultyStatus: "Складність: Важко. Урон ворогів вищий."` and `healthChipAfterResume: "Енергія 100 · Важко"`.
  - Focused regression: `npm test -- src/game/difficulty.test.ts` PASS: 1 file / 3 tests.
  - Full regression: `npm test` PASS: 39 files / 144 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: the Browser QA script is an ignored OMX artifact, so the committed coverage is still unit/build plus logged browser evidence rather than a tracked test file.

## Iteration 87 - Semantic repair guard for laser-button pressure
- Problem: the late-room repair validator still used room ids 6/10, so a future late laser-button pressure room could miss required repair support after a map reshuffle.
- Change: replaced the id-only repair rule with the same semantic late laser-button pressure shape used by the shield guard: late room, button objective, and at least two lasers.
- Evidence:
  - TDD red: `npm test -- src/game/levelPacing.test.ts` failed for a synthetic late laser-button room without repair support.
  - Focused green: `npm test -- src/game/levelPacing.test.ts` PASS: 1 file / 7 tests.
  - Full regression: `npm test` PASS: 39 files / 145 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: static pacing guards still do not replace a true manual human no-jump 1-12 playthrough.

## Iteration 88 - Type-safe synthetic pacing fixtures
- Problem: synthetic late-room pressure fixtures caught pacing regressions, but they were plain object literals inside function calls, so future `LevelConfig` schema drift would be less obvious.
- Change: converted the synthetic shield/repair pressure fixtures to named `satisfies LevelConfig` objects and added matching door data, making the tests closer to real button-room structure.
- Evidence:
  - Focused regression: `npm test -- src/game/levelPacing.test.ts` PASS: 1 file / 7 tests.
  - `npm run build` PASS with TypeScript checking the new `satisfies LevelConfig` fixtures.
- Remaining risk: this is a test-hardening pass only; it does not change runtime route balance.

## Iteration 89 - Validator catches broken button doors
- Problem: real levels had a test that button door ids were resolvable, but `validateLevel()` itself did not report missing door references, so generated/edited levels could produce unclear doors without a validator failure string.
- Change: `validateLevel()` now checks every `opensDoorId` and `opensDoorIds` entry against the level's door ids and reports a precise missing-door failure.
- Evidence:
  - TDD red: `npm test -- src/game/levelValidation.test.ts` failed until `validateLevel()` reported a synthetic missing door id.
  - Focused green: `npm test -- src/game/levelValidation.test.ts` PASS: 1 file / 7 tests.
  - Full regression: `npm test` PASS: 39 files / 146 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: this validates data references only; it does not verify visual door readability in-browser.

## Iteration 90 - Celebratory victory panel
- Problem: final victory used the same generic overlay panel as menus and room transitions, so the win moment lacked a distinct visual finish.
- Change: added a small overlay presentation helper and a `victory-panel` CSS variant with gold/cyan celebratory glow for the final victory overlay only.
- Evidence:
  - TDD red: `npm test -- src/game/overlayPresentation.test.ts src/game/styleTokens.test.ts` failed until the helper and `.victory-panel` styling existed.
  - Focused green: `npm test -- src/game/overlayPresentation.test.ts src/game/styleTokens.test.ts` PASS: 2 files / 5 tests.
  - Full regression: `npm test` PASS: 40 files / 148 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: victory styling is CSS-token covered, not pixel-matched in a browser screenshot.

## Iteration 91 - Deduplicate missing door reference failures
- Problem: `validateLevel()` checked both `opensDoorId` and `opensDoorIds`, but a missing id duplicated in both fields would emit duplicate failure strings, and only the base `opensDoorId` path had a regression test.
- Change: deduplicated button door references before validation and added a regression where `opensDoorIds` repeats a missing id.
- Evidence:
  - TDD red: `npm test -- src/game/levelValidation.test.ts` failed with duplicate missing-door failures before dedupe.
  - Focused green: `npm test -- src/game/levelValidation.test.ts` PASS: 1 file / 8 tests.
  - Full regression: `npm test` PASS: 40 files / 149 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: stricter semantics still intentionally require every referenced id in both fields to exist.

## Iteration 92 - Independent opensDoorIds coverage
- Problem: architect review found the dedupe regression used the same missing id in `opensDoorId` and `opensDoorIds`, so a validator that ignored `opensDoorIds` would still pass.
- Change: added an independent regression where the primary door id is valid but `opensDoorIds` includes `missing-extra-door`.
- Evidence:
  - Focused green: `npm test -- src/game/levelValidation.test.ts` PASS: 1 file / 9 tests.
  - Full regression: `npm test` PASS: 40 files / 150 tests.
  - `npm run build` PASS with app/three chunks and no large-chunk warning.
  - Fresh 12-room browser smoke `output/playwright/overnight-12-room-dom-smoke-2026-04-26/report.json`: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: validation remains intentionally stricter than permissive override semantics; every referenced door id must exist.

## Iteration 93 - Explicit valid-door fixture assumption
- Problem: the independent `opensDoorIds` regression relied on the selected button-room fixture having a non-empty valid door id, but the test did not state that assumption directly.
- Change: added `expect(validDoorId).not.toBe('')` before the missing-extra-door assertion.
- Evidence:
  - Focused regression: `npm test -- src/game/levelValidation.test.ts` PASS: 1 file / 9 tests.
  - `npm run build` PASS with TypeScript build and Vite bundle.
  - `git diff --check` PASS.
- Remaining risk: test-only clarity pass; no runtime changes.

## Iteration 94 - Explicit victory overlay intent
- Problem: victory overlay styling/state still depended on the Ukrainian title text containing `Перемога`, so future copy/localization edits could accidentally remove the victory panel or finished-state transition.
- Change: replaced title-string routing with an explicit `OverlayIntent` (`standard` / `victory`) and routed the final win overlay through that intent while preserving normal overlay behavior.
- Evidence:
  - TDD red: `npm test -- src/game/overlayPresentation.test.ts` failed until `getOverlayPanelClass('victory')` and `getOverlayState('victory', ...)` were implemented.
  - Focused green: `npm test -- src/game/overlayPresentation.test.ts` PASS: 1 file / 2 tests.
  - Full regression: `npm test` PASS: 40 files / 151 tests.
  - `npm run build` PASS with TypeScript/Vite production bundle.
  - Victory overlay browser smoke `node .omx/tmp/robolab-victory-panel-qa.mjs` PASS: `victory-panel-pass`, title `Перемога!`, class `panel victory-panel`, button `Грати ще раз`.
  - Fresh 12-room browser smoke `node .omx/tmp/robolab-12-room-dom-smoke.mjs` PASS: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: victory browser smoke still injects the overlay DOM and is not a true gameplay victory trigger; full no-dev-key 1-12 manual playthrough remains pending.

## Iteration 95 - True game-flow victory smoke shortcut
- Problem: the victory browser QA checked the final panel with injected DOM, so it did not exercise the game's own `completeLevel()` victory path.
- Change: added a DEV-only `KeyN` room-completion shortcut and switched the victory smoke to start the game, jump to the boss room, complete it through game code, and verify the real victory overlay.
- Evidence:
  - TDD red: `npm test -- src/game/devControls.test.ts` failed because `getDevCompletionTarget('KeyN')` did not exist.
  - Focused green: `npm test -- src/game/devControls.test.ts` PASS: 1 file / 4 tests.
  - Full regression: `npm test` PASS: 40 files / 152 tests.
  - `npm run build` PASS with TypeScript/Vite production bundle.
  - True game-flow victory browser smoke `node .omx/tmp/robolab-victory-panel-qa.mjs` PASS: `victory-panel-gameflow-pass`, title `Перемога!`, class `panel victory-panel`, button `Грати ще раз`.
  - Fresh 12-room browser smoke `node .omx/tmp/robolab-12-room-dom-smoke.mjs` PASS: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: the smoke still uses DEV shortcuts (`KeyB` and `KeyN`) and is not a human no-shortcut 1-12 victory run, but it now exercises the production victory overlay path instead of DOM injection.

## Iteration 96 - Expiring power warning glow
- Problem: timed powers had strong active-state glow, but the last seconds did not visually warn the player that rapid/shield effects were about to drop.
- Change: `describePowerHud()` now adds `is-expiring` when rapid or shield timers are in their final two seconds, and CSS gives that state an orange warning pulse while respecting reduced-motion mode.
- Evidence:
  - TDD red: `npm test -- src/game/powerStatus.test.ts src/game/styleTokens.test.ts` failed until `is-expiring` and `.power-chip.is-expiring` styling existed.
  - Focused green: `npm test -- src/game/powerStatus.test.ts src/game/styleTokens.test.ts` PASS: 2 files / 9 tests.
  - Full regression: `npm test` PASS: 40 files / 154 tests.
  - `npm run build` PASS with TypeScript/Vite production bundle.
  - Pause/settings browser smoke `node .omx/tmp/robolab-pause-settings-qa.mjs` PASS: `pause-settings-pass` with difficulty status visible and saved.
  - True game-flow victory browser smoke `node .omx/tmp/robolab-victory-panel-qa.mjs` PASS: `victory-panel-gameflow-pass`.
  - Fresh 12-room browser smoke `node .omx/tmp/robolab-12-room-dom-smoke.mjs` PASS: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: no pixel-matched screenshot assertion for the pulse; coverage is unit/style-token plus smoke tests.

## Iteration 97 - Expiring power architect fixes
- Problem: architect review blocked the expiring power warning because reduced-motion mode shortened the infinite pulse instead of disabling it, and layered rapid/shield/overcharge combinations could override the orange warning glow.
- Change: disabled expiring animation explicitly in reduced-motion mode, added expiring+layered power-chip selectors that preserve existing color layers plus orange warning glow, and strengthened CSS token parsing/tests for exact selector matches.
- Evidence:
  - TDD red: `npm test -- src/game/styleTokens.test.ts` failed until reduced-motion and layered-expiring selectors existed.
  - Focused green: `npm test -- src/game/styleTokens.test.ts` PASS: 1 file / 7 tests.
  - Focused regression: `npm test -- src/game/powerStatus.test.ts src/game/styleTokens.test.ts` PASS: 2 files / 11 tests.
  - `git diff --check` PASS.
- Remaining risk: browser smoke/pixel evidence will run in the next combined verification pass after the door-label WIP is finished.

## Iteration 98 - In-arena door state labels
- Problem: pressure doors were visually bright/opening, but the arena geometry did not label whether a door was currently closed or open, which could make button-room routes less obvious.
- Change: added `describeDoorLabel()` and attached floating labels to doors; labels update from `Двері закриті` to `Двері відкриті` when button logic opens the route.
- Evidence:
  - TDD red: `npm test -- src/game/doorStatus.test.ts` failed until `describeDoorLabel()` existed.
  - Focused green: `npm test -- src/game/doorStatus.test.ts` PASS: 1 file / 5 tests.
  - Full regression: `npm test` PASS: 40 files / 157 tests.
  - `npm run build` PASS with TypeScript/Vite production bundle.
  - Fresh 12-room browser smoke `node .omx/tmp/robolab-12-room-dom-smoke.mjs` PASS: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - True game-flow victory browser smoke `node .omx/tmp/robolab-victory-panel-qa.mjs` PASS: `victory-panel-gameflow-pass`.
  - Pause/settings browser smoke `node .omx/tmp/robolab-pause-settings-qa.mjs` PASS: `pause-settings-pass`.
  - `git diff --check` PASS.
- Remaining risk: smoke validates that rooms still mount without page errors; it does not assert the 3D door label text via rendered pixels.

## Iteration 99 - Full layered expiring HUD coverage
- Problem: architect review accepted the reduced-motion/layered CSS implementation but blocked sign-off because tests covered only one expiring layered combination.
- Change: expanded the style-token test into a table covering all expiring layered power-chip combinations: rapid+shield, rapid+overcharge, shield+overcharge, and rapid+shield+overcharge, each with semantic colors plus orange warning glow.
- Evidence:
  - Focused regression: `npm test -- src/game/powerStatus.test.ts src/game/styleTokens.test.ts` PASS: 2 files / 11 tests.
  - `git diff --check` PASS.
- Remaining risk: this is test-coverage hardening for the already-reviewed CSS implementation; pixel-matched browser comparison remains out of scope.

## Iteration 100 - Difficulty changes enemy pacing too
- Problem: difficulty already changed incoming damage, but enemy movement/fire cadence stayed identical, so the setting was less meaningful for balance feel.
- Change: added `getEnemyPacingMultiplier()` (`easy` 0.9, `normal` 1, `hard` 1.1), applied it to enemy shoot timers and melee/chaser movement, and updated pause copy to explain that easy is calmer while hard is faster.
- Evidence:
  - TDD red: `npm test -- src/game/difficulty.test.ts` failed until the pacing helper and updated copy existed.
  - Focused green: `npm test -- src/game/difficulty.test.ts` PASS: 1 file / 4 tests.
  - Full regression: `npm test` PASS: 40 files / 158 tests.
  - `npm run build` PASS with TypeScript/Vite production bundle.
  - Pause/settings browser smoke `node .omx/tmp/robolab-pause-settings-qa.mjs` PASS: `pause-settings-pass`, status `Складність: Важко. Урон ворогів вищий, темп швидший.`
  - Fresh 12-room browser smoke `node .omx/tmp/robolab-12-room-dom-smoke.mjs` PASS: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - True game-flow victory browser smoke `node .omx/tmp/robolab-victory-panel-qa.mjs` PASS: `victory-panel-gameflow-pass`.
  - `git diff --check` PASS.
- Remaining risk: automated checks verify state/copy/build; subjective pacing still needs human combat feel review.

## Iteration 101 - Complete controls hint for sound toggle
- Problem: gameplay supports `M` for sound toggle, but the HUD controls hint did not mention it, so players could miss an active shortcut.
- Change: added `M — звук` to the controls hint and locked it with the existing shortcut-copy test.
- Evidence:
  - TDD red: `npm test -- src/game/controlsHint.test.ts` failed until the hint included `M — звук`.
  - Focused green: `npm test -- src/game/controlsHint.test.ts` PASS: 1 file / 1 test.
  - Full regression: `npm test` PASS: 40 files / 158 tests.
  - `npm run build` PASS with TypeScript/Vite production bundle.
  - Fresh 12-room browser smoke `node .omx/tmp/robolab-12-room-dom-smoke.mjs` PASS: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: copy is longer; narrow/mobile wrapping should be visually reviewed if the HUD feels crowded.

## Iteration 102 - Resolve sound hint DEV shortcut collision
- Problem: architect review found the new `M — звук` hint was truthful in production intent but wrong in DEV play mode because `KeyM` was still a middle-room QA jump and was handled before the sound toggle.
- Change: moved the middle-room DEV jump from `KeyM` to `Digit6`, added tests that `KeyM` is not swallowed by dev level shortcuts, and kept `M — звук` as the player-facing sound toggle.
- Evidence:
  - TDD red: `npm test -- src/game/controlsHint.test.ts src/game/devControls.test.ts` failed while `KeyM` still mapped to a dev room jump and `Digit6` did not.
  - Focused green: `npm test -- src/game/controlsHint.test.ts src/game/devControls.test.ts` PASS: 2 files / 5 tests.
  - Full regression: `npm test` PASS: 40 files / 158 tests.
  - `npm run build` PASS with TypeScript/Vite production bundle.
  - Browser shortcut smoke PASS: pressing `M` saved `soundOn: false` while staying in room 1; pressing `Digit6` then jumped to room 6; no bad console messages or page errors.
  - Fresh 12-room browser smoke `node .omx/tmp/robolab-12-room-dom-smoke.mjs` PASS: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: narrow HUD wrapping of the longer hint remains visual-only; mobile/short-height CSS hides the hint.

## Iteration 103 - Distinct boss phase transition audio
- Problem: boss phase changes used the same low boss rumble as generic boss feedback, so the visual phase burst had no sharper audio punctuation.
- Change: added a dedicated `phase` sound profile with a two-tone warning accent and routed boss phase transitions to it while keeping boss hit/rumble feedback intact.
- Evidence:
  - TDD red: `npm test -- src/game/audioProfiles.test.ts` failed until `getSoundProfile('phase')` existed.
  - Focused green: `npm test -- src/game/audioProfiles.test.ts` PASS: 1 file / 4 tests.
  - Full regression: `npm test` PASS: 40 files / 159 tests.
  - `npm run build` PASS with TypeScript/Vite production bundle.
  - True game-flow victory browser smoke `node .omx/tmp/robolab-victory-panel-qa.mjs` PASS: `victory-panel-gameflow-pass`.
  - Fresh 12-room browser smoke `node .omx/tmp/robolab-12-room-dom-smoke.mjs` PASS: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: audio profile is unit-covered, but subjective sound mix still needs human listening during the boss fight.

## Iteration 104 - Extract tested enemy pacing delta
- Problem: architect review approved difficulty pacing but noted a non-blocking gap: runtime enemy pacing used the multiplier directly, without a small pure helper proving the frame-delta application.
- Change: added `scaleEnemyPacingDelta()` and routed enemy shoot timers and chaser movement through it, preserving the same easy/normal/hard behavior while making the integration math directly testable.
- Evidence:
  - TDD red: `npm test -- src/game/difficulty.test.ts` failed until `scaleEnemyPacingDelta()` existed.
  - Focused green: `npm test -- src/game/difficulty.test.ts` PASS: 1 file / 5 tests.
  - Full regression: `npm test` PASS: 40 files / 160 tests.
  - `npm run build` PASS with TypeScript/Vite production bundle.
  - Fresh 12-room browser smoke `node .omx/tmp/robolab-12-room-dom-smoke.mjs` PASS: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: still not a subjective human difficulty-feel pass; this only hardens the pacing math seam.

## Iteration 105 - Testable boss phase cue routing
- Problem: architect review approved dedicated boss phase audio but noted the route from phase transition to `phase` sound was verified by inspection rather than a small testable seam.
- Change: added `describeBossPhaseTransitionCue()` to own phase-transition sound/toast copy and routed Game through that cue, keeping the approved `phase` sound and existing toast text.
- Evidence:
  - TDD red: `npm test -- src/game/bossPhaseVisual.test.ts` failed until `describeBossPhaseTransitionCue()` existed.
  - Focused green: `npm test -- src/game/bossPhaseVisual.test.ts` PASS: 1 file / 5 tests.
  - Full regression: `npm test` PASS: 40 files / 161 tests.
  - `npm run build` PASS with TypeScript/Vite production bundle.
  - Fresh 12-room browser smoke `node .omx/tmp/robolab-12-room-dom-smoke.mjs` PASS: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: still no human listening pass for the exact phase cue mix.

## Iteration 106 - Laser pre-activation warning ramp
- Problem: inactive laser lanes stayed visible, but the floor warning did not intensify before the damaging beam reactivated, so timing windows could still feel sudden in laser rooms.
- Change: added `calculateLaserWarningCharge()` and extended `describeLaserVisibility()` so inactive lanes ramp opacity/emissive intensity as the laser wave approaches activation; `Game.updateLasers()` now applies that charge to the warning material while preserving the existing damage threshold.
- Evidence:
  - TDD red: `npm test -- src/game/laserVisibility.test.ts` failed until the charge helper and warning emissive state existed.
  - Focused green: `npm test -- src/game/laserVisibility.test.ts src/game/laserHazard.test.ts` PASS: 2 files / 10 tests.
  - Full regression: `npm test` PASS: 40 files / 162 tests.
  - `npm run build` PASS with TypeScript/Vite production bundle.
  - Laser browser smoke `node .omx/tmp/robolab-laser-lane-qa.mjs` PASS: `laser-warning-ramp-playwright-pass`, room 6 loaded, `badConsoleMessages: []`, `pageErrors: []`, screenshot saved to `output/playwright/overnight-laser-warning-ramp-2026-04-26/room-06-laser-lanes.png`.
  - Fresh 12-room browser smoke `node .omx/tmp/robolab-12-room-dom-smoke.mjs` PASS: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - True game-flow victory browser smoke `node .omx/tmp/robolab-victory-panel-qa.mjs` PASS: `victory-panel-gameflow-pass`.
  - Pause/settings browser smoke `node .omx/tmp/robolab-pause-settings-qa.mjs` PASS: `pause-settings-pass`.
  - `git diff --check` PASS.
- Remaining risk: warning ramp is state-tested and browser-smoked, but exact visual timing still needs human eye/hand feel in rooms 6/10/12.

## Iteration 107 - Shared laser activation threshold cleanup
- Cleanup plan: keep behavior unchanged, touch only the duplicated laser activation threshold noted by architect, and rerun laser/full/browser gates to prove no timing drift.
- Change: exported `LASER_ACTIVE_THRESHOLD` from `laserVisibility.ts` and reused it in `Game.updateLasers()` so warning charge and actual beam activation share one source of truth.
- Evidence:
  - Focused regression: `npm test -- src/game/laserVisibility.test.ts src/game/laserHazard.test.ts` PASS: 2 files / 10 tests.
  - Full regression: `npm test` PASS: 40 files / 162 tests.
  - `npm run build` PASS with TypeScript/Vite production bundle.
  - Laser browser smoke `node .omx/tmp/robolab-laser-lane-qa.mjs` PASS: `laser-warning-ramp-playwright-pass`, room 6 loaded, `badConsoleMessages: []`, `pageErrors: []`.
  - Fresh 12-room browser smoke `node .omx/tmp/robolab-12-room-dom-smoke.mjs` PASS: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: behavior-neutral cleanup; it still does not provide a human laser timing feel pass.

## Iteration 108 - Safe boss phase cue contract
- Problem: `describeBossPhaseTransitionCue(1)` returned the final-phase cue, which was harmless in the current runtime path but risky for future callers or phase-reset logic.
- Change: made the cue helper return `undefined` for phase 1 and guarded the phase audio/toast/burst branch in `Game.updateEnemies()` so only real escalation phases emit transition feedback.
- Evidence:
  - TDD red: `npm test -- src/game/bossPhaseVisual.test.ts` failed until phase 1 returned `undefined`.
  - Focused green: `npm test -- src/game/bossPhaseVisual.test.ts src/game/audioProfiles.test.ts` PASS: 2 files / 9 tests.
  - Full regression: `npm test` PASS: 40 files / 162 tests.
  - `npm run build` PASS with TypeScript/Vite production bundle.
  - True game-flow victory browser smoke `node .omx/tmp/robolab-victory-panel-qa.mjs` PASS: `victory-panel-gameflow-pass`.
  - Fresh 12-room browser smoke `node .omx/tmp/robolab-12-room-dom-smoke.mjs` PASS: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: boss phase cue route is safer and smoke-tested, but subjective phase audio/visual timing still needs human boss-fight review.

## Iteration 109 - Full 12-room dev-completion browser evidence
- Purpose: strengthen the overnight evidence beyond room-jump DOM checks and a single boss-room victory shortcut by exercising the game’s own room-complete overlay path for all 12 rooms in sequence.
- Change: no production code change; added an ignored OMX browser QA script that starts a fresh run, uses the DEV `KeyN` completion shortcut in rooms 1-12, clicks each `Наступна кімната` overlay, and verifies the real victory overlay reports `пройдено 12 кімнат`.
- Evidence:
  - Browser red: first script draft failed waiting for `.overlay:not(.is-visible)` because Playwright’s visible selector semantics do not match hidden overlay assertions.
  - Browser green: `node .omx/tmp/robolab-full-campaign-dev-complete-qa.mjs` PASS: `full-campaign-dev-complete-pass`, 12 rooms completed, victory intro `Фінальний час 0:09 · пройдено 12 кімнат · 0 рестартів`, `badConsoleMessages: 0`, `pageErrors: 0`.
  - Screenshot/report: `output/playwright/overnight-full-campaign-dev-complete-2026-04-26/victory-after-12-dev-completions.png` and `report.json`.
- Remaining risk: this is stronger game-flow evidence but still uses DEV completion shortcuts; it is not a human no-shortcut combat/aim/movement playthrough.

## Iteration 110 - Enemy engagement route guard
- Problem: the campaign route guard proved enemy centers were reachable, but a player shoots from nearby standing positions, not from inside the enemy model; blocked engagement space could still make enemy rooms feel unfair.
- Change: changed enemy/boss route validation to require at least one reachable engagement position around every enemy after doors are open, while keeping target, button, support, and exit reachability checks intact.
- Evidence:
  - TDD red: the first stricter draft failed because it incorrectly required all four engagement sides around each enemy to be reachable, surfacing over-strict failures in rooms 5, 8, and 11.
  - Focused green: `npm test -- src/game/campaignPlaythrough.test.ts` PASS: 1 file / 1 test after changing the contract to “at least one reachable engagement point”.
  - Full regression: `npm test` PASS: 40 files / 162 tests.
  - `npm run build` PASS with TypeScript/Vite production bundle.
  - Full campaign DEV-completion browser smoke `node .omx/tmp/robolab-full-campaign-dev-complete-qa.mjs` PASS: `full-campaign-dev-complete-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - Fresh 12-room browser smoke `node .omx/tmp/robolab-12-room-dom-smoke.mjs` PASS: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: engagement reachability is static geometry evidence and still does not prove aim/combat difficulty in a human no-shortcut run.

## Iteration 111 - Enemy line-of-fire route guard
- Problem: the new enemy engagement route guard could still false-positive if a nearby reachable point existed but an obstacle blocked the direct shot line.
- Change: added a sampled line-of-fire check from each candidate engagement point to the enemy center, using the same static solid boxes as the route guard, so every enemy/boss must have at least one reachable and unobstructed firing position after doors are open.
- Evidence:
  - TDD red: `npm test -- src/game/campaignPlaythrough.test.ts` failed first with `hasLineOfFire is not defined` after the guard expression required line-of-fire.
  - Focused green: `npm test -- src/game/campaignPlaythrough.test.ts` PASS: 1 file / 1 test.
  - Full regression: `npm test` PASS: 40 files / 162 tests.
  - `npm run build` PASS with TypeScript/Vite production bundle.
  - Full campaign DEV-completion browser smoke `node .omx/tmp/robolab-full-campaign-dev-complete-qa.mjs` PASS: `full-campaign-dev-complete-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - Fresh 12-room browser smoke `node .omx/tmp/robolab-12-room-dom-smoke.mjs` PASS: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: line-of-fire is a static 2D sampled approximation and does not model moving enemies/projectiles or player aim skill.

## Iteration 112 - Shared box collision helper cleanup
- Cleanup plan: keep this behavior-neutral, first lock the box hit rule in `collision.test`, then export that helper and reuse it in the campaign route guard instead of duplicating rectangle/radius math.
- Change: exported `pointHitsBox()` from `collision.ts` and made `campaignPlaythrough.test.ts` use it for route walkability checks, keeping runtime projectile/door collision and static route validation aligned on the same strict edge semantics.
- Evidence:
  - TDD red: `npm test -- src/game/collision.test.ts` failed until `pointHitsBox()` was exported.
  - Focused green: `npm test -- src/game/collision.test.ts src/game/campaignPlaythrough.test.ts` PASS: 2 files / 6 tests.
  - Full regression: `npm test` PASS: 40 files / 163 tests.
  - `npm run build` PASS with TypeScript/Vite production bundle.
  - Full campaign DEV-completion browser smoke `node .omx/tmp/robolab-full-campaign-dev-complete-qa.mjs` PASS: `full-campaign-dev-complete-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - Fresh 12-room browser smoke `node .omx/tmp/robolab-12-room-dom-smoke.mjs` PASS: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: only the box primitive is shared; broader route sampling remains a static approximation rather than runtime physics.

## Iteration 113 - Shared door collision dimensions cleanup
- Cleanup plan: keep behavior unchanged, lock the runtime door collision dimensions in `collision.test`, then reuse those constants from both `Game.spawnDoor()` and the static campaign route guard.
- Change: exported `DOOR_SOLID_HALF_WIDTH` / `DOOR_SOLID_HALF_DEPTH` from `collision.ts`, removed the route guard’s stale `0.17` door half-depth, and made runtime door solids use the same named constants.
- Evidence:
  - TDD red: `npm test -- src/game/collision.test.ts` failed until the shared door constants existed.
  - Focused green: `npm test -- src/game/collision.test.ts src/game/campaignPlaythrough.test.ts` PASS: 2 files / 7 tests.
  - Full regression: `npm test` PASS: 40 files / 164 tests.
  - `npm run build` PASS with TypeScript/Vite production bundle.
  - Full campaign DEV-completion browser smoke `node .omx/tmp/robolab-full-campaign-dev-complete-qa.mjs` PASS: `full-campaign-dev-complete-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - Fresh 12-room browser smoke `node .omx/tmp/robolab-12-room-dom-smoke.mjs` PASS: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: door dimensions are now shared, but the broader route guard still remains a static approximation of gameplay physics.

## Iteration 114 - Door visual/collision depth contract
- Problem: door collision depth and visual panel depth were intentionally different, but the visual depth was still a raw `0.34` literal in `Game`, so future edits could accidentally make the visible panel thicker than the conservative collision box.
- Change: exported `DOOR_PANEL_DEPTH` next to the door collision constants and made `Game.spawnDoor()` use it for panel geometry, with a test proving the visual half-depth stays within the collision half-depth.
- Evidence:
  - TDD red: `npm test -- src/game/collision.test.ts` failed until `DOOR_PANEL_DEPTH` existed.
  - Focused green: `npm test -- src/game/collision.test.ts src/game/campaignPlaythrough.test.ts` PASS: 2 files / 8 tests.
  - Full regression: `npm test` PASS: 40 files / 165 tests.
  - `npm run build` PASS with TypeScript/Vite production bundle.
  - Full campaign DEV-completion browser smoke `node .omx/tmp/robolab-full-campaign-dev-complete-qa.mjs` PASS: `full-campaign-dev-complete-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - Fresh 12-room browser smoke `node .omx/tmp/robolab-12-room-dom-smoke.mjs` PASS: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: this documents and guards dimensions; it does not change human route feel around door edges.

## Iteration 115 - Duplicate enemy spawn validator
- Problem: overlapped enemies can create strange damage/readability issues, and the level validator did not explicitly report duplicate enemy spawn positions.
- Change: added duplicate enemy-position detection to `validateLevel()` with a focused synthetic regression. Current rooms already pass the stricter guard.
- Evidence:
  - TDD red: `npm test -- src/game/levelValidation.test.ts` failed until duplicate enemy positions were reported by `validateLevel()`.
  - Focused green: `npm test -- src/game/levelValidation.test.ts` PASS: 1 file / 10 tests.
  - Full regression: `npm test` PASS: 40 files / 166 tests.
  - `npm run build` PASS with TypeScript/Vite production bundle.
  - Full campaign DEV-completion browser smoke `node .omx/tmp/robolab-full-campaign-dev-complete-qa.mjs` PASS: `full-campaign-dev-complete-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - Fresh 12-room browser smoke `node .omx/tmp/robolab-12-room-dom-smoke.mjs` PASS: `12-room-dom-smoke-pass`, 12 rooms, `badConsoleMessages: 0`, `pageErrors: 0`.
  - `git diff --check` PASS.
- Remaining risk: exact duplicate positions are guarded; near-overlaps are still covered separately by reward/route geometry checks rather than an enemy-spacing invariant.
