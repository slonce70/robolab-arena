# RoboLab Arena Final Version Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn RoboLab Arena from a strong prototype into a polished browser game with larger gameplay depth, first-person mode, better visuals, reliable mechanics, and complete verification.

**Architecture:** Implement in release slices. First split the oversized `Game.ts` into stable modules, then add camera modes, model/effects polish, level mechanics, UI, audio, persistence, and final QA. Each slice must leave the game playable and browser-verified.

**Tech Stack:** Vite, TypeScript, Three.js, Vitest, Browser Use for visual QA, localStorage for progress.

---

## Release Strategy

This plan is intentionally split into releases because the final version spans multiple independent subsystems. Each release should be committed separately and verified before continuing.

### Release 1: Stabilize Architecture

**Purpose:** Make the codebase easier to safely extend before adding first-person and richer mechanics.

**Files:**
- Modify: `src/game/Game.ts`
- Create: `src/game/state.ts`
- Create: `src/game/render/materials.ts`
- Create: `src/game/render/modelFactories.ts`
- Create: `src/game/entities/Player.ts`
- Create: `src/game/entities/Enemies.ts`
- Create: `src/game/entities/Pickups.ts`
- Create: `src/game/entities/Hazards.ts`
- Create: `src/game/entities/Projectiles.ts`
- Create: `src/game/ui/Hud.ts`
- Create: `src/game/ui/Overlays.ts`
- Test: `src/game/levelValidation.test.ts`

- [ ] Move shared palette and material construction into `src/game/render/materials.ts`.
- [ ] Move procedural robot, enemy, pickup, target, door, and obstacle factories into `src/game/render/modelFactories.ts`.
- [ ] Move HUD DOM writes into `src/game/ui/Hud.ts`.
- [ ] Move overlay rendering into `src/game/ui/Overlays.ts`.
- [ ] Move player movement, dash, animation, and collision entrypoints into `src/game/entities/Player.ts`.
- [ ] Move enemy update logic into `src/game/entities/Enemies.ts`.
- [ ] Move pickup collection behavior into `src/game/entities/Pickups.ts`.
- [ ] Move laser behavior into `src/game/entities/Hazards.ts`.
- [ ] Move bullet spawning and collision into `src/game/entities/Projectiles.ts`.
- [ ] Keep `Game.ts` as orchestrator: setup scene, load level, call subsystem updates, transition states.
- [ ] Add `levelValidation.test.ts` to check every level has valid start, exit, objective, pickup, obstacle bounds, and at least one meaningful route.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Browser Use: reload game and verify first arena appears without console errors.
- [ ] Commit with `refactor: split robolab game systems`.

### Release 2: First-Person and Camera System

**Purpose:** Add camera toggle and first-person blaster view.

**Files:**
- Create: `src/game/camera/CameraController.ts`
- Create: `src/game/camera/camera.test.ts`
- Modify: `src/game/Game.ts`
- Modify: `src/game/ui/Hud.ts`
- Modify: `src/game/render/modelFactories.ts`
- Modify: `src/styles.css`

- [ ] Add camera mode type: `thirdPerson | firstPerson`.
- [ ] Add `CameraController` with `toggleMode()`, `updateThirdPerson()`, `updateFirstPerson()`, and `getAimDirection()`.
- [ ] Add keyboard toggle: `C`.
- [ ] In third-person, keep floor aim marker and follow camera.
- [ ] In first-person, hide floor aim marker and show centered crosshair.
- [ ] Create a first-person blaster model attached to camera or a viewmodel group.
- [ ] Update shooting to use camera aim direction in first-person.
- [ ] Update HUD with camera mode chip: `Вид: 3-я особа` / `Вид: 1-а особа`.
- [ ] Add pause screen copy for `C`.
- [ ] Test camera mode toggle state.
- [ ] Browser Use: screenshot third-person, press `C`, screenshot first-person, press `C`, verify return.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Commit with `feat: add first person camera mode`.

### Release 3: Visual Model and Effects Polish

**Purpose:** Make the game look intentionally designed instead of primitive.

**Files:**
- Modify: `src/game/render/modelFactories.ts`
- Modify: `src/game/render/effects.ts`
- Modify: `src/game/entities/Enemies.ts`
- Modify: `src/game/entities/Player.ts`
- Modify: `src/game/entities/Pickups.ts`
- Modify: `src/game/Game.ts`
- Optional create: `src/game/render/decals.ts`

- [ ] Improve Blitz silhouette: larger face screen, readable eyes, animated antenna, backpack energy pack, blaster glow.
- [ ] Add player shield visual when shield is active.
- [ ] Add dash afterimage or spark trail.
- [ ] Give each enemy a unique accent color and animation:
  - drone rotors;
  - turret warning ring and barrel glow;
  - beetle leg animation;
  - shield bot shield dome;
  - boss pulsing core and phase ring.
- [ ] Make medkits unmistakable with white case, green cross, handle, and floating plus sign.
- [ ] Add projectile trail meshes or fading sparks.
- [ ] Add hit flash materials for targets/enemies.
- [ ] Add laser contact flash on HUD/player.
- [ ] Add objective-complete exit pulse.
- [ ] Browser Use: compare first room before/after screenshots and verify models are readable at current camera distance.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Commit with `feat: polish robolab visuals`.

### Release 4: Level Mechanics and Enemy Variety

**Purpose:** Make progression more interesting than “run and shoot”.

**Files:**
- Modify: `src/game/types.ts`
- Modify: `src/game/levels.ts`
- Modify: `src/game/entities/Enemies.ts`
- Modify: `src/game/entities/Hazards.ts`
- Modify: `src/game/entities/Pickups.ts`
- Modify: `src/game/levelValidation.test.ts`

- [ ] Add `ShieldBot` enemy kind that projects a shield to nearby enemies until disabled.
- [ ] Add `LaserSweeper` hazard that moves along a lane.
- [ ] Add rare `overcharge` pickup for a single stronger shot.
- [ ] Add optional side objective type: bonus gear cluster or hidden target.
- [ ] Add objective progress counters.
- [ ] Rework 12 levels to include:
  - clear main route;
  - optional pickup route;
  - at least two cover decisions;
  - one landmark prop;
  - a combined mechanic in later rooms.
- [ ] Add tests that levels 5-12 contain mixed mechanics.
- [ ] Browser Use: verify first, middle, and boss rooms visually by temporarily jumping levels through a debug-safe dev helper or level select in dev mode.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Commit with `feat: deepen robolab level mechanics`.

### Release 5: Objective System, Level Flow, and UX

**Purpose:** Make every room self-explanatory and rewarding.

**Files:**
- Create: `src/game/objectives.ts`
- Create: `src/game/objectives.test.ts`
- Modify: `src/game/ui/Hud.ts`
- Modify: `src/game/ui/Overlays.ts`
- Modify: `src/game/Game.ts`
- Modify: `src/styles.css`

- [ ] Centralize objective progress in `objectives.ts`.
- [ ] HUD shows progress: targets, enemies, buttons, boss health, or exit status.
- [ ] Add level-complete summary: score, pickups, health remaining.
- [ ] Add room intro toast with one short instruction.
- [ ] Add pause screen options: resume, restart room, toggle sound, camera controls.
- [ ] Add victory screen with final score and replay.
- [ ] Add “level unlocked” flow that reads highest unlocked room from `src/game/storage.ts`.
- [ ] Browser Use: verify start, pause, level complete, and victory overlays.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Commit with `feat: improve robolab objective flow`.

### Release 6: Audio, Settings, and Persistence

**Purpose:** Add game-feel and player continuity.

**Files:**
- Create: `src/game/audio.ts`
- Create: `src/game/storage.ts`
- Create: `src/game/storage.test.ts`
- Modify: `src/game/ui/Overlays.ts`
- Modify: `src/game/ui/Hud.ts`
- Modify: `src/game/Game.ts`

- [ ] Add audio manager that starts only after user presses Play.
- [ ] Add lightweight generated WebAudio sounds: shot, hit, pickup, door, laser, dash, boss, victory.
- [ ] Add mute toggle in pause/start.
- [ ] Store sound preference in localStorage.
- [ ] Store best score, highest unlocked room, preferred camera mode, reduced motion preference.
- [ ] Add storage tests using safe JSON parsing and defaults.
- [ ] Browser Use: play, pause, toggle mute, reload, verify setting persists.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Commit with `feat: add robolab audio and progress`.

### Release 7: Performance and Responsive QA

**Purpose:** Keep the larger game smooth and readable.

**Files:**
- Modify: `src/game/render/modelFactories.ts`
- Modify: `src/game/render/materials.ts`
- Modify: `src/game/Game.ts`
- Modify: `src/styles.css`
- Create: `docs/audit/2026-04-25-robolab-final-qa.md`

- [ ] Reuse geometries and materials where possible.
- [ ] Dispose level-specific meshes and materials correctly when changing levels.
- [ ] Limit live particles/sparks with a cap.
- [ ] Add reduced-motion behavior for nonessential animation.
- [ ] Tune camera distance and FOV for desktop and smaller viewports.
- [ ] Verify mobile HUD does not overlap objective/toast/progress.
- [ ] Browser Use desktop screenshot.
- [ ] Browser Use mobile screenshot.
- [ ] Browser Use first-person screenshot.
- [ ] Browser Use console error check.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Write final QA report.
- [ ] Commit with `chore: complete robolab final qa`.

## Acceptance Checklist

- [ ] `npm test` passes.
- [ ] `npm run build` passes.
- [ ] 12 rooms are playable from start to victory.
- [ ] First-person and third-person toggle with `C`.
- [ ] Shooting works in both camera modes.
- [ ] Medkits are visually clear and never wasted at full health.
- [ ] Lasers damage immediately.
- [ ] Dash cannot tunnel through doors or cover.
- [ ] Enemies do not damage through solid geometry.
- [ ] Boss fight completes when boss is defeated.
- [ ] HUD is readable on desktop and mobile.
- [ ] Browser Use screenshots confirm desktop, mobile, and first-person views.
- [ ] Console has no new errors during browser verification.

## Execution Recommendation

Use subagent-driven development for Releases 1, 3, 4, and 7 because they contain separable audit/review work. Use inline execution for Release 2 because camera mode touches shared runtime behavior and should be integrated carefully.
