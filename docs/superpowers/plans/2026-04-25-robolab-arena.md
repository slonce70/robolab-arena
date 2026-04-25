# RoboLab Arena Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first playable browser version of RoboLab Arena.

**Architecture:** Use a plain Vite + TypeScript + Three.js runtime. Keep level definitions as data and build the first playable game around a focused `Game` class that owns scene setup, input, simulation, rendering, level transitions, and HUD callbacks.

**Tech Stack:** Vite, TypeScript, Three.js, Vitest.

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/vite-env.d.ts`

- [ ] Add Vite, TypeScript, Three.js, and Vitest scripts.
- [ ] Add a browser entry page with a root app element.
- [ ] Add Vite ambient types.

### Task 2: Game Data and Tests

**Files:**
- Create: `src/game/types.ts`
- Create: `src/game/levels.ts`
- Create: `src/game/levels.test.ts`

- [ ] Define level, enemy, collectible, button, laser, and objective types.
- [ ] Add five handcrafted lab chambers.
- [ ] Test that the first release has five playable levels and each level has a valid objective.

### Task 3: 3D Runtime

**Files:**
- Create: `src/game/Game.ts`
- Create: `src/main.ts`

- [ ] Build renderer, scene, camera, lights, floor, walls, props, and player robot.
- [ ] Add movement, jumping, mouse aiming, shooting, bullets, enemy updates, hazards, collectibles, buttons, doors, and level transitions.
- [ ] Add start, pause, restart, and completion states.

### Task 4: Interface and Polish

**Files:**
- Create: `src/styles.css`

- [ ] Add a low-chrome HUD that keeps the 3D playfield readable.
- [ ] Add start, level complete, and victory overlays.
- [ ] Add responsive styling for desktop and smaller screens.

### Task 5: Verification

**Commands:**
- `npm install`
- `npm test`
- `npm run build`
- `npm run dev -- --host 127.0.0.1`

- [ ] Confirm tests pass.
- [ ] Confirm production build passes.
- [ ] Open the local game and verify the scene is visible, nonblank, and playable.

