import * as THREE from 'three';
import { LEVELS } from './levels';
import type { ButtonConfig, DoorConfig, EnemyConfig, EnemyKind, LaserConfig, LevelConfig, TargetConfig } from './types';

type GameState = 'menu' | 'playing' | 'levelComplete' | 'finished' | 'paused';
type BulletOwner = 'player' | 'enemy';

type Enemy = {
  group: THREE.Group;
  kind: EnemyKind;
  base: THREE.Vector3;
  health: number;
  maxHealth: number;
  radius: number;
  shootTimer: number;
  alive: boolean;
};

type Target = {
  group: THREE.Group;
  material: THREE.MeshStandardMaterial;
  position: THREE.Vector3;
  hit: boolean;
};

type Collectible = {
  group: THREE.Group;
  position: THREE.Vector3;
  collected: boolean;
};

type Door = {
  id: string;
  group: THREE.Group;
  position: THREE.Vector3;
  open: boolean;
};

type LabButton = {
  group: THREE.Group;
  position: THREE.Vector3;
  opensDoorId: string;
  active: boolean;
};

type Laser = {
  group: THREE.Group;
  material: THREE.MeshStandardMaterial;
  config: LaserConfig;
  active: boolean;
};

type Bullet = {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  owner: BulletOwner;
  damage: number;
  life: number;
};

type Spark = {
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
  life: number;
  maxLife: number;
};

const ROOM_HALF_WIDTH = 9;
const ROOM_HALF_DEPTH = 10;
const PLAYER_RADIUS = 0.55;
const PLAYER_SPEED = 6.3;
const BULLET_SPEED = 15;
const PLAYER_MAX_HEALTH = 100;

const palette = {
  floor: 0x152338,
  wall: 0x243b5d,
  cyan: 0x54f1ff,
  blue: 0x4d8dff,
  yellow: 0xffd166,
  pink: 0xff4fa3,
  green: 0x7cf27c,
  red: 0xff4b55,
  purple: 0xa875ff,
  dark: 0x07111f,
  white: 0xf4fbff
};

export class Game {
  private readonly root: HTMLDivElement;
  private readonly clock = new THREE.Clock();
  private readonly keys = new Set<string>();
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly aimPoint = new THREE.Vector3(0, 0, -1);
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(50, 1, 0.1, 120);
  private readonly floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private readonly levelRoot = new THREE.Group();
  private readonly dynamicRoot = new THREE.Group();
  private readonly player = new THREE.Group();
  private readonly playerPosition = new THREE.Vector3();
  private readonly playerVelocity = new THREE.Vector3();
  private readonly enemies: Enemy[] = [];
  private readonly targets: Target[] = [];
  private readonly collectibles: Collectible[] = [];
  private readonly doors: Door[] = [];
  private readonly buttons: LabButton[] = [];
  private readonly lasers: Laser[] = [];
  private readonly bullets: Bullet[] = [];
  private readonly sparks: Spark[] = [];

  private canvasHost!: HTMLDivElement;
  private overlay!: HTMLDivElement;
  private hudLevel!: HTMLDivElement;
  private hudHealth!: HTMLDivElement;
  private hudGears!: HTMLDivElement;
  private hudObjective!: HTMLDivElement;
  private hudHint!: HTMLDivElement;
  private hudBoss!: HTMLDivElement;

  private state: GameState = 'menu';
  private levelIndex = 0;
  private health = PLAYER_MAX_HEALTH;
  private gears = 0;
  private shootCooldown = 0;
  private invulnerableTimer = 0;
  private levelCompleteTimer = 0;
  private elapsed = 0;
  private animationId = 0;
  private jumpHeld = false;

  constructor(root: HTMLDivElement) {
    this.root = root;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.scene.background = new THREE.Color(0x07111f);
    this.scene.fog = new THREE.Fog(0x07111f, 22, 48);
  }

  mount(): void {
    this.root.innerHTML = `
      <main class="game-shell">
        <div class="canvas-host" aria-label="RoboLab Arena game scene"></div>
        <section class="hud" aria-live="polite">
          <div class="status-chip level-chip"></div>
          <div class="status-row">
            <div class="status-chip health-chip"></div>
            <div class="status-chip gears-chip"></div>
          </div>
          <div class="objective-chip"></div>
          <div class="boss-chip"></div>
          <div class="hint-chip">WASD - рух, мишка - приціл, клік - постріл, Space - стрибок</div>
        </section>
        <section class="overlay is-visible">
          <div class="panel">
            <p class="eyebrow">Перша 3D гра</p>
            <h1>RoboLab Arena</h1>
            <p class="intro">Допоможи роботу Бліцу пройти тренувальні кімнати, збити дронів, засвітити кнопки й перемогти Турбо-Вартового.</p>
            <button class="primary-action" type="button">Почати гру</button>
          </div>
        </section>
      </main>
    `;

    this.canvasHost = this.requireElement('.canvas-host');
    this.overlay = this.requireElement('.overlay');
    this.hudLevel = this.requireElement('.level-chip');
    this.hudHealth = this.requireElement('.health-chip');
    this.hudGears = this.requireElement('.gears-chip');
    this.hudObjective = this.requireElement('.objective-chip');
    this.hudHint = this.requireElement('.hint-chip');
    this.hudBoss = this.requireElement('.boss-chip');
    this.canvasHost.appendChild(this.renderer.domElement);

    this.overlay.querySelector('button')?.addEventListener('click', () => this.startGame());
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerdown', this.handlePointerDown);

    this.setupScene();
    this.loadLevel(0);
    this.handleResize();
    this.animate();
  }

  private requireElement<T extends HTMLElement>(selector: string): T {
    const element = this.root.querySelector<T>(selector);
    if (!element) {
      throw new Error(`Missing UI element: ${selector}`);
    }
    return element;
  }

  private setupScene(): void {
    const hemisphere = new THREE.HemisphereLight(0xa6e8ff, 0x1b2340, 1.7);
    this.scene.add(hemisphere);

    const key = new THREE.DirectionalLight(0xffffff, 2.5);
    key.position.set(8, 16, 8);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 45;
    key.shadow.camera.left = -16;
    key.shadow.camera.right = 16;
    key.shadow.camera.top = 16;
    key.shadow.camera.bottom = -16;
    this.scene.add(key);

    const rim = new THREE.PointLight(palette.cyan, 35, 30, 1.5);
    rim.position.set(0, 5, -7);
    this.scene.add(rim);

    this.scene.add(this.levelRoot, this.dynamicRoot, this.player);
    this.createPlayer();
  }

  private startGame(): void {
    this.state = 'playing';
    this.overlay.classList.remove('is-visible');
    this.health = PLAYER_MAX_HEALTH;
    this.gears = 0;
    this.levelIndex = 0;
    this.loadLevel(0);
  }

  private showOverlay(title: string, text: string, button: string, action: () => void): void {
    this.state = title.includes('Перемога') ? 'finished' : this.state;
    this.overlay.innerHTML = `
      <div class="panel">
        <p class="eyebrow">RoboLab Arena</p>
        <h1>${title}</h1>
        <p class="intro">${text}</p>
        <button class="primary-action" type="button">${button}</button>
      </div>
    `;
    this.overlay.querySelector('button')?.addEventListener('click', action);
    this.overlay.classList.add('is-visible');
  }

  private loadLevel(index: number): void {
    this.levelIndex = index;
    this.levelCompleteTimer = 0;
    this.shootCooldown = 0;
    this.invulnerableTimer = 0;
    this.clearLevel();

    const level = LEVELS[this.levelIndex];
    this.buildRoom(level);
    this.playerPosition.set(level.playerStart.x, 0, level.playerStart.z);
    this.playerVelocity.set(0, 0, 0);
    this.player.position.copy(this.playerPosition);
    this.aimPoint.set(0, 0, level.playerStart.z - 4);

    level.targets?.forEach((target) => this.spawnTarget(target));
    level.collectibles?.forEach((collectible) => this.spawnCollectible(collectible.position.x, collectible.position.z));
    level.enemies?.forEach((enemy) => this.spawnEnemy(enemy));
    level.doors?.forEach((door) => this.spawnDoor(door));
    level.buttons?.forEach((button) => this.spawnButton(button));
    level.lasers?.forEach((laser) => this.spawnLaser(laser));

    this.updateHud();
  }

  private clearLevel(): void {
    this.levelRoot.clear();
    this.dynamicRoot.clear();
    this.enemies.length = 0;
    this.targets.length = 0;
    this.collectibles.length = 0;
    this.doors.length = 0;
    this.buttons.length = 0;
    this.lasers.length = 0;
    this.bullets.length = 0;
    this.sparks.length = 0;
  }

  private buildRoom(level: LevelConfig): void {
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: palette.floor,
      metalness: 0.2,
      roughness: 0.55
    });
    const floor = new THREE.Mesh(new THREE.BoxGeometry(18, 0.4, 20), floorMaterial);
    floor.position.y = -0.25;
    floor.receiveShadow = true;
    this.levelRoot.add(floor);

    const gridMaterial = new THREE.MeshStandardMaterial({
      color: palette.cyan,
      emissive: palette.blue,
      emissiveIntensity: 0.8,
      metalness: 0.3,
      roughness: 0.35
    });
    for (let x = -8; x <= 8; x += 4) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 18), gridMaterial);
      strip.position.set(x, 0.02, 0);
      this.levelRoot.add(strip);
    }
    for (let z = -8; z <= 8; z += 4) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(16, 0.04, 0.06), gridMaterial);
      strip.position.set(0, 0.03, z);
      this.levelRoot.add(strip);
    }

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: palette.wall,
      metalness: 0.35,
      roughness: 0.5
    });
    this.addWall(0, -10.25, 18.5, 0.5, wallMaterial);
    this.addWall(0, 10.25, 18.5, 0.5, wallMaterial);
    this.addWall(-9.25, 0, 0.5, 20.5, wallMaterial);
    this.addWall(9.25, 0, 0.5, 20.5, wallMaterial);

    const exit = this.createPad(level.exit.x, level.exit.z, palette.green, 'ВИХІД');
    this.levelRoot.add(exit);

    const titlePad = this.createFloatingLabel(level.name, 0, 0.08, 9.2);
    this.levelRoot.add(titlePad);
  }

  private addWall(x: number, z: number, width: number, depth: number, material: THREE.Material): void {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(width, 2.2, depth), material);
    wall.position.set(x, 0.9, z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    this.levelRoot.add(wall);
  }

  private createPlayer(): void {
    this.player.clear();
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: palette.blue,
      emissive: 0x0c3d88,
      emissiveIntensity: 0.35,
      metalness: 0.45,
      roughness: 0.28
    });
    const faceMaterial = new THREE.MeshStandardMaterial({
      color: palette.cyan,
      emissive: palette.cyan,
      emissiveIntensity: 1.2,
      metalness: 0.1,
      roughness: 0.2
    });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.1, 0.65), bodyMaterial);
    body.position.y = 0.85;
    body.castShadow = true;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.65, 0.75), bodyMaterial);
    head.position.y = 1.65;
    head.castShadow = true;
    const face = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.28, 0.04), faceMaterial);
    face.position.set(0, 1.67, -0.39);
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 10), faceMaterial);
    antenna.position.y = 2.18;
    const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), faceMaterial);
    antennaTip.position.y = 2.45;
    const blaster = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.8), faceMaterial);
    blaster.position.set(0.55, 1.2, -0.45);
    blaster.castShadow = true;
    this.player.add(body, head, face, antenna, antennaTip, blaster);
  }

  private spawnTarget(config: TargetConfig): void {
    const material = new THREE.MeshStandardMaterial({
      color: palette.yellow,
      emissive: palette.yellow,
      emissiveIntensity: 0.9,
      metalness: 0.25,
      roughness: 0.25
    });
    const group = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.08, 10, 28), material);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 14), material);
    group.add(ring, core);
    group.position.set(config.position.x, 1.2, config.position.z);
    this.dynamicRoot.add(group);
    this.targets.push({
      group,
      material,
      position: new THREE.Vector3(config.position.x, 1.2, config.position.z),
      hit: false
    });
  }

  private spawnCollectible(x: number, z: number): void {
    const material = new THREE.MeshStandardMaterial({
      color: palette.yellow,
      emissive: 0x805c00,
      emissiveIntensity: 0.7,
      metalness: 0.7,
      roughness: 0.22
    });
    const group = new THREE.Group();
    for (let i = 0; i < 8; i += 1) {
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.28), material);
      tooth.position.x = Math.cos(i * Math.PI * 0.25) * 0.34;
      tooth.position.z = Math.sin(i * Math.PI * 0.25) * 0.34;
      tooth.rotation.y = i * Math.PI * 0.25;
      group.add(tooth);
    }
    const center = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.07, 8, 18), material);
    center.rotation.x = Math.PI * 0.5;
    group.add(center);
    group.position.set(x, 0.65, z);
    this.dynamicRoot.add(group);
    this.collectibles.push({ group, position: new THREE.Vector3(x, 0.65, z), collected: false });
  }

  private spawnEnemy(config: EnemyConfig): void {
    const group = new THREE.Group();
    const base = new THREE.Vector3(config.position.x, 0, config.position.z);
    let health = 35;
    let radius = 0.7;

    if (config.kind === 'boss') {
      health = 180;
      radius = 1.5;
    } else if (config.kind === 'turret') {
      health = 55;
      radius = 0.85;
    } else if (config.kind === 'beetle') {
      health = 45;
      radius = 0.65;
    }

    const material = new THREE.MeshStandardMaterial({
      color: config.kind === 'boss' ? palette.purple : palette.pink,
      emissive: config.kind === 'boss' ? 0x2a0f63 : 0x611138,
      emissiveIntensity: 0.55,
      metalness: 0.45,
      roughness: 0.32
    });
    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: palette.red,
      emissive: palette.red,
      emissiveIntensity: 1.3,
      roughness: 0.18
    });

    if (config.kind === 'drone') {
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.48, 20, 14), material);
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 8), eyeMaterial);
      eye.position.set(0, 0.05, -0.42);
      const wingA = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.08, 0.16), material);
      const wingB = wingA.clone();
      wingA.position.x = -0.58;
      wingB.position.x = 0.58;
      group.add(body, eye, wingA, wingB);
      group.position.set(base.x, 1.35, base.z);
    } else if (config.kind === 'turret') {
      const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.75, 0.5, 20), material);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 0.75), material);
      const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.95), eyeMaterial);
      baseMesh.position.y = 0.25;
      head.position.y = 0.8;
      barrel.position.set(0, 0.8, -0.7);
      group.add(baseMesh, head, barrel);
      group.position.copy(base);
    } else if (config.kind === 'boss') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 1.7), material);
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 16), eyeMaterial);
      const armA = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.2, 0.42), material);
      const armB = armA.clone();
      body.position.y = 1.4;
      core.position.set(0, 1.5, -0.88);
      armA.position.set(-1.45, 1.2, 0);
      armB.position.set(1.45, 1.2, 0);
      group.add(body, core, armA, armB);
      group.position.copy(base);
    } else {
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.45, 0.75), material);
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.05), eyeMaterial);
      const legA = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.25, 0.75), material);
      const legB = legA.clone();
      body.position.y = 0.55;
      eye.position.set(0, 0.62, -0.4);
      legA.position.set(-0.35, 0.28, 0);
      legB.position.set(0.35, 0.28, 0);
      group.add(body, eye, legA, legB);
      group.position.copy(base);
    }

    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    this.dynamicRoot.add(group);
    this.enemies.push({ group, kind: config.kind, base, health, maxHealth: health, radius, shootTimer: 1.2, alive: true });
  }

  private spawnDoor(config: DoorConfig): void {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
      color: palette.cyan,
      emissive: palette.blue,
      emissiveIntensity: 1.1,
      transparent: true,
      opacity: 0.78,
      metalness: 0.05,
      roughness: 0.18
    });
    const panel = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.5, 0.28), material);
    panel.position.y = 1.25;
    group.add(panel);
    group.position.set(config.position.x, 0, config.position.z);
    this.dynamicRoot.add(group);
    this.doors.push({ id: config.id, group, position: new THREE.Vector3(config.position.x, 0, config.position.z), open: false });
  }

  private spawnButton(config: ButtonConfig): void {
    const group = new THREE.Group();
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x364c70,
      metalness: 0.45,
      roughness: 0.32
    });
    const lightMaterial = new THREE.MeshStandardMaterial({
      color: palette.red,
      emissive: palette.red,
      emissiveIntensity: 1
    });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.74, 0.25, 24), baseMaterial);
    const button = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.16, 24), lightMaterial);
    base.position.y = 0.12;
    button.position.y = 0.34;
    group.add(base, button);
    group.position.set(config.position.x, 0, config.position.z);
    this.dynamicRoot.add(group);
    this.buttons.push({
      group,
      position: new THREE.Vector3(config.position.x, 0, config.position.z),
      opensDoorId: config.opensDoorId,
      active: false
    });
  }

  private spawnLaser(config: LaserConfig): void {
    const material = new THREE.MeshStandardMaterial({
      color: palette.red,
      emissive: palette.red,
      emissiveIntensity: 1.8,
      transparent: true,
      opacity: 0.85
    });
    const group = new THREE.Group();
    const beam = new THREE.Mesh(new THREE.BoxGeometry(config.axis === 'x' ? config.length : 0.18, 0.18, config.axis === 'z' ? config.length : 0.18), material);
    beam.position.y = 0.65;
    const postA = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 1.2, 14), material);
    const postB = postA.clone();
    if (config.axis === 'x') {
      postA.position.set(-config.length * 0.5, 0.55, 0);
      postB.position.set(config.length * 0.5, 0.55, 0);
    } else {
      postA.position.set(0, 0.55, -config.length * 0.5);
      postB.position.set(0, 0.55, config.length * 0.5);
    }
    group.add(beam, postA, postB);
    group.position.set(config.position.x, 0, config.position.z);
    this.dynamicRoot.add(group);
    this.lasers.push({ group, material, config, active: true });
  }

  private createPad(x: number, z: number, color: number, label: string): THREE.Group {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.75,
      metalness: 0.2,
      roughness: 0.35
    });
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.16, 32), material);
    pad.position.y = 0.06;
    const sign = this.createFloatingLabel(label, 0, 0.38, 0);
    group.add(pad, sign);
    group.position.set(x, 0, z);
    return group;
  }

  private createFloatingLabel(text: string, x: number, y: number, z: number): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not create label canvas.');
    }
    context.fillStyle = 'rgba(7, 17, 31, 0.72)';
    context.roundRect(12, 22, 488, 84, 22);
    context.fill();
    context.strokeStyle = 'rgba(84, 241, 255, 0.85)';
    context.lineWidth = 4;
    context.stroke();
    context.fillStyle = '#f4fbff';
    context.font = '700 38px system-ui, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 256, 64, 456);
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(x, y + 1.4, z);
    sprite.scale.set(3.8, 0.95, 1);
    return sprite;
  }

  private animate = (): void => {
    const delta = Math.min(this.clock.getDelta(), 0.033);
    this.elapsed += delta;
    this.update(delta);
    this.renderer.render(this.scene, this.camera);
    this.animationId = window.requestAnimationFrame(this.animate);
  };

  private update(delta: number): void {
    if (this.state !== 'playing') {
      this.updateCamera(delta);
      return;
    }

    this.shootCooldown = Math.max(0, this.shootCooldown - delta);
    this.invulnerableTimer = Math.max(0, this.invulnerableTimer - delta);
    this.updateAimFromPointer();
    this.updatePlayer(delta);
    this.updateEnemies(delta);
    this.updateBullets(delta);
    this.updateTargets(delta);
    this.updateCollectibles(delta);
    this.updateButtons();
    this.updateDoors(delta);
    this.updateLasers(delta);
    this.updateSparks(delta);
    this.updateCamera(delta);
    this.checkExit(delta);
    this.updateHud();
  }

  private updatePlayer(delta: number): void {
    const move = new THREE.Vector3();
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) move.z -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) move.z += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) move.x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) move.x += 1;
    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(PLAYER_SPEED * delta);
      this.playerPosition.add(move);
    }

    if ((this.keys.has('Space') || this.keys.has('KeyE')) && !this.jumpHeld && this.playerPosition.y <= 0.01) {
      this.playerVelocity.y = 6.5;
      this.jumpHeld = true;
    }
    if (!this.keys.has('Space') && !this.keys.has('KeyE')) {
      this.jumpHeld = false;
    }

    this.playerVelocity.y -= 16 * delta;
    this.playerPosition.y = Math.max(0, this.playerPosition.y + this.playerVelocity.y * delta);
    if (this.playerPosition.y === 0) {
      this.playerVelocity.y = 0;
    }

    this.playerPosition.x = THREE.MathUtils.clamp(this.playerPosition.x, -ROOM_HALF_WIDTH + PLAYER_RADIUS, ROOM_HALF_WIDTH - PLAYER_RADIUS);
    this.playerPosition.z = THREE.MathUtils.clamp(this.playerPosition.z, -ROOM_HALF_DEPTH + PLAYER_RADIUS, ROOM_HALF_DEPTH - PLAYER_RADIUS);
    for (const door of this.doors) {
      if (!door.open && this.distance2D(this.playerPosition, door.position) < 2.25) {
        this.playerPosition.z += this.playerPosition.z > door.position.z ? 0.12 : -0.12;
      }
    }

    this.player.position.copy(this.playerPosition);
    const direction = this.aimPoint.clone().sub(this.playerPosition);
    direction.y = 0;
    if (direction.lengthSq() > 0.01) {
      this.player.rotation.y = Math.atan2(direction.x, direction.z);
    }
  }

  private updateEnemies(delta: number): void {
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;

      const toPlayer = this.playerPosition.clone().sub(enemy.group.position);
      toPlayer.y = 0;
      const distance = Math.max(toPlayer.length(), 0.001);
      const lookAngle = Math.atan2(toPlayer.x, toPlayer.z);
      enemy.group.rotation.y = lookAngle;
      enemy.shootTimer -= delta;

      if (enemy.kind === 'drone') {
        enemy.group.position.x = enemy.base.x + Math.sin(this.elapsed * 1.4 + enemy.base.x) * 0.7;
        enemy.group.position.y = 1.35 + Math.sin(this.elapsed * 3 + enemy.base.z) * 0.22;
        if (enemy.shootTimer <= 0 && distance < 12) {
          this.fireEnemyBullet(enemy.group.position, toPlayer.normalize(), 12);
          enemy.shootTimer = 2.35;
        }
      } else if (enemy.kind === 'turret') {
        if (enemy.shootTimer <= 0 && distance < 13) {
          this.fireEnemyBullet(enemy.group.position.clone().add(new THREE.Vector3(0, 0.9, 0)), toPlayer.normalize(), 16);
          enemy.shootTimer = 1.8;
        }
      } else if (enemy.kind === 'boss') {
        enemy.group.position.y = Math.sin(this.elapsed * 1.8) * 0.08;
        if (enemy.shootTimer <= 0) {
          const baseAngle = Math.atan2(toPlayer.x, toPlayer.z);
          for (const offset of [-0.28, 0, 0.28]) {
            const direction = new THREE.Vector3(Math.sin(baseAngle + offset), 0, Math.cos(baseAngle + offset));
            this.fireEnemyBullet(enemy.group.position.clone().add(new THREE.Vector3(0, 1.4, 0)), direction, 18);
          }
          enemy.shootTimer = 2.2;
        }
      } else {
        if (distance > 1.1) {
          enemy.group.position.add(toPlayer.normalize().multiplyScalar(delta * 2.2));
        } else {
          this.damagePlayer(18);
        }
      }
    }
  }

  private updateBullets(delta: number): void {
    for (let i = this.bullets.length - 1; i >= 0; i -= 1) {
      const bullet = this.bullets[i];
      bullet.life -= delta;
      bullet.mesh.position.addScaledVector(bullet.velocity, delta);
      const outOfBounds = Math.abs(bullet.mesh.position.x) > ROOM_HALF_WIDTH + 2 || Math.abs(bullet.mesh.position.z) > ROOM_HALF_DEPTH + 2;
      if (bullet.life <= 0 || outOfBounds) {
        this.removeBullet(i);
        continue;
      }

      if (bullet.owner === 'player') {
        if (this.hitTargets(bullet.mesh.position)) {
          this.addSpark(bullet.mesh.position, palette.yellow);
          this.removeBullet(i);
          continue;
        }
        const enemy = this.enemies.find((candidate) => candidate.alive && this.distance2D(candidate.group.position, bullet.mesh.position) < candidate.radius);
        if (enemy) {
          enemy.health -= bullet.damage;
          this.addSpark(bullet.mesh.position, enemy.kind === 'boss' ? palette.purple : palette.pink);
          this.removeBullet(i);
          if (enemy.health <= 0) {
            enemy.alive = false;
            enemy.group.visible = false;
            this.addSpark(enemy.group.position.clone().add(new THREE.Vector3(0, 1, 0)), palette.cyan, 1.4);
          }
          continue;
        }
      } else if (this.distance2D(this.playerPosition, bullet.mesh.position) < 0.75) {
        this.damagePlayer(bullet.damage);
        this.addSpark(this.playerPosition.clone().add(new THREE.Vector3(0, 1, 0)), palette.red);
        this.removeBullet(i);
      }
    }
  }

  private hitTargets(position: THREE.Vector3): boolean {
    for (const target of this.targets) {
      if (!target.hit && this.distance2D(target.position, position) < 0.7) {
        target.hit = true;
        target.material.color.setHex(palette.green);
        target.material.emissive.setHex(palette.green);
        target.group.scale.setScalar(0.74);
        return true;
      }
    }
    return false;
  }

  private updateTargets(delta: number): void {
    for (const target of this.targets) {
      target.group.rotation.y += delta * 2.2;
      target.group.rotation.x = Math.sin(this.elapsed * 2 + target.position.x) * 0.16;
      if (!target.hit) {
        target.material.emissiveIntensity = 0.8 + Math.sin(this.elapsed * 5) * 0.25;
      }
    }
  }

  private updateCollectibles(delta: number): void {
    for (const collectible of this.collectibles) {
      if (collectible.collected) continue;
      collectible.group.rotation.y += delta * 3;
      collectible.group.position.y = 0.65 + Math.sin(this.elapsed * 3 + collectible.position.x) * 0.12;
      if (this.distance2D(this.playerPosition, collectible.position) < 0.75) {
        collectible.collected = true;
        collectible.group.visible = false;
        this.gears += 1;
        this.addSpark(collectible.position.clone().add(new THREE.Vector3(0, 0.7, 0)), palette.yellow);
      }
    }
  }

  private updateButtons(): void {
    for (const button of this.buttons) {
      if (!button.active && this.distance2D(this.playerPosition, button.position) < 0.95) {
        button.active = true;
        button.group.scale.y = 0.82;
        this.addSpark(button.position.clone().add(new THREE.Vector3(0, 0.45, 0)), palette.green);
      }
    }
  }

  private updateDoors(delta: number): void {
    for (const door of this.doors) {
      const relatedButtons = this.buttons.filter((button) => button.opensDoorId === door.id);
      const shouldOpen = relatedButtons.length > 0 && relatedButtons.every((button) => button.active);
      if (shouldOpen) {
        door.open = true;
      }
      const targetY = door.open ? 3.2 : 0;
      door.group.position.y = THREE.MathUtils.lerp(door.group.position.y, targetY, delta * 4);
    }
  }

  private updateLasers(delta: number): void {
    for (const laser of this.lasers) {
      laser.active = Math.sin(this.elapsed * 2.4 + laser.config.phase) > -0.25;
      laser.group.visible = laser.active;
      laser.material.opacity = laser.active ? 0.85 : 0.18;
      if (!laser.active || this.playerPosition.y > 0.45) continue;

      const localX = this.playerPosition.x - laser.config.position.x;
      const localZ = this.playerPosition.z - laser.config.position.z;
      const nearBeam =
        laser.config.axis === 'x'
          ? Math.abs(localZ) < 0.35 && Math.abs(localX) < laser.config.length * 0.5
          : Math.abs(localX) < 0.35 && Math.abs(localZ) < laser.config.length * 0.5;
      if (nearBeam) {
        this.damagePlayer(24 * delta);
      }
    }
  }

  private updateSparks(delta: number): void {
    for (let i = this.sparks.length - 1; i >= 0; i -= 1) {
      const spark = this.sparks[i];
      spark.life -= delta;
      const progress = 1 - spark.life / spark.maxLife;
      spark.mesh.scale.setScalar(1 + progress * 2.2);
      spark.material.opacity = Math.max(0, spark.life / spark.maxLife);
      if (spark.life <= 0) {
        this.dynamicRoot.remove(spark.mesh);
        this.sparks.splice(i, 1);
      }
    }
  }

  private updateCamera(delta: number): void {
    const targetPosition = new THREE.Vector3(this.playerPosition.x, 11.8, this.playerPosition.z + 9.5);
    this.camera.position.lerp(targetPosition, 1 - Math.pow(0.001, delta));
    const lookAt = new THREE.Vector3(this.playerPosition.x, 0.7, this.playerPosition.z - 1.6);
    this.camera.lookAt(lookAt);
  }

  private checkExit(delta: number): void {
    if (!this.isObjectiveComplete()) {
      this.levelCompleteTimer = 0;
      return;
    }

    const level = LEVELS[this.levelIndex];
    if (this.distance2D(this.playerPosition, new THREE.Vector3(level.exit.x, 0, level.exit.z)) < 1.35) {
      this.levelCompleteTimer += delta;
      if (this.levelCompleteTimer > 0.35) {
        this.completeLevel();
      }
    } else {
      this.levelCompleteTimer = 0;
    }
  }

  private completeLevel(): void {
    this.state = 'levelComplete';
    const next = this.levelIndex + 1;
    if (next >= LEVELS.length) {
      this.showOverlay('Перемога!', `Бліц пройшов усі кімнати й зібрав ${this.gears} шестерень. Лабораторія відкрита!`, 'Грати ще раз', () => this.startGame());
      return;
    }
    this.showOverlay('Кімнату пройдено!', 'Двері до наступного випробування відкриті. Готовий рухатись далі?', 'Наступна кімната', () => {
      this.state = 'playing';
      this.overlay.classList.remove('is-visible');
      this.loadLevel(next);
    });
  }

  private isObjectiveComplete(): boolean {
    const level = LEVELS[this.levelIndex];
    if (level.objective === 'targets') return this.targets.every((target) => target.hit);
    if (level.objective === 'enemies') return this.enemies.every((enemy) => !enemy.alive);
    if (level.objective === 'buttons') return this.buttons.every((button) => button.active);
    if (level.objective === 'boss') return this.enemies.every((enemy) => !enemy.alive);
    return this.playerPosition.z < -7.2;
  }

  private shoot(): void {
    if (this.shootCooldown > 0 || this.state !== 'playing') return;
    const direction = this.aimPoint.clone().sub(this.playerPosition);
    direction.y = 0;
    if (direction.lengthSq() < 0.1) {
      direction.set(0, 0, -1);
    }
    direction.normalize();
    const material = new THREE.MeshStandardMaterial({
      color: palette.cyan,
      emissive: palette.cyan,
      emissiveIntensity: 1.6,
      roughness: 0.18
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), material);
    mesh.position.copy(this.playerPosition).add(new THREE.Vector3(direction.x * 0.7, 1.1, direction.z * 0.7));
    this.dynamicRoot.add(mesh);
    this.bullets.push({
      mesh,
      velocity: direction.multiplyScalar(BULLET_SPEED),
      owner: 'player',
      damage: 26,
      life: 1.6
    });
    this.shootCooldown = 0.18;
  }

  private fireEnemyBullet(origin: THREE.Vector3, direction: THREE.Vector3, damage: number): void {
    const material = new THREE.MeshStandardMaterial({
      color: palette.red,
      emissive: palette.red,
      emissiveIntensity: 1.5,
      roughness: 0.2
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), material);
    mesh.position.copy(origin);
    this.dynamicRoot.add(mesh);
    this.bullets.push({
      mesh,
      velocity: direction.clone().normalize().multiplyScalar(8.5),
      owner: 'enemy',
      damage,
      life: 2.4
    });
  }

  private removeBullet(index: number): void {
    const [bullet] = this.bullets.splice(index, 1);
    this.dynamicRoot.remove(bullet.mesh);
  }

  private damagePlayer(amount: number): void {
    if (this.invulnerableTimer > 0) return;
    this.health = Math.max(0, this.health - amount);
    this.invulnerableTimer = 0.45;
    if (this.health <= 0) {
      this.health = PLAYER_MAX_HEALTH;
      this.addSpark(this.playerPosition.clone().add(new THREE.Vector3(0, 1, 0)), palette.red, 1.6);
      this.loadLevel(this.levelIndex);
    }
  }

  private addSpark(position: THREE.Vector3, color: number, scale = 1): void {
    const material = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 1.6,
      transparent: true,
      opacity: 0.85,
      roughness: 0.22
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.28 * scale, 18, 12), material);
    mesh.position.copy(position);
    this.dynamicRoot.add(mesh);
    this.sparks.push({ mesh, material, life: 0.42, maxLife: 0.42 });
  }

  private updateHud(): void {
    const level = LEVELS[this.levelIndex];
    const objectiveDone = this.isObjectiveComplete();
    this.hudLevel.textContent = `Кімната ${level.id}/5: ${level.name}`;
    this.hudHealth.textContent = `Енергія ${Math.ceil(this.health)}`;
    this.hudGears.textContent = `Шестерні ${this.gears}`;
    this.hudObjective.textContent = objectiveDone ? 'Ціль виконано. Біжи до зеленого виходу!' : level.tip;
    this.hudHint.classList.toggle('is-alert', this.invulnerableTimer > 0);

    const boss = this.enemies.find((enemy) => enemy.kind === 'boss' && enemy.alive);
    if (boss) {
      const percent = Math.max(0, Math.ceil((boss.health / boss.maxHealth) * 100));
      this.hudBoss.textContent = `Турбо-Вартовий ${percent}%`;
      this.hudBoss.classList.add('is-visible');
    } else {
      this.hudBoss.classList.remove('is-visible');
    }
  }

  private updateAimFromPointer(): void {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    this.raycaster.ray.intersectPlane(this.floorPlane, this.aimPoint);
  }

  private distance2D(a: THREE.Vector3, b: THREE.Vector3): number {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  private handleResize = (): void => {
    const width = Math.max(1, this.canvasHost.clientWidth);
    const height = Math.max(1, this.canvasHost.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  };

  private handlePointerMove = (event: PointerEvent): void => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  };

  private handlePointerDown = (event: PointerEvent): void => {
    if (event.button === 0 && this.state === 'playing') {
      this.shoot();
    }
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    this.keys.add(event.code);
    if (event.code === 'Escape' && this.state === 'playing') {
      this.state = 'paused';
      this.showOverlay('Пауза', 'Гра зупинена. Можна перепочити й повернутися в лабораторію.', 'Продовжити', () => {
        this.state = 'playing';
        this.overlay.classList.remove('is-visible');
      });
    }
    if (event.code === 'KeyR' && this.state === 'playing') {
      this.health = PLAYER_MAX_HEALTH;
      this.loadLevel(this.levelIndex);
    }
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.code);
  };

  destroy(): void {
    window.cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerdown', this.handlePointerDown);
    this.renderer.dispose();
  }
}
