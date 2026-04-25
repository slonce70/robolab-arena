# RoboLab Arena Final Version Design

## Product Goal

RoboLab Arena should become a polished child-friendly 3D browser adventure shooter: large readable arenas, expressive robot combat, first-person and third-person play, meaningful objectives, strong visual identity, satisfying feedback, and enough structure that a 9-year-old creator can keep expanding it with help.

The final game should feel like a complete small browser game, not a prototype. It should open quickly, teach itself, look coherent, and make every level feel intentionally designed.

## Target Player

- Primary player: children aged 9-10.
- Secondary player: parent/collaborator testing with the child.
- Reading level: short Ukrainian instructions, simple verbs, clear feedback.
- Tone: exciting, bright, robotic, energetic, non-violent.
- Failure style: forgiving; room restart is quick and never punishing.

## Final Experience

The player controls Blitz, a small inventor robot training inside a futuristic RoboLab. Each arena is a different lab module: launch hall, drone hangar, maze, laser track, magnetic workshop, reactor, tower room, parts warehouse, pre-boss arena, and final boss.

The game supports two camera modes:

- Third-person tactical view: default view, good for children, movement readability, and arena awareness.
- First-person blaster view: toggled with `C`, good for aiming, immersion, and “being inside the robot”.

The player can switch views at any time during normal play. Menus, pause overlays, and end screens disable camera input.

## Final Feature Set

### Gameplay Core

- 12+ large arenas with increasing complexity.
- Third-person movement, jump, dash, aiming, shooting, pickups, objectives, doors, lasers, and boss fight.
- First-person mode with weapon visible in front of the camera.
- Clear objective system with objective-specific progress:
  - targets: `3/5 мішеней`;
  - enemies: `4/7 роботів`;
  - buttons: `2/4 кнопки`;
  - lasers: `дійди до виходу`;
  - boss: `ядро боса 64%`.
- Healing kits that are never consumed at full health.
- Power-ups:
  - repair kit: restores health;
  - rapid blaster: faster shots for a short time;
  - shield: reduced damage for a short time;
  - overcharge: one charged shot after collecting rare energy cells.
- Door and obstacle collision must be solid for walking, dash, and bullets.
- Lasers must damage instantly when touched and show visual danger.
- Enemies must not damage through solid geometry.

### First-Person Mode

- Toggle: `C`.
- Third-person remains default at game start.
- In first-person:
  - camera sits at robot head height;
  - crosshair is centered;
  - blaster model is visible at lower-right;
  - movement direction follows keyboard, not camera roll;
  - aiming uses mouse position/camera direction;
  - HUD becomes more compact.
- In third-person:
  - camera follows behind and above Blitz;
  - aiming marker appears on floor;
  - robot faces movement direction while shots follow the aim direction.
- Camera mode persists during a room and resets only if the user changes it.

### Visual Quality

The visual target is “stylized toy-like sci-fi”, not realistic military sci-fi.

Required art direction:

- bright lab lighting with controlled neon;
- strong silhouettes for every object type;
- material variety: metal, glass, glowing energy, rubber joints, white medkit case;
- readable colors:
  - player: blue/cyan;
  - repair: white/green;
  - rapid: yellow;
  - shield: cyan;
  - hazards: red/pink;
  - exits: green;
  - boss: purple/red core;
- each arena has a landmark, not only grid and pillars.

Model quality ladder:

1. Procedural upgraded models in Three.js groups, built from capsule/cylinder/box/torus shapes.
2. Generated texture decals for faces, panels, floor signs, warning icons, and medkit labels.
3. Optional GLB import pipeline once gameplay is stable.

For this project, procedural Three.js models are the main path until the game mechanics are stable. Image-generated assets should be used as textures/decals/UI art, not as a replacement for interactive 3D objects.

### Enemy Roster

Each enemy needs a distinct silhouette, motion, and gameplay purpose.

- Drone: flying scout, rotor animation, slow ranged shots, low health.
- Turret: stationary control enemy, red warning ring before firing, medium health.
- Beetle: low ground chaser, leg animation, contact damage, cannot pass through cover.
- Shield Bot: protects nearby enemies until disabled.
- Laser Sweeper: moves a hazard beam across an arena lane.
- Boss: large guardian, pulsing weak core, rotating crown, multi-shot attack, phase changes.

### Level Design

Final levels should avoid “just run to exit”. Every level needs:

- one main objective;
- at least one optional pickup route;
- at least two cover/route decisions;
- one visual landmark;
- one mechanic introduced or combined;
- clear exit visibility after objective completion.

Difficulty curve:

1. Movement, shooting, medkit identity.
2. Drones and basic cover.
3. Buttons and doors.
4. Lasers and timing.
5. Mixed combat plus healing.
6. Reactor puzzle with routes.
7. Long traversal and dash lanes.
8. Turret tower tactics.
9. Search/target hunt in storage.
10. Multi-door reactor challenge.
11. Pre-boss combat arena.
12. Boss with phases.
13-15 optional final expansion levels after core polish.

### UI and UX

HUD must protect the playfield:

- desktop:
  - left cluster: room, health, score;
  - center chip: current objective;
  - right cluster: room progress and boss health;
  - bottom: one toast lane;
- mobile:
  - current room only, not 12 dots;
  - objective and toast cannot overlap;
  - long hints are hidden after start;
  - first-person toggle remains keyboard-only until touch controls are intentionally designed.

Menus:

- Start screen: short feature list and Play button.
- Pause screen: controls, camera mode, restart room, resume.
- Level-complete screen: score, pickups, next room.
- Victory screen: final score, rooms cleared, optional replay.

### Feedback and Juice

Every important action needs feedback:

- shooting: muzzle glow, projectile trail, hit flash;
- enemy firing: warning ring or barrel glow;
- laser damage: red screen edge or HUD flash;
- medkit: green pulse, plus sign, heal toast;
- shield: cyan shield ring around player;
- dash: afterimage or spark trail;
- objective complete: green exit pulse and toast;
- boss phase: camera shake-lite, core pulse, boss health update.

Motion must be meaningful, not constant noise.

### Audio

Add audio after visual/mechanics foundation:

- blaster shot;
- hit/target disabled;
- pickup;
- door open;
- laser warning;
- dash;
- boss phase;
- victory.

Audio must be toggleable and start only after user interaction.

### Save and Progress

Use local browser storage:

- best score;
- highest unlocked room;
- preferred camera mode;
- sound on/off;
- reduced motion preference.

No accounts, no network backend, no personal data.

### Technical Architecture

The current `Game.ts` is too large for final development. The final architecture should split responsibilities:

- `src/game/Game.ts`: orchestration only.
- `src/game/state.ts`: core state, score, room progress, player stats.
- `src/game/levels.ts`: level data.
- `src/game/levelValidation.ts`: data validation for levels.
- `src/game/camera/CameraController.ts`: first/third-person camera modes.
- `src/game/entities/Player.ts`: player state, movement, dash, animation.
- `src/game/entities/Enemies.ts`: enemy factories and updates.
- `src/game/entities/Pickups.ts`: repair and power-up logic.
- `src/game/entities/Hazards.ts`: lasers and moving hazards.
- `src/game/entities/Projectiles.ts`: bullets, trails, collision.
- `src/game/render/materials.ts`: shared materials.
- `src/game/render/modelFactories.ts`: procedural model factories.
- `src/game/render/effects.ts`: sparks, trails, warning rings, screen flashes.
- `src/game/ui/Hud.ts`: DOM HUD rendering.
- `src/game/ui/Overlays.ts`: start, pause, level complete, victory.
- `src/game/storage.ts`: localStorage persistence.

The game should continue using Vite, TypeScript, and Three.js. Add heavier libraries only after there is a concrete need.

### Testing and Verification

Automated:

- level validation tests;
- camera mode state tests;
- damage/laser tests;
- pickup behavior tests;
- objective progress tests;
- storage tests.

Browser Use:

- desktop screenshot after start;
- mobile screenshot after start;
- first-person toggle screenshot;
- laser damage visual check;
- medkit collection check;
- level-complete flow check;
- console errors check after every significant feature.

Build:

- `npm test`;
- `npm run build`;
- browser verification on `http://127.0.0.1:5173/`.

### Definition of Final Version

RoboLab Arena reaches “final small-game version” when:

- 12 polished rooms are playable from start to victory.
- Third-person and first-person modes both work.
- Lasers, pickups, doors, bullets, dash, and enemies behave reliably.
- Visual models are distinct and animated.
- HUD is readable on desktop and mobile widths.
- Player can understand what to do without external explanation.
- Production build passes.
- Browser Use verifies desktop and mobile gameplay screenshots with no console errors.

