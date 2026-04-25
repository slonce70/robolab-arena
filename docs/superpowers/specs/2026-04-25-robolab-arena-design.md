# RoboLab Arena Design

## Goal

Build a browser-based 3D adventure shooter for a 9-year-old first-time creator. The game should feel playful, bright, and immediately understandable: move a small robot through large lab arenas, shoot energy projectiles, solve room challenges, use healing kits, and beat a boss.

## Audience

The primary player and co-creator is a child aged 9-10. Choices should favor clear controls, strong visual feedback, low punishment, and visible progress over complex systems.

## Game Fantasy

The player is Blitz, a small inventor robot inside a colorful training lab. Each arena is a playful test with drones, buttons, lasers, energy doors, healing kits, cover blocks, collectible gears, and a boss guardian.

## First Version Scope

- 3D browser game built with Vite, TypeScript, and Three.js.
- Twelve larger lab arenas.
- Third-person angled camera.
- Keyboard movement and mouse aiming.
- Energy blaster shooting.
- Enemies, targets, buttons, lasers, doors, collectibles, healing kits, cover obstacles, power-ups, and a boss.
- DOM-based HUD, start screen, level win screen, and game completion screen.
- Bright sci-fi style with simple geometry, neon materials, particle-like flashes, and clear colors.

## Design Principles

- Keep the playfield clear and readable.
- Use friendly robot enemies and energy effects instead of violent imagery.
- Make every level introduce one idea.
- Early arenas teach one idea; later arenas combine ideas into larger tactical layouts.
- Keep restarts quick and forgiving.
- Prefer simple primitives with strong lighting and polish over fragile asset pipelines.

## UI and UX Rules

- The play screen should feel like a game first, not a dashboard.
- Keep the center of the screen clear for aiming, movement, targets, and enemies.
- Important information should fit into compact edge HUD elements: level, energy, score, healing/power-ups, and progress.
- Long instructions belong in start, pause, or level-complete overlays, not permanent gameplay panels.
- Every important event should have immediate feedback: sound-ready visual flash, toast text, score change, or power-up timer.
- Ukrainian text should be short and friendly enough for a 9-year-old to read quickly.
- Controls should be discoverable: start screen explains the basics, HUD reminds only the most important keys, and pause screen offers help.
- Mobile/small viewport layout should collapse into readable chips and must not cover the robot or central targets.

## Gameplay Feel Rules

- Movement should be readable: the robot faces the direction of travel while shots can still aim toward the mouse.
- The player should have at least one expressive mobility action. The first extra action is a short dash on Shift with a cooldown.
- Mistakes should cost energy but not feel punishing. Restarting a room should be fast.
- Each room should have a clear objective and a visual exit cue.
- Pickups should be visually distinct: healing kit/repair is green, rapid blaster is yellow, shield is cyan.
- Large arenas should contain cover, side lanes, and multiple points of interest instead of one small central fight.

## Verification Rules

- Run automated tests after gameplay or level-data changes.
- Run a production build after UI or rendering changes.
- Verify the game in the in-app browser with a fresh reload after changes.
- Browser verification must check visible scene rendering, HUD text, console errors, and at least one real gameplay screenshot.
