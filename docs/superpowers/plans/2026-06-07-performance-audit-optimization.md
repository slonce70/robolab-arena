# RoboLab Performance Audit Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve RoboLab Arena frame stability and memory behavior without changing gameplay rules, level design, controls, Ukrainian UI copy, or deployment shape.

**Architecture:** Keep the game as a Vite + TypeScript + Three.js app, but move reusable performance primitives into small focused modules. Lock behavior with focused Vitest coverage first, then optimize renderer configuration, HUD writes, per-frame math allocations, and Three.js resource lifecycle in separate reviewable commits.

**Tech Stack:** Vite 6, TypeScript 5.8, Three.js 0.176, Vitest 3, Playwright 1.59, GitHub Pages static build.

---

## Audit Findings

**Evidence**
- `src/game/Game.ts:288-301` creates `WebGLRenderer` with `preserveDrawingBuffer: true`, `antialias: true`, pixel ratio capped at `2`, and shadow maps enabled. This is visually rich, but `preserveDrawingBuffer` is usually expensive and unnecessary unless screenshots depend on it.
- `src/game/Game.ts:629-646` clears `levelRoot` and `dynamicRoot` but does not dispose geometries, materials, textures, or sprite canvas textures. Replaying rooms can leave GPU resources alive longer than needed.
- `src/game/Game.ts:1406-1448` runs `updateHud()` every playing frame.
- `src/game/Game.ts:2257-2321` writes many `textContent`, `className`, `classList`, style properties, and rebuilds `hudProgress.innerHTML` from all `LEVELS` every frame.
- `src/game/Game.ts:1450-1579`, `src/game/Game.ts:2010-2058`, `src/game/Game.ts:2122-2254`, and `src/game/camera/CameraController.ts:67-150` allocate `Vector3`, geometries, and materials in hot paths or frequent effects.
- `src/game/Game.ts:1901-1906` filters buttons for each door every frame.
- `src/game/Game.ts:1984-2005` removes expired sparks and pulses without disposing their geometry/material resources.
- `src/styles.css:113-116`, `src/styles.css:160-327`, `src/styles.css:406-560`, and `src/styles.css:472-526` use blur, shadows, filters, and animations on HUD/crosshair surfaces. DOM count is small, so these are secondary behind WebGL and per-frame writes.
- `npm test` passes: 41 test files, 182 tests.
- `npm run build` passes: app JS `94.43 kB` raw / `26.83 kB` gzip, Three.js chunk `486.98 kB` raw / `122.24 kB` gzip, CSS `15.15 kB` raw / `3.82 kB` gzip.
- Playwright headless production probe loaded one canvas and 54 DOM nodes. Headless WebGL FPS was low, but that number is not a reliable real-device FPS because headless Chromium often uses constrained rendering. Keep the probe as relative evidence between commits, not as an absolute player-facing frame-rate claim.

**Ranked risks**

| Rank | Risk | Confidence | Basis |
| --- | --- | --- | --- |
| 1 | Unnecessary per-frame CPU and GC work in `Game.ts` and `CameraController.ts` | High | Direct `new THREE.Vector3()`, `.clone()`, `.filter()`, `.find()`, DOM writes, and `innerHTML` inside frame flow |
| 2 | GPU memory/resource leaks across restarts and level changes | High | `clear()` removes objects but does not dispose; transient effects and bullets remove meshes without dispose |
| 3 | GPU fill/resolve cost from renderer config and HUD effects | Medium | `preserveDrawingBuffer`, DPR cap `2`, soft shadows, blur/filter CSS; exact impact needs browser/device measurement |
| 4 | Bundle size | Low | Three.js is the only large chunk and is expected for a 3D game; app chunk is modest |

## File Structure

- Create `src/game/renderQuality.ts`: pure renderer-quality calculations for pixel ratio and WebGL renderer options.
- Create `src/game/renderQuality.test.ts`: locks pixel-ratio caps and renderer-option defaults.
- Create `src/game/domPerformance.ts`: tiny DOM write helpers that skip unchanged writes.
- Create `src/game/domPerformance.test.ts`: locks helper behavior with a minimal fake element.
- Create `src/game/threeDisposal.ts`: reusable Three.js disposal helpers for groups, meshes, materials, and textures.
- Create `src/game/threeDisposal.test.ts`: verifies geometries/materials/textures are disposed exactly once by observable events.
- Create `scripts/perf/robolab-performance-probe.mjs`: production preview + Playwright relative performance smoke.
- Modify `package.json`: add `perf:probe`.
- Modify `src/game/Game.ts`: use render-quality helper, DOM write helpers, disposal helper, cached door-button map, cached HUD progress HTML, and reusable scratch vectors.
- Modify `src/game/camera/CameraController.ts`: reuse internal vectors instead of cloning in camera hot paths.
- Modify `src/game/camera/CameraController.test.ts`: add regression around movement/aim output after scratch-vector reuse.

## Success Criteria

- `npm test` passes.
- `npm run build` passes.
- `npm run perf:probe` starts a production preview, opens `/robolab-arena/`, starts the game, verifies one canvas, reports frame stats, and exits successfully.
- Gameplay behavior remains unchanged for movement, aiming, combat, objectives, doors, level completion, settings, and Ukrainian HUD copy.
- Repeated level restarts and transient effects dispose Three.js resources when removed.

### Task 1: Add Renderer Quality Policy

**Files:**
- Create: `src/game/renderQuality.ts`
- Create: `src/game/renderQuality.test.ts`
- Modify: `src/game/Game.ts:288-294`

- [ ] **Step 1: Write the failing tests**

Create `src/game/renderQuality.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { calculateRenderPixelRatio, getRendererOptions } from './renderQuality';

describe('render quality policy', () => {
  it('caps normal device pixel ratio at a performance-friendly ceiling', () => {
    expect(calculateRenderPixelRatio(1, false)).toBe(1);
    expect(calculateRenderPixelRatio(1.25, false)).toBe(1.25);
    expect(calculateRenderPixelRatio(2, false)).toBe(1.5);
    expect(calculateRenderPixelRatio(3, false)).toBe(1.5);
  });

  it('uses a lower ceiling when reduced motion is enabled', () => {
    expect(calculateRenderPixelRatio(2, true)).toBe(1.25);
    expect(calculateRenderPixelRatio(0.75, true)).toBe(1);
  });

  it('does not preserve the drawing buffer during normal gameplay', () => {
    expect(getRendererOptions()).toEqual({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/game/renderQuality.test.ts
```

Expected: FAIL with an import error for `./renderQuality`.

- [ ] **Step 3: Implement the render-quality helper**

Create `src/game/renderQuality.ts`:

```ts
import type * as THREE from 'three';

const NORMAL_PIXEL_RATIO_MAX = 1.5;
const REDUCED_MOTION_PIXEL_RATIO_MAX = 1.25;

export function calculateRenderPixelRatio(devicePixelRatio: number, reducedMotion: boolean): number {
  const safeRatio = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
  const capped = Math.min(safeRatio, reducedMotion ? REDUCED_MOTION_PIXEL_RATIO_MAX : NORMAL_PIXEL_RATIO_MAX);
  return Math.max(1, capped);
}

export function getRendererOptions(): THREE.WebGLRendererParameters {
  return {
    antialias: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false
  };
}
```

- [ ] **Step 4: Wire the helper into `Game.ts`**

In `src/game/Game.ts`, add this import near the other local imports:

```ts
import { calculateRenderPixelRatio, getRendererOptions } from './renderQuality';
```

Replace the renderer setup in the constructor:

```ts
this.renderer = new THREE.WebGLRenderer(getRendererOptions());
this.renderer.setPixelRatio(calculateRenderPixelRatio(window.devicePixelRatio, this.settings.reducedMotion));
```

In `handlePauseAction`, inside the `motion` branch after saving settings, add:

```ts
this.renderer.setPixelRatio(calculateRenderPixelRatio(window.devicePixelRatio, this.settings.reducedMotion));
```

- [ ] **Step 5: Run focused and full verification**

Run:

```bash
npm test -- src/game/renderQuality.test.ts
npm test
npm run build
```

Expected: all commands PASS.

- [ ] **Step 6: Commit**

```bash
git add src/game/renderQuality.ts src/game/renderQuality.test.ts src/game/Game.ts
git commit -m "perf: tune WebGL render quality defaults"
```

### Task 2: Add DOM Write Guards And Stop Rebuilding Static Progress Every Frame

**Files:**
- Create: `src/game/domPerformance.ts`
- Create: `src/game/domPerformance.test.ts`
- Modify: `src/game/Game.ts:2257-2321`

- [ ] **Step 1: Write the failing tests**

Create `src/game/domPerformance.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { setClassNameIfChanged, setStylePropertyIfChanged, setTextIfChanged } from './domPerformance';

function fakeElement() {
  const style = {
    values: new Map<string, string>(),
    setProperty: vi.fn((name: string, value: string) => style.values.set(name, value)),
    getPropertyValue: vi.fn((name: string) => style.values.get(name) ?? '')
  };
  return {
    textContent: '',
    className: '',
    style
  } as unknown as HTMLElement;
}

describe('DOM performance helpers', () => {
  it('only writes changed text', () => {
    const element = fakeElement();

    expect(setTextIfChanged(element, 'A')).toBe(true);
    expect(element.textContent).toBe('A');
    expect(setTextIfChanged(element, 'A')).toBe(false);
    expect(setTextIfChanged(element, 'B')).toBe(true);
    expect(element.textContent).toBe('B');
  });

  it('only writes changed class names', () => {
    const element = fakeElement();

    expect(setClassNameIfChanged(element, 'chip is-ready')).toBe(true);
    expect(setClassNameIfChanged(element, 'chip is-ready')).toBe(false);
    expect(setClassNameIfChanged(element, 'chip')).toBe(true);
  });

  it('only writes changed style properties', () => {
    const element = fakeElement();

    expect(setStylePropertyIfChanged(element, '--feedback-opacity', '0.5')).toBe(true);
    expect(setStylePropertyIfChanged(element, '--feedback-opacity', '0.5')).toBe(false);
    expect(setStylePropertyIfChanged(element, '--feedback-opacity', '0')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/game/domPerformance.test.ts
```

Expected: FAIL with an import error for `./domPerformance`.

- [ ] **Step 3: Implement DOM helper module**

Create `src/game/domPerformance.ts`:

```ts
export function setTextIfChanged(element: HTMLElement, value: string): boolean {
  if (element.textContent === value) return false;
  element.textContent = value;
  return true;
}

export function setClassNameIfChanged(element: HTMLElement, value: string): boolean {
  if (element.className === value) return false;
  element.className = value;
  return true;
}

export function setStylePropertyIfChanged(element: HTMLElement, name: string, value: string): boolean {
  if (element.style.getPropertyValue(name) === value) return false;
  element.style.setProperty(name, value);
  return true;
}
```

- [ ] **Step 4: Use guarded writes in `Game.ts`**

Add this import:

```ts
import { setClassNameIfChanged, setStylePropertyIfChanged, setTextIfChanged } from './domPerformance';
```

Add these fields near the HUD element fields:

```ts
private hudProgressMarkup = '';
```

Add this method near `updateHud()`:

```ts
private updateHudProgressMarkup(): void {
  const nextMarkup = LEVELS.map((item, index) => {
    const state = index < this.levelIndex ? 'is-done' : index === this.levelIndex ? 'is-current' : '';
    return `<span class="progress-dot ${state}" title="Кімната ${item.id}: ${item.name}">${item.id}</span>`;
  }).join('');

  if (this.hudProgressMarkup === nextMarkup) return;
  this.hudProgressMarkup = nextMarkup;
  this.hudProgress.innerHTML = nextMarkup;
}
```

In `loadLevel`, after `this.showRoomStartToast(level);`, add:

```ts
this.updateHudProgressMarkup();
```

Replace the write-heavy part of `updateHud()` with guarded writes:

```ts
setTextIfChanged(this.hudLevel, `Кімната ${level.id}/${LEVELS.length}: ${level.name}`);
const healthHud = describeHealthHud({
  health: this.health,
  maxHealth: PLAYER_MAX_HEALTH,
  shieldTimer: this.shieldTimer,
  difficulty: this.settings.difficulty
});
setTextIfChanged(this.hudHealth, healthHud.text);
setClassNameIfChanged(this.hudHealth, healthHud.classes.join(' '));
setTextIfChanged(this.hudGears, `Очки ${this.score} | Шестерні ${this.gears}`);
const objectiveHud = describeObjectiveHud(objectiveDone);
setTextIfChanged(this.hudObjective, objectiveHud.text || formatObjectiveHint(this.objectiveProgressText(), level.tip));
setClassNameIfChanged(this.hudObjective, objectiveHud.classes.join(' '));
this.updateExitPadStatus(objectiveDone);
this.hudHint.classList.toggle('is-alert', this.invulnerableTimer > 0 || this.laserContactTimer > 0);
const feedback = describePlayerFeedback({
  health: this.health,
  maxHealth: PLAYER_MAX_HEALTH,
  invulnerableTimer: this.invulnerableTimer,
  laserContactTimer: this.laserContactTimer,
  shieldTimer: this.shieldTimer
});
setClassNameIfChanged(this.feedbackVignette, feedback.classes.join(' '));
setStylePropertyIfChanged(this.feedbackVignette, '--feedback-opacity', String(feedback.opacity));
const powerHud = describePowerHud({
  rapidTimer: this.rapidTimer,
  shieldTimer: this.shieldTimer,
  overchargeShots: this.overchargeShots
});
setTextIfChanged(this.hudPower, powerHud.text);
setClassNameIfChanged(this.hudPower, powerHud.classes.join(' '));
setTextIfChanged(this.hudDash, this.dashCooldown <= 0 ? 'Ривок готовий' : `Ривок ${this.dashCooldown.toFixed(1)}с`);
this.hudDash.classList.toggle('is-ready', this.dashCooldown <= 0);
setTextIfChanged(this.hudCamera, this.cameraController.getHudLabel());
```

Replace the existing `this.hudProgress.innerHTML = LEVELS.map(...).join('');` block with:

```ts
this.updateHudProgressMarkup();
```

In the boss HUD branch, replace text writes with:

```ts
setTextIfChanged(this.hudBoss, status.text);
```

- [ ] **Step 5: Run verification**

Run:

```bash
npm test -- src/game/domPerformance.test.ts
npm test
npm run build
```

Expected: all commands PASS.

- [ ] **Step 6: Commit**

```bash
git add src/game/domPerformance.ts src/game/domPerformance.test.ts src/game/Game.ts
git commit -m "perf: skip unchanged HUD DOM writes"
```

### Task 3: Dispose Three.js Resources On Removal And Level Clear

**Files:**
- Create: `src/game/threeDisposal.ts`
- Create: `src/game/threeDisposal.test.ts`
- Modify: `src/game/Game.ts:629-646`
- Modify: `src/game/Game.ts:1984-2005`
- Modify: `src/game/Game.ts:2195-2198`
- Modify: `src/game/Game.ts:2532-2542`

- [ ] **Step 1: Write the failing tests**

Create `src/game/threeDisposal.test.ts`:

```ts
import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { disposeObject3D } from './threeDisposal';

describe('Three.js disposal helper', () => {
  it('disposes mesh geometry and material', () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial();
    const geometryDisposed = vi.fn();
    const materialDisposed = vi.fn();
    geometry.addEventListener('dispose', geometryDisposed);
    material.addEventListener('dispose', materialDisposed);

    const mesh = new THREE.Mesh(geometry, material);
    disposeObject3D(mesh);

    expect(geometryDisposed).toHaveBeenCalledOnce();
    expect(materialDisposed).toHaveBeenCalledOnce();
  });

  it('disposes material textures', () => {
    const texture = new THREE.Texture();
    const textureDisposed = vi.fn();
    texture.addEventListener('dispose', textureDisposed);
    const material = new THREE.MeshBasicMaterial({ map: texture });

    disposeObject3D(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material));

    expect(textureDisposed).toHaveBeenCalledOnce();
  });

  it('disposes children recursively', () => {
    const root = new THREE.Group();
    const childGeometry = new THREE.SphereGeometry(1);
    const childMaterial = new THREE.MeshBasicMaterial();
    const childGeometryDisposed = vi.fn();
    const childMaterialDisposed = vi.fn();
    childGeometry.addEventListener('dispose', childGeometryDisposed);
    childMaterial.addEventListener('dispose', childMaterialDisposed);

    root.add(new THREE.Mesh(childGeometry, childMaterial));
    disposeObject3D(root);

    expect(childGeometryDisposed).toHaveBeenCalledOnce();
    expect(childMaterialDisposed).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/game/threeDisposal.test.ts
```

Expected: FAIL with an import error for `./threeDisposal`.

- [ ] **Step 3: Implement disposal helper**

Create `src/game/threeDisposal.ts`:

```ts
import * as THREE from 'three';

type DisposableMaterial = THREE.Material & {
  [key: string]: unknown;
};

export function disposeObject3D(object: THREE.Object3D): void {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh || child instanceof THREE.Sprite || child instanceof THREE.Points || child instanceof THREE.Line)) {
      return;
    }

    const geometry = 'geometry' in child ? child.geometry : undefined;
    geometry?.dispose();

    const material = 'material' in child ? child.material : undefined;
    disposeMaterialOrList(material);
  });
}

export function disposeMaterialOrList(material: THREE.Material | THREE.Material[] | undefined): void {
  if (!material) return;
  if (Array.isArray(material)) {
    material.forEach(disposeMaterial);
    return;
  }
  disposeMaterial(material);
}

function disposeMaterial(material: THREE.Material): void {
  const candidate = material as DisposableMaterial;
  for (const value of Object.values(candidate)) {
    if (value instanceof THREE.Texture) {
      value.dispose();
    }
  }
  material.dispose();
}
```

- [ ] **Step 4: Use disposal helper in `Game.ts`**

Add this import:

```ts
import { disposeObject3D } from './threeDisposal';
```

Replace `clearLevel()` with:

```ts
private clearLevel(): void {
  disposeObject3D(this.levelRoot);
  disposeObject3D(this.dynamicRoot);
  this.levelRoot.clear();
  this.dynamicRoot.clear();
  this.enemies.length = 0;
  this.targets.length = 0;
  this.collectibles.length = 0;
  this.doors.length = 0;
  this.buttons.length = 0;
  this.lasers.length = 0;
  this.powerUps.length = 0;
  this.obstacles.length = 0;
  this.bullets.length = 0;
  this.sparks.length = 0;
  this.pulses.length = 0;
  this.exitPad = undefined;
  this.exitPadMaterial = undefined;
  this.exitLabel = undefined;
}
```

Replace `removeBullet()` with:

```ts
private removeBullet(index: number): void {
  const [bullet] = this.bullets.splice(index, 1);
  this.dynamicRoot.remove(bullet.mesh);
  disposeObject3D(bullet.mesh);
}
```

Inside `updateSparks`, when a spark expires, replace the removal block with:

```ts
this.dynamicRoot.remove(spark.mesh);
disposeObject3D(spark.mesh);
this.sparks.splice(i, 1);
```

Inside `updatePulses`, when a pulse expires, replace the removal block with:

```ts
this.dynamicRoot.remove(pulse.mesh);
disposeObject3D(pulse.mesh);
this.pulses.splice(i, 1);
```

In `destroy()`, before `this.renderer.dispose();`, add:

```ts
this.clearLevel();
disposeObject3D(this.player);
disposeObject3D(this.playerEffectRoot);
disposeObject3D(this.aimMarker);
disposeObject3D(this.firstPersonBlaster);
```

- [ ] **Step 5: Run verification**

Run:

```bash
npm test -- src/game/threeDisposal.test.ts
npm test
npm run build
```

Expected: all commands PASS.

- [ ] **Step 6: Commit**

```bash
git add src/game/threeDisposal.ts src/game/threeDisposal.test.ts src/game/Game.ts
git commit -m "perf: dispose Three.js resources on cleanup"
```

### Task 4: Remove Repeated Door/Button Filtering From The Frame Loop

**Files:**
- Modify: `src/game/Game.ts:224-237`
- Modify: `src/game/Game.ts:601-627`
- Modify: `src/game/Game.ts:1901-1906`
- Test: existing `src/game/doorStatus.test.ts`, `src/game/campaignPlaythrough.test.ts`

- [ ] **Step 1: Write the failing regression test**

No new pure module is required because this change is internal data wiring. Before editing, run the current door and campaign tests as the locked baseline:

```bash
npm test -- src/game/doorStatus.test.ts src/game/campaignPlaythrough.test.ts
```

Expected: PASS. Treat any failure as a blocker for this task.

- [ ] **Step 2: Add cached relation fields**

In `src/game/Game.ts`, add this field near the arrays:

```ts
private readonly buttonsByDoorId = new Map<string, LabButton[]>();
```

In `clearLevel()`, add:

```ts
this.buttonsByDoorId.clear();
```

- [ ] **Step 3: Build the map after buttons spawn**

Add this method near `spawnButton()`:

```ts
private rebuildButtonDoorIndex(): void {
  this.buttonsByDoorId.clear();
  for (const button of this.buttons) {
    for (const doorId of button.opensDoorIds) {
      const buttons = this.buttonsByDoorId.get(doorId) ?? [];
      buttons.push(button);
      this.buttonsByDoorId.set(doorId, buttons);
    }
  }
}
```

In `loadLevel()`, immediately after `level.buttons?.forEach((button) => this.spawnButton(button));`, add:

```ts
this.rebuildButtonDoorIndex();
```

- [ ] **Step 4: Replace per-frame filtering**

In `updateDoors()`, replace:

```ts
const relatedButtons = this.buttons.filter((button) => button.opensDoorIds.includes(door.id));
```

with:

```ts
const relatedButtons = this.buttonsByDoorId.get(door.id) ?? [];
```

- [ ] **Step 5: Run verification**

Run:

```bash
npm test -- src/game/doorStatus.test.ts src/game/campaignPlaythrough.test.ts
npm test
npm run build
```

Expected: all commands PASS.

- [ ] **Step 6: Commit**

```bash
git add src/game/Game.ts
git commit -m "perf: cache door button relationships"
```

### Task 5: Reuse Scratch Vectors In The Game Loop

**Files:**
- Modify: `src/game/Game.ts:209-239`
- Modify: `src/game/Game.ts:1450-1585`
- Modify: `src/game/Game.ts:2010-2058`
- Modify: `src/game/Game.ts:2122-2254`
- Test: existing combat, collision, level, and campaign tests

- [ ] **Step 1: Lock behavior with focused tests**

Run:

```bash
npm test -- src/game/collision.test.ts src/game/combat.test.ts src/game/campaignPlaythrough.test.ts src/game/levelPacing.test.ts
```

Expected: PASS.

- [ ] **Step 2: Add reusable vector fields**

In `src/game/Game.ts`, add these fields near the existing `Vector3` fields:

```ts
private readonly movementInput = new THREE.Vector3();
private readonly movementScratch = new THREE.Vector3();
private readonly aimDirectionScratch = new THREE.Vector3();
private readonly toPlayerScratch = new THREE.Vector3();
private readonly effectPositionScratch = new THREE.Vector3();
private readonly exitPositionScratch = new THREE.Vector3();
private readonly aimMarkerTarget = new THREE.Vector3();
```

- [ ] **Step 3: Replace movement allocations**

In `updatePlayer()`, replace the movement setup with:

```ts
const movementInput = this.movementInput.set(0, 0, 0);
if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) movementInput.z -= 1;
if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) movementInput.z += 1;
if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) movementInput.x -= 1;
if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) movementInput.x += 1;
const movementDirection = this.cameraController.getMovementDirection(movementInput);
if (movementDirection.lengthSq() > 0) {
  this.lastMoveDirection.copy(movementDirection);
  this.movementScratch.copy(movementDirection).multiplyScalar(PLAYER_SPEED * delta);
  this.movePlayer(this.movementScratch);
}
```

Replace:

```ts
const aimDirection = this.aimPoint.clone().sub(this.playerPosition);
```

with:

```ts
const aimDirection = this.aimDirectionScratch.copy(this.aimPoint).sub(this.playerPosition);
```

- [ ] **Step 4: Replace aim marker and camera allocations**

In `updateAimMarker()`, replace:

```ts
this.aimMarker.position.lerp(new THREE.Vector3(this.aimPoint.x, 0.09, this.aimPoint.z), 1 - Math.pow(0.004, delta));
```

with:

```ts
this.aimMarkerTarget.set(this.aimPoint.x, 0.09, this.aimPoint.z);
this.aimMarker.position.lerp(this.aimMarkerTarget, 1 - Math.pow(0.004, delta));
```

In `updateCamera()`, replace:

```ts
const aimDirection = this.aimPoint.clone().sub(this.playerPosition);
```

with:

```ts
const aimDirection = this.aimDirectionScratch.copy(this.aimPoint).sub(this.playerPosition);
```

In `checkExit()` and `isObjectiveComplete()`, replace each `new THREE.Vector3(level.exit.x, 0, level.exit.z)` with:

```ts
this.exitPositionScratch.set(level.exit.x, 0, level.exit.z)
```

Keep the expression inline only where the value is consumed immediately:

```ts
if (this.distance2D(this.playerPosition, this.exitPositionScratch.set(level.exit.x, 0, level.exit.z)) < 1.35) {
```

- [ ] **Step 5: Replace enemy loop scratch allocations carefully**

In `updateEnemies()`, replace:

```ts
const toPlayer = this.playerPosition.clone().sub(enemy.group.position);
```

with:

```ts
const toPlayer = this.toPlayerScratch.copy(this.playerPosition).sub(enemy.group.position);
```

When a later call needs to keep a direction after `toPlayer.normalize()`, pass a copied vector:

```ts
this.fireEnemyBullet(enemy.group.position, this.movementScratch.copy(toPlayer).normalize(), 12);
```

For boss spread bullets, keep the existing `new THREE.Vector3(...)` inside the bullet-count loop because each fired bullet needs its own velocity copy and boss bursts are intermittent.

- [ ] **Step 6: Run verification**

Run:

```bash
npm test -- src/game/collision.test.ts src/game/combat.test.ts src/game/campaignPlaythrough.test.ts src/game/levelPacing.test.ts
npm test
npm run build
```

Expected: all commands PASS.

- [ ] **Step 7: Commit**

```bash
git add src/game/Game.ts
git commit -m "perf: reuse scratch vectors in game loop"
```

### Task 6: Reuse Scratch Vectors In CameraController

**Files:**
- Modify: `src/game/camera/CameraController.ts:1-180`
- Modify: `src/game/camera/CameraController.test.ts`

- [ ] **Step 1: Add focused regression tests**

Append to `src/game/camera/CameraController.test.ts`:

```ts
it('returns stable movement directions across repeated calls', () => {
  const camera = new THREE.PerspectiveCamera();
  const controller = new CameraController(camera);
  const input = new THREE.Vector3(1, 0, -1);

  const first = controller.getMovementDirection(input);
  const second = controller.getMovementDirection(input);

  expect(first.equals(second)).toBe(true);
  expect(first).not.toBe(second);
});

it('keeps third-person aim direction independent from caller mutation', () => {
  const camera = new THREE.PerspectiveCamera();
  const controller = new CameraController(camera);
  const source = new THREE.Vector3(1, 0, 0);

  const direction = controller.getAimDirection(source, new THREE.Vector3(0, 0, -1));
  source.set(0, 0, 0);

  expect(direction.x).toBeCloseTo(1);
  expect(direction.z).toBeCloseTo(0);
});
```

- [ ] **Step 2: Run test before editing**

Run:

```bash
npm test -- src/game/camera/CameraController.test.ts
```

Expected: PASS. These tests guard the public return-value contract before internals change.

- [ ] **Step 3: Add scratch fields**

In `src/game/camera/CameraController.ts`, add these fields:

```ts
private readonly targetPosition = new THREE.Vector3();
private readonly lookTarget = new THREE.Vector3();
private readonly headPosition = new THREE.Vector3();
private readonly lookDirection = new THREE.Vector3();
private readonly planarInput = new THREE.Vector3();
private readonly forward = new THREE.Vector3();
private readonly right = new THREE.Vector3();
private readonly movement = new THREE.Vector3();
private readonly aimDirection = new THREE.Vector3();
private readonly fallbackAimDirection = new THREE.Vector3();
```

- [ ] **Step 4: Replace camera update clones**

Replace `updateThirdPerson()` with:

```ts
updateThirdPerson(delta: number, playerPosition: THREE.Vector3): void {
  this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, 50, 1 - Math.pow(0.002, delta));
  this.camera.updateProjectionMatrix();
  this.targetPosition.copy(playerPosition).add(THIRD_PERSON_OFFSET);
  if (this.snapNextUpdate) {
    this.camera.position.copy(this.targetPosition);
    this.snapNextUpdate = false;
  } else {
    this.camera.position.lerp(this.targetPosition, 1 - Math.pow(0.001, delta));
  }
  this.lookTarget.copy(playerPosition).add(THIRD_PERSON_LOOK_OFFSET);
  this.camera.lookAt(this.lookTarget);
}
```

Replace `updateFirstPerson()` with:

```ts
updateFirstPerson(delta: number, playerPosition: THREE.Vector3, facingDirection: THREE.Vector3): void {
  this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, 62, 1 - Math.pow(0.002, delta));
  this.camera.updateProjectionMatrix();
  if (!this.firstPersonLookReady) {
    this.resetFirstPersonLook(facingDirection);
  }
  this.getFirstPersonLookDirection(this.lookDirection);
  this.headPosition.copy(playerPosition).add(FIRST_PERSON_HEAD_OFFSET);
  if (this.snapNextUpdate) {
    this.camera.position.copy(this.headPosition);
    this.snapNextUpdate = false;
  } else {
    this.camera.position.lerp(this.headPosition, 1 - Math.pow(0.0006, delta));
  }
  this.lookTarget.copy(this.headPosition).addScaledVector(this.lookDirection, 8);
  this.camera.lookAt(this.lookTarget);
}
```

Replace `getFirstPersonLookDirection()` with:

```ts
private getFirstPersonLookDirection(target = new THREE.Vector3()): THREE.Vector3 {
  const cosPitch = Math.cos(this.firstPersonPitch);
  return target.set(
    Math.sin(this.firstPersonYaw) * cosPitch,
    Math.sin(this.firstPersonPitch),
    -Math.cos(this.firstPersonYaw) * cosPitch
  ).normalize();
}
```

- [ ] **Step 5: Keep public return values safe**

Replace `getMovementDirection()` with:

```ts
getMovementDirection(input: THREE.Vector3): THREE.Vector3 {
  this.planarInput.copy(input);
  this.planarInput.y = 0;
  if (this.planarInput.lengthSq() < 0.001) {
    return new THREE.Vector3();
  }

  if (this.mode !== 'firstPerson') {
    return this.planarInput.clone().normalize();
  }

  if (!this.firstPersonLookReady) {
    this.resetFirstPersonLook(this.fallbackAimDirection.set(0, 0, -1));
  }

  this.getFirstPersonLookDirection(this.forward);
  this.forward.y = 0;
  this.forward.normalize();
  this.right.set(-this.forward.z, 0, this.forward.x);
  this.movement.set(0, 0, 0)
    .addScaledVector(this.right, this.planarInput.x)
    .addScaledVector(this.forward, -this.planarInput.z);

  return this.movement.lengthSq() > 0.001 ? this.movement.clone().normalize() : this.movement.clone();
}
```

Replace `getAimDirection()` with:

```ts
getAimDirection(thirdPersonDirection: THREE.Vector3, fallbackDirection: THREE.Vector3): THREE.Vector3 {
  if (this.mode === 'firstPerson') {
    this.camera.getWorldDirection(this.aimDirection);
    this.aimDirection.y = 0;
    if (this.aimDirection.lengthSq() > 0.001) {
      return this.aimDirection.clone().normalize();
    }
  }

  this.aimDirection.copy(thirdPersonDirection);
  this.aimDirection.y = 0;
  if (this.aimDirection.lengthSq() > 0.001) {
    return this.aimDirection.clone().normalize();
  }

  this.fallbackAimDirection.copy(fallbackDirection);
  this.fallbackAimDirection.y = 0;
  if (this.fallbackAimDirection.lengthSq() > 0.001) {
    return this.fallbackAimDirection.clone().normalize();
  }

  return new THREE.Vector3(0, 0, -1);
}
```

- [ ] **Step 6: Run verification**

Run:

```bash
npm test -- src/game/camera/CameraController.test.ts
npm test
npm run build
```

Expected: all commands PASS.

- [ ] **Step 7: Commit**

```bash
git add src/game/camera/CameraController.ts src/game/camera/CameraController.test.ts
git commit -m "perf: reduce camera vector churn"
```

### Task 7: Add Production Performance Probe

**Files:**
- Create: `scripts/perf/robolab-performance-probe.mjs`
- Modify: `package.json`

- [ ] **Step 1: Add the npm script**

In `package.json`, change scripts to include `perf:probe`:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "perf:probe": "node scripts/perf/robolab-performance-probe.mjs"
}
```

- [ ] **Step 2: Create the probe script**

Create `scripts/perf/robolab-performance-probe.mjs`:

```js
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { chromium } from 'playwright';

const port = 4173;
const url = `http://127.0.0.1:${port}/robolab-arena/`;

const preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port)], {
  stdio: ['ignore', 'pipe', 'pipe']
});

let output = '';
preview.stdout.on('data', (chunk) => {
  output += chunk.toString();
});
preview.stderr.on('data', (chunk) => {
  output += chunk.toString();
});

async function waitForServer() {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 12000) {
    if (output.includes(url)) return;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`Preview server did not expose ${url}. Output:\n${output}`);
}

async function measureFrames(page, durationMs) {
  return page.evaluate(async (duration) => {
    const frames = [];
    let last = performance.now();
    const end = last + duration;
    await new Promise((resolve) => {
      const tick = (now) => {
        frames.push(now - last);
        last = now;
        if (now >= end) {
          resolve();
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

    const sorted = [...frames].sort((a, b) => a - b);
    const average = frames.reduce((sum, value) => sum + value, 0) / frames.length;
    return {
      frameCount: frames.length,
      averageMs: Number(average.toFixed(2)),
      p95Ms: Number((sorted[Math.floor(sorted.length * 0.95)] ?? 0).toFixed(2)),
      longFramesOver20ms: frames.filter((value) => value > 20).length,
      fpsApprox: Number((1000 / average).toFixed(1))
    };
  }, durationMs);
}

let browser;

try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle' });
  const menu = await measureFrames(page, 900);
  await page.getByRole('button', { name: /Почати гру/ }).click();
  await page.waitForTimeout(400);
  const playing = await measureFrames(page, 1600);
  const dom = await page.evaluate(() => ({
    canvasCount: document.querySelectorAll('canvas').length,
    nodeCount: document.querySelectorAll('*').length,
    hudSample: Array.from(document.querySelectorAll('.status-chip,.objective-chip,.toast-chip'))
      .map((element) => element.textContent?.trim())
      .filter(Boolean)
      .slice(0, 6)
  }));

  if (dom.canvasCount !== 1) {
    throw new Error(`Expected one canvas, found ${dom.canvasCount}`);
  }

  console.log(JSON.stringify({ url, menu, playing, dom }, null, 2));
} finally {
  await browser?.close();
  preview.kill('SIGTERM');
  await Promise.race([
    once(preview, 'exit'),
    new Promise((resolve) => setTimeout(resolve, 1000))
  ]);
}
```

- [ ] **Step 3: Run verification**

Run:

```bash
npm run build
npm run perf:probe
```

Expected: build PASS. Probe prints JSON with `canvasCount: 1`, `menu`, and `playing` frame summaries, then exits with code 0.

- [ ] **Step 4: Commit**

```bash
git add package.json scripts/perf/robolab-performance-probe.mjs
git commit -m "test: add production performance probe"
```

### Task 8: Final Verification And Performance Comparison

**Files:**
- Verify only

- [ ] **Step 1: Run full local quality gate**

Run:

```bash
npm test
npm run build
npm run perf:probe
git diff --check
```

Expected:
- `npm test`: 41+ test files pass.
- `npm run build`: TypeScript and Vite build pass.
- `npm run perf:probe`: JSON output includes one canvas and frame summaries.
- `git diff --check`: no whitespace errors.

- [ ] **Step 2: Inspect final diff scope**

Run:

```bash
git diff --stat
git diff -- src/game/Game.ts src/game/camera/CameraController.ts
```

Expected: diff is limited to performance helpers, guarded DOM writes, disposal, cached door lookup, scratch vectors, and performance probe wiring.

- [ ] **Step 3: Final commit if Task 8 produced any tracked doc/test adjustment**

If Task 8 changes files, commit them:

```bash
git add docs/superpowers/plans/2026-06-07-performance-audit-optimization.md
git commit -m "docs: plan RoboLab performance optimization"
```

If Task 8 changes no files, skip this commit.

## Self-Review

**Spec coverage:** The plan covers deep audit evidence, performance optimization strategy, tests, build verification, browser performance probing, and a no-code-change audit-first handoff.

**Placeholder scan:** The plan contains no empty implementation steps, no missing file paths, and no unspecified test commands.

**Type consistency:** New helpers use stable names across tasks: `calculateRenderPixelRatio`, `getRendererOptions`, `setTextIfChanged`, `setClassNameIfChanged`, `setStylePropertyIfChanged`, `disposeObject3D`, and `disposeMaterialOrList`.

**Remaining risks:** Scratch-vector work must be reviewed carefully because reusing mutable `Vector3` instances can introduce aliasing bugs. The plan keeps public camera return values cloned and verifies behavior with existing tests plus added regressions.
