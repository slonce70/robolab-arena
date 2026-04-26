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
