import * as THREE from 'three';
import { AudioManager } from './audio';
import {
  BEETLE_CONTACT_DAMAGE,
  ENEMY_INITIAL_SHOOT_DELAY,
  LASER_DAMAGE_PER_SECOND,
  PLAYER_BASE_DAMAGE,
  PLAYER_OVERCHARGE_DAMAGE,
  PLAYER_RAPID_DAMAGE,
  REPAIR_AMOUNT,
  SPAWN_INVULNERABILITY_SECONDS,
  getBossPhase,
  getEnemyStats
} from './balance';
import { describeFirstPersonBlasterState } from './blasterFeedback';
import { CameraController } from './camera/CameraController';
import { pointHitsSolid } from './collision';
import { canApplyDamage, effectiveDamage } from './combat';
import { getControlsHint } from './controlsHint';
import { getDevCompletionTarget, getDevEffectTarget, getDevLevelTarget } from './devControls';
import { describeDifficultyChange, getDifficultyLabel, getEnemyPacingMultiplier, nextDifficulty } from './difficulty';
import { describeDoorLabel, describeDoorOpenedToast, describeDoorVisualStatus, shouldPlayDoorOpenAudio } from './doorStatus';
import { getPowerEffectTheme } from './effects';
import { describeEnemyHitFeedback } from './enemyFeedback';
import { describeExitPadStatus } from './exitStatus';
import { getLevelIntel } from './levelIntel';
import { getLaserHazardFootprint, getLaserWarningLaneOffset, isPointInLaserDamage } from './laserHazard';
import { describeLaserVisibility } from './laserVisibility';
import { LEVELS } from './levels';
import { robotYawForDirection } from './math';
import { createRoomBrief } from './roomBrief';
import { describeBossStatus } from './bossStatus';
import { describeBossPhaseTransitionBurst, describeBossPhaseVisual } from './bossPhaseVisual';
import { describeObjectiveHud, describeObjectiveProgress, formatObjectiveHint } from './objectives';
import { describeHealthHud, describePlayerFeedback, shouldPlayLaserContactAudio } from './playerFeedback';
import { describePowerAuraState } from './powerAura';
import { describePowerHud } from './powerStatus';
import { stepMouseSensitivity, type SensitivityDirection } from './sensitivity';
import { getPointerLockToast, shouldRefreshFirstPersonCaptureOnResume, shouldRequestPointerLock, shouldUseFirstPersonMouseLook } from './pointerLock';
import {
  beginRoom,
  completeRoom,
  createRunStats,
  formatRoomSummary,
  formatVictorySummary,
  recordRestart,
  type RunStats
} from './runStats';
import { loadSettings, saveSettings, type RoboLabSettings } from './storage';
import { describeTargetStatus } from './targetStatus';
import { describePickupBurst } from './transientEffects';
import { getOverlayPanelClass, getOverlayState, type OverlayIntent } from './overlayPresentation';
import { formatVictoryOverlayIntro } from './victoryCopy';
import { getCrosshairClasses, getPlayerProjectileTheme } from './weaponFeedback';
import type {
  ButtonConfig,
  DoorConfig,
  EnemyConfig,
  EnemyKind,
  LaserConfig,
  LevelConfig,
  ObstacleConfig,
  PowerUpConfig,
  PowerUpKind,
  TargetConfig
} from './types';

type GameState = 'menu' | 'playing' | 'levelComplete' | 'finished' | 'paused';
type BulletOwner = 'player' | 'enemy';

type Enemy = {
  group: THREE.Group;
  kind: EnemyKind;
  material: THREE.MeshStandardMaterial;
  base: THREE.Vector3;
  health: number;
  maxHealth: number;
  radius: number;
  shootTimer: number;
  alive: boolean;
  phase: number;
  hitTimer: number;
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
  material: THREE.MeshStandardMaterial;
  label: THREE.Sprite;
  position: THREE.Vector3;
  halfWidth: number;
  halfDepth: number;
  open: boolean;
};

type LabButton = {
  group: THREE.Group;
  position: THREE.Vector3;
  opensDoorId: string;
  opensDoorIds: string[];
  active: boolean;
};

type Laser = {
  group: THREE.Group;
  material: THREE.MeshStandardMaterial;
  config: LaserConfig;
  basePosition: THREE.Vector3;
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

type Pulse = {
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
  life: number;
  maxLife: number;
  maxScale: number;
};

type DamageOptions = {
  continuous?: boolean;
};

type PowerUp = {
  group: THREE.Group;
  kind: PowerUpKind;
  position: THREE.Vector3;
  collected: boolean;
};

type Obstacle = {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  halfWidth: number;
  halfDepth: number;
};

type LevelTheme = {
  floor: number;
  wall: number;
  accent: number;
  secondary: number;
  fog: number;
};

const ROOM_HALF_WIDTH = 18;
const ROOM_HALF_DEPTH = 24;
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
  orange: 0xff9f43,
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
  private readonly cameraController = new CameraController(this.camera);
  private readonly audio = new AudioManager();
  private readonly floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private readonly levelRoot = new THREE.Group();
  private readonly dynamicRoot = new THREE.Group();
  private readonly player = new THREE.Group();
  private readonly playerEffectRoot = new THREE.Group();
  private readonly playerPosition = new THREE.Vector3();
  private readonly playerVelocity = new THREE.Vector3();
  private readonly enemies: Enemy[] = [];
  private readonly targets: Target[] = [];
  private readonly collectibles: Collectible[] = [];
  private readonly doors: Door[] = [];
  private readonly buttons: LabButton[] = [];
  private readonly lasers: Laser[] = [];
  private readonly powerUps: PowerUp[] = [];
  private readonly obstacles: Obstacle[] = [];
  private readonly bullets: Bullet[] = [];
  private readonly sparks: Spark[] = [];
  private readonly pulses: Pulse[] = [];
  private readonly lastMoveDirection = new THREE.Vector3(0, 0, -1);
  private readonly aimMarker = new THREE.Group();
  private readonly firstPersonBlaster = new THREE.Group();
  private exitPad?: THREE.Mesh;
  private exitPadMaterial?: THREE.MeshStandardMaterial;
  private exitLabel?: THREE.Sprite;
  private readonly playerAnimationParts: THREE.Object3D[] = [];

  private canvasHost!: HTMLDivElement;
  private shell!: HTMLElement;
  private overlay!: HTMLDivElement;
  private hudLevel!: HTMLDivElement;
  private hudHealth!: HTMLDivElement;
  private hudGears!: HTMLDivElement;
  private hudObjective!: HTMLDivElement;
  private hudHint!: HTMLDivElement;
  private hudBoss!: HTMLDivElement;
  private hudPower!: HTMLDivElement;
  private hudDash!: HTMLDivElement;
  private hudCamera!: HTMLDivElement;
  private hudProgress!: HTMLDivElement;
  private toast!: HTMLDivElement;
  private crosshair!: HTMLDivElement;
  private feedbackVignette!: HTMLDivElement;

  private state: GameState = 'menu';
  private settings: RoboLabSettings = loadSettings();
  private pointerLocked = false;
  private pointerLockAvailable = true;
  private fallbackMouseCaptured = false;
  private lastPointerUnlockAt = 0;
  private levelIndex = 0;
  private health = PLAYER_MAX_HEALTH;
  private gears = 0;
  private shootCooldown = 0;
  private invulnerableTimer = 0;
  private rapidTimer = 0;
  private shieldTimer = 0;
  private overchargeShots = 0;
  private dashCooldown = 0;
  private toastTimer = 0;
  private runStats: RunStats = createRunStats(0);
  private laserContactTimer = 0;
  private blasterFlashTimer = 0;
  private hitConfirmTimer = 0;
  private score = 0;
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
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.scene.background = new THREE.Color(0x07111f);
    this.scene.fog = new THREE.Fog(0x07111f, 22, 48);
    this.cameraController.setMode(this.settings.preferredCameraMode);
    this.cameraController.setMouseSensitivity(this.settings.mouseSensitivity);
    this.audio.setEnabled(this.settings.soundOn);
  }

  mount(): void {
    const resumeRoom = Math.min(Math.max(1, this.settings.highestUnlockedRoom), LEVELS.length);
    const continueButton = resumeRoom > 1
      ? `<button class="secondary-action" type="button" data-start-level="${resumeRoom - 1}">Продовжити з кімнати ${resumeRoom}</button>`
      : '';
    const progressSummary = this.settings.bestScore > 0 || resumeRoom > 1
      ? `<div class="start-progress" aria-label="Збережений прогрес">Рекорд ${this.settings.bestScore} · відкрито кімнату ${resumeRoom}/${LEVELS.length}</div>`
      : '';
    this.root.innerHTML = `
      <main class="game-shell is-menu">
        <div class="canvas-host" aria-label="RoboLab Arena game scene"></div>
        <section class="hud" aria-live="polite">
          <div class="status-chip level-chip"></div>
          <div class="progress-strip" aria-label="Прогрес кімнат"></div>
          <div class="status-row">
            <div class="status-chip health-chip"></div>
            <div class="status-chip gears-chip"></div>
            <div class="status-chip power-chip"></div>
            <div class="status-chip dash-chip"></div>
            <div class="status-chip camera-chip"></div>
          </div>
          <div class="objective-chip"></div>
          <div class="boss-chip"></div>
          <div class="feedback-vignette" aria-hidden="true"></div>
          <div class="toast-chip" aria-live="polite"></div>
          <div class="hint-chip">${getControlsHint()}</div>
          <div class="crosshair" aria-hidden="true"></div>
        </section>
        <section class="overlay is-visible">
          <div class="panel">
            <p class="eyebrow">12 великих арен</p>
            <h1>RoboLab Arena</h1>
            <p class="intro">Допоможи роботу Бліцу пройти 12 великих лабораторних арен, збити дронів, знайти аптечки й перемогти Турбо-Вартового XL.</p>
            <div class="start-grid" aria-label="Що є в грі">
              <span>Енерго-бластер</span>
              <span>Ривок на Shift</span>
              <span>Вид від 1-ї особи</span>
              <span>Аптечки</span>
            </div>
            ${progressSummary}
            <div class="start-actions">
              <button class="primary-action" type="button" data-start-level="0">Почати гру</button>
              ${continueButton}
            </div>
          </div>
        </section>
      </main>
    `;

    this.canvasHost = this.requireElement('.canvas-host');
    this.shell = this.requireElement('.game-shell');
    this.overlay = this.requireElement('.overlay');
    this.hudLevel = this.requireElement('.level-chip');
    this.hudHealth = this.requireElement('.health-chip');
    this.hudGears = this.requireElement('.gears-chip');
    this.hudObjective = this.requireElement('.objective-chip');
    this.hudHint = this.requireElement('.hint-chip');
    this.hudBoss = this.requireElement('.boss-chip');
    this.hudPower = this.requireElement('.power-chip');
    this.hudDash = this.requireElement('.dash-chip');
    this.hudCamera = this.requireElement('.camera-chip');
    this.hudProgress = this.requireElement('.progress-strip');
    this.toast = this.requireElement('.toast-chip');
    this.crosshair = this.requireElement('.crosshair');
    this.feedbackVignette = this.requireElement('.feedback-vignette');
    this.canvasHost.appendChild(this.renderer.domElement);

    this.overlay.querySelectorAll<HTMLButtonElement>('button[data-start-level]').forEach((button) => {
      const startLevel = Number(button.dataset.startLevel ?? 0);
      button.addEventListener('click', () => this.startGame(startLevel));
    });
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerdown', this.handlePointerDown);
    document.addEventListener('pointerlockchange', this.handlePointerLockChange);
    document.addEventListener('pointerlockerror', this.handlePointerLockError);

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
    key.shadow.camera.far = 70;
    key.shadow.camera.left = -34;
    key.shadow.camera.right = 34;
    key.shadow.camera.top = 38;
    key.shadow.camera.bottom = -38;
    this.scene.add(key);

    const rim = new THREE.PointLight(palette.cyan, 35, 30, 1.5);
    rim.position.set(0, 5, -7);
    this.scene.add(rim);

    this.scene.add(this.levelRoot, this.dynamicRoot, this.player, this.playerEffectRoot, this.aimMarker, this.camera);
    this.createPlayer();
    this.createPlayerEffectRings();
    this.createAimMarker();
    this.createFirstPersonBlaster();
  }

  private createFirstPersonBlaster(): void {
    this.firstPersonBlaster.clear();
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: palette.blue,
      emissive: 0x0c3d88,
      emissiveIntensity: 0.55,
      metalness: 0.55,
      roughness: 0.24
    });
    const glowMaterial = new THREE.MeshStandardMaterial({
      color: palette.cyan,
      emissive: palette.cyan,
      emissiveIntensity: 1.5,
      roughness: 0.16
    });
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.34, 0.2), bodyMaterial);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.72, 16), glowMaterial);
    const coil = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 8, 20), glowMaterial);
    const flash = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), glowMaterial);
    grip.position.set(0.42, -0.36, -0.58);
    barrel.position.set(0.46, -0.24, -0.88);
    barrel.rotation.x = Math.PI * 0.5;
    coil.position.set(0.46, -0.24, -0.58);
    coil.rotation.x = Math.PI * 0.5;
    flash.position.set(0.46, -0.24, -1.24);
    flash.visible = false;
    this.firstPersonBlaster.add(grip, barrel, coil, flash);
    this.firstPersonBlaster.userData.flash = flash;
    this.firstPersonBlaster.userData.coil = coil;
    this.firstPersonBlaster.userData.glowMaterial = glowMaterial;
    this.firstPersonBlaster.scale.setScalar(0.72);
    this.firstPersonBlaster.visible = false;
    this.camera.add(this.firstPersonBlaster);
  }

  private async startGame(startLevel = 0): Promise<void> {
    await this.audio.unlock();
    this.state = 'playing';
    this.shell.classList.remove('is-menu');
    this.overlay.classList.remove('is-visible');
    this.health = PLAYER_MAX_HEALTH;
    this.gears = 0;
    this.score = 0;
    this.rapidTimer = 0;
    this.shieldTimer = 0;
    this.overchargeShots = 0;
    this.dashCooldown = 0;
    this.toastTimer = 0;
    this.hitConfirmTimer = 0;
    this.runStats = createRunStats(performance.now());
    const safeStartLevel = Math.min(Math.max(0, Math.floor(startLevel)), LEVELS.length - 1);
    this.levelIndex = safeStartLevel;
    this.loadLevel(safeStartLevel);
    this.requestPointerLockForFirstPerson();
  }


  private showRoomStartToast(level: LevelConfig): void {
    const brief = createRoomBrief(level);
    const stats = brief.stats.slice(0, 3).join(' · ');
    this.showToast(`${brief.title}: ${stats}. ${brief.warning}`, level.id >= 10 ? 4.2 : 3.1);
  }

  private showOverlay(title: string, text: string, button: string, action: () => void, intent: OverlayIntent = 'standard'): void {
    this.exitPointerLock();
    this.state = getOverlayState(intent, this.state);
    this.overlay.innerHTML = `
      <div class="${getOverlayPanelClass(intent)}">
        <p class="eyebrow">RoboLab Arena</p>
        <h1>${title}</h1>
        <p class="intro">${text}</p>
        <button class="primary-action" type="button">${button}</button>
      </div>
    `;
    this.overlay.querySelector('button')?.addEventListener('click', action);
    this.shell.classList.add('is-menu');
    this.overlay.classList.add('is-visible');
  }

  private showPauseOverlay(statusMessage = ''): void {
    this.exitPointerLock();
    this.fallbackMouseCaptured = false;
    this.state = 'paused';
    const level = LEVELS[this.levelIndex];
    const intel = getLevelIntel(level);
    this.overlay.innerHTML = `
      <div class="panel pause-panel">
        <p class="eyebrow">Пауза</p>
        <h1>RoboLab</h1>
        <p class="intro">Кімната ${level.id}: ${level.name}</p>
        <div class="room-intel" aria-label="План кімнати">
          <div><strong>Ціль</strong><span>${intel.objective}</span></div>
          <div><strong>Загрози</strong><span>${intel.threat}</span></div>
          <div><strong>Підтримка</strong><span>${intel.support}</span></div>
          <div><strong>Тактика</strong><span>${intel.tactic}</span></div>
        </div>
        ${statusMessage ? `<p class="pause-status" role="status">${statusMessage}</p>` : ''}
        <div class="pause-actions" aria-label="Налаштування паузи">
          <button class="primary-action" type="button" data-action="resume">Продовжити</button>
          <button class="secondary-action" type="button" data-action="restart">Перезапустити кімнату</button>
          <button class="secondary-action" type="button" data-action="sound">${this.settings.soundOn ? 'Звук: увімкнено' : 'Звук: вимкнено'}</button>
          <button class="secondary-action" type="button" data-action="camera">${this.cameraController.getHudLabel()}</button>
          <div class="sensitivity-control" aria-label="Чутливість мишки">
            <button class="secondary-action" type="button" data-action="sensitivity-down">−</button>
            <span>Чутливість ${this.settings.mouseSensitivity.toFixed(1)}x</span>
            <button class="secondary-action" type="button" data-action="sensitivity-up">+</button>
          </div>
          <button class="secondary-action" type="button" data-action="motion">Ефекти: ${this.settings.reducedMotion ? 'спокійні' : 'повні'}</button>
          <button class="secondary-action" type="button" data-action="difficulty">Складність: ${getDifficultyLabel(this.settings.difficulty)}</button>
        </div>
      </div>
    `;
    this.overlay.querySelectorAll<HTMLButtonElement>('button[data-action]').forEach((button) => {
      button.addEventListener('click', () => this.handlePauseAction(button.dataset.action ?? 'resume'));
    });
    this.shell.classList.add('is-menu');
    this.overlay.classList.add('is-visible');
  }

  private handlePauseAction(action: string): void {
    if (action === 'resume') {
      this.resumeFromPause();
      return;
    }
    if (action === 'restart') {
      this.restartCurrentLevel();
      this.resumeFromPause();
      return;
    }
    if (action === 'sound') {
      this.settings = saveSettings({ soundOn: !this.settings.soundOn });
      this.audio.setEnabled(this.settings.soundOn);
      this.showPauseOverlay();
      return;
    }
    if (action === 'camera') {
      this.toggleCameraMode();
      this.showPauseOverlay();
      return;
    }
    if (action === 'sensitivity-up' || action === 'sensitivity-down') {
      const direction: SensitivityDirection = action === 'sensitivity-up' ? 'up' : 'down';
      const next = stepMouseSensitivity(this.settings.mouseSensitivity, direction);
      this.settings = saveSettings({ mouseSensitivity: next });
      this.cameraController.setMouseSensitivity(this.settings.mouseSensitivity);
      this.showPauseOverlay();
      return;
    }
    if (action === 'motion') {
      this.settings = saveSettings({ reducedMotion: !this.settings.reducedMotion });
      this.updateHud();
      this.showPauseOverlay();
      return;
    }
    if (action === 'difficulty') {
      this.settings = saveSettings({ difficulty: nextDifficulty(this.settings.difficulty) });
      this.showPauseOverlay(describeDifficultyChange(this.settings.difficulty));
    }
  }

  private resumeFromPause(): void {
    this.state = 'playing';
    this.shell.classList.remove('is-menu');
    this.overlay.classList.remove('is-visible');
    this.updateHud();
    if (shouldRefreshFirstPersonCaptureOnResume(this.cameraController.getMode(), this.pointerLocked)) {
      this.requestPointerLockForFirstPerson();
    }
  }

  private restartCurrentLevel(): void {
    this.health = PLAYER_MAX_HEALTH;
    this.runStats = recordRestart(this.runStats);
    this.loadLevel(this.levelIndex);
  }

  private loadLevel(index: number): void {
    this.levelIndex = index;
    this.runStats = beginRoom(this.runStats, performance.now());
    this.levelCompleteTimer = 0;
    this.shootCooldown = 0;
    this.hitConfirmTimer = 0;
    this.invulnerableTimer = SPAWN_INVULNERABILITY_SECONDS;
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
    level.powerUps?.forEach((powerUp) => this.spawnPowerUp(powerUp));

    this.updateHud();
    this.showRoomStartToast(level);
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
    this.powerUps.length = 0;
    this.obstacles.length = 0;
    this.bullets.length = 0;
    this.sparks.length = 0;
    this.pulses.length = 0;
    this.exitPad = undefined;
    this.exitPadMaterial = undefined;
    this.exitLabel = undefined;
  }

  private buildRoom(level: LevelConfig): void {
    const theme = this.getTheme(level.id);
    this.scene.background = new THREE.Color(theme.fog);
    this.scene.fog = new THREE.Fog(theme.fog, 38, 86);

    const floorMaterial = new THREE.MeshStandardMaterial({
      color: theme.floor,
      metalness: 0.28,
      roughness: 0.48
    });
    const floor = new THREE.Mesh(new THREE.BoxGeometry(ROOM_HALF_WIDTH * 2, 0.4, ROOM_HALF_DEPTH * 2), floorMaterial);
    floor.position.y = -0.25;
    floor.receiveShadow = true;
    this.levelRoot.add(floor);

    const gridMaterial = new THREE.MeshStandardMaterial({
      color: theme.accent,
      emissive: theme.accent,
      emissiveIntensity: 0.92,
      metalness: 0.3,
      roughness: 0.35
    });
    for (let x = -16; x <= 16; x += 4) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, ROOM_HALF_DEPTH * 2 - 4), gridMaterial);
      strip.position.set(x, 0.02, 0);
      this.levelRoot.add(strip);
    }
    for (let z = -20; z <= 20; z += 4) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(ROOM_HALF_WIDTH * 2 - 4, 0.04, 0.06), gridMaterial);
      strip.position.set(0, 0.03, z);
      this.levelRoot.add(strip);
    }

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: theme.wall,
      metalness: 0.42,
      roughness: 0.44
    });
    this.addWall(0, -ROOM_HALF_DEPTH - 0.25, ROOM_HALF_WIDTH * 2 + 0.5, 0.5, wallMaterial);
    this.addWall(0, ROOM_HALF_DEPTH + 0.25, ROOM_HALF_WIDTH * 2 + 0.5, 0.5, wallMaterial);
    this.addWall(-ROOM_HALF_WIDTH - 0.25, 0, 0.5, ROOM_HALF_DEPTH * 2 + 0.5, wallMaterial);
    this.addWall(ROOM_HALF_WIDTH + 0.25, 0, 0.5, ROOM_HALF_DEPTH * 2 + 0.5, wallMaterial);
    level.obstacles?.forEach((obstacle) => this.spawnObstacle(obstacle, wallMaterial));
    this.addRoomDecorations(level, theme);

    const exit = this.createPad(level.exit.x, level.exit.z, palette.green, describeExitPadStatus(false).label);
    this.exitPad = exit.userData.pad as THREE.Mesh;
    this.exitPadMaterial = exit.userData.padMaterial as THREE.MeshStandardMaterial;
    this.exitLabel = exit.userData.label as THREE.Sprite;
    this.levelRoot.add(exit);

    const titlePad = this.createFloatingLabel(level.name, -11.8, 0.08, ROOM_HALF_DEPTH - 3.1);
    titlePad.scale.set(2.5, 0.62, 1);
    this.levelRoot.add(titlePad);
  }

  private addWall(x: number, z: number, width: number, depth: number, material: THREE.Material): void {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(width, 2.2, depth), material);
    wall.position.set(x, 0.9, z);
    wall.castShadow = true;
    wall.receiveShadow = true;
    this.levelRoot.add(wall);
  }

  private spawnObstacle(config: ObstacleConfig, material: THREE.Material): void {
    const height = config.height ?? 1.25;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(config.size.width, height, config.size.depth), material);
    mesh.position.set(config.position.x, height * 0.5 - 0.05, config.position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.levelRoot.add(mesh);
    this.obstacles.push({
      mesh,
      position: new THREE.Vector3(config.position.x, 0, config.position.z),
      halfWidth: config.size.width * 0.5,
      halfDepth: config.size.depth * 0.5
    });
  }

  private getTheme(levelId: number): LevelTheme {
    const themes: LevelTheme[] = [
      { floor: 0x132f46, wall: 0x28516c, accent: palette.cyan, secondary: palette.blue, fog: 0x081525 },
      { floor: 0x1d2744, wall: 0x33436f, accent: palette.yellow, secondary: palette.pink, fog: 0x10162b },
      { floor: 0x142f2b, wall: 0x2d5950, accent: palette.green, secondary: palette.cyan, fog: 0x071c18 },
      { floor: 0x2d1737, wall: 0x51245f, accent: palette.pink, secondary: palette.red, fog: 0x16071f },
      { floor: 0x30271a, wall: 0x5a4528, accent: palette.orange, secondary: palette.yellow, fog: 0x160f08 },
      { floor: 0x17363a, wall: 0x265c63, accent: palette.green, secondary: palette.cyan, fog: 0x071b1f },
      { floor: 0x171f39, wall: 0x273961, accent: palette.blue, secondary: palette.red, fog: 0x080d20 },
      { floor: 0x28183f, wall: 0x44286d, accent: palette.purple, secondary: palette.pink, fog: 0x12081f }
    ];
    return themes[(levelId - 1) % themes.length];
  }

  private addRoomDecorations(level: LevelConfig, theme: LevelTheme): void {
    const panelMaterial = new THREE.MeshStandardMaterial({
      color: theme.secondary,
      emissive: theme.secondary,
      emissiveIntensity: 0.65,
      metalness: 0.25,
      roughness: 0.28
    });
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: theme.wall,
      metalness: 0.58,
      roughness: 0.38
    });

    for (const x of [-16, -8, 8, 16]) {
      for (const z of [-20, -10, 0, 10, 20]) {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.34, 2.4, 14), metalMaterial);
        pillar.position.set(x, 1.1, z);
        pillar.castShadow = true;
        pillar.receiveShadow = true;
        const glow = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.08, 14), panelMaterial);
        glow.position.set(x, 2.35, z);
        this.levelRoot.add(pillar, glow);
      }
    }

    const consolePositions = [
      { x: -15.5, z: -21.5 },
      { x: 15.5, z: -21.5 },
      { x: -15.5, z: 21.5 },
      { x: 15.5, z: 21.5 },
      { x: -15.5, z: 0 },
      { x: 15.5, z: 0 }
    ];
    for (const position of consolePositions) {
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.75, 0.7), metalMaterial);
      base.position.set(position.x, 0.38, position.z);
      base.rotation.y = position.x < 0 ? -0.35 : 0.35;
      const screen = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.08, 0.42), panelMaterial);
      screen.position.set(position.x, 0.85, position.z);
      screen.rotation.copy(base.rotation);
      base.castShadow = true;
      screen.castShadow = true;
      this.levelRoot.add(base, screen);
    }

    if (level.id >= 5) {
      for (const x of [-3.6, 3.6]) {
        const coil = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.08, 10, 28), panelMaterial);
        coil.position.set(x, 0.78, -1.4);
        coil.rotation.x = Math.PI * 0.5;
        const core = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.4, 16), metalMaterial);
        core.position.set(x, 0.78, -1.4);
        core.rotation.z = Math.PI * 0.5;
        this.levelRoot.add(coil, core);
      }
    }

    if (level.id >= 7) {
      for (const z of [16, 11, 6, 1, -4, -9, -14]) {
        const warning = new THREE.Mesh(new THREE.BoxGeometry(12, 0.05, 0.08), panelMaterial);
        warning.position.set(0, 0.08, z + 0.55);
        this.levelRoot.add(warning);
      }
    }
  }

  private createPlayer(): void {
    this.player.clear();
    this.playerAnimationParts.length = 0;
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: palette.blue,
      emissive: 0x0c3d88,
      emissiveIntensity: 0.5,
      metalness: 0.55,
      roughness: 0.22
    });
    const faceMaterial = new THREE.MeshStandardMaterial({
      color: palette.cyan,
      emissive: palette.cyan,
      emissiveIntensity: 1.2,
      metalness: 0.1,
      roughness: 0.2
    });
    const darkMaterial = new THREE.MeshStandardMaterial({
      color: 0x10223d,
      emissive: 0x06152a,
      emissiveIntensity: 0.25,
      metalness: 0.45,
      roughness: 0.34
    });
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.75, 6, 16), bodyMaterial);
    body.position.y = 0.85;
    body.castShadow = true;
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.42, 0.08), faceMaterial);
    chest.position.set(0, 0.92, -0.35);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.68, 0.78), bodyMaterial);
    head.position.y = 1.65;
    head.castShadow = true;
    const face = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.28, 0.04), faceMaterial);
    face.position.set(0, 1.67, -0.39);
    const eyeA = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), darkMaterial);
    const eyeB = eyeA.clone();
    eyeA.position.set(-0.16, 1.69, -0.43);
    eyeB.position.set(0.16, 1.69, -0.43);
    const frontLight = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.38, 18), faceMaterial);
    frontLight.position.set(0, 1.18, -0.58);
    frontLight.rotation.x = -Math.PI * 0.5;
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 10), faceMaterial);
    antenna.position.y = 2.18;
    const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), faceMaterial);
    antennaTip.position.y = 2.45;
    const blaster = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 0.86, 14), faceMaterial);
    blaster.position.set(0.64, 1.2, -0.42);
    blaster.rotation.x = Math.PI * 0.5;
    blaster.castShadow = true;
    const shoulderA = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), darkMaterial);
    const shoulderB = shoulderA.clone();
    shoulderA.position.set(-0.54, 1.16, -0.05);
    shoulderB.position.set(0.54, 1.16, -0.05);
    const armA = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.45, 4, 10), darkMaterial);
    const armB = armA.clone();
    armA.position.set(-0.66, 0.9, -0.04);
    armB.position.set(0.66, 0.9, -0.04);
    armA.rotation.z = 0.22;
    armB.rotation.z = -0.22;
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.72, 0.22), darkMaterial);
    backpack.position.set(0, 0.92, 0.46);
    const shieldShellMaterial = new THREE.MeshStandardMaterial({
      color: palette.cyan,
      emissive: palette.cyan,
      emissiveIntensity: 0.65,
      transparent: true,
      opacity: 0.2,
      roughness: 0.12
    });
    const shieldShell = new THREE.Mesh(new THREE.SphereGeometry(0.95, 24, 14), shieldShellMaterial);
    shieldShell.position.y = 1.05;
    shieldShell.visible = false;
    const footA = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.18, 0.46), bodyMaterial);
    const footB = footA.clone();
    footA.position.set(-0.25, 0.14, -0.04);
    footB.position.set(0.25, 0.14, -0.04);
    this.player.add(body, chest, head, face, eyeA, eyeB, frontLight, antenna, antennaTip, blaster, shoulderA, shoulderB, armA, armB, backpack, footA, footB, shieldShell);
    this.player.userData.shieldShell = shieldShell;
    this.player.scale.setScalar(1.18);
    this.playerAnimationParts.push(head, antennaTip, armA, armB, footA, footB);
  }

  private createPlayerEffectRings(): void {
    this.playerEffectRoot.clear();
    const shieldTheme = getPowerEffectTheme('shield');
    const rapidTheme = getPowerEffectTheme('rapid');
    const overchargeTheme = getPowerEffectTheme('overcharge');

    const shieldMaterial = this.createEffectMaterial(shieldTheme.color, 0.34, shieldTheme.emissiveIntensity);
    const rapidMaterial = this.createEffectMaterial(rapidTheme.color, 0.42, rapidTheme.emissiveIntensity);
    const overchargeMaterial = this.createEffectMaterial(overchargeTheme.color, 0.5, overchargeTheme.emissiveIntensity);

    const shieldRingA = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.025, 8, 48), shieldMaterial);
    const shieldRingB = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.025, 8, 48), shieldMaterial);
    shieldRingA.position.y = 1.05;
    shieldRingB.position.y = 1.05;
    shieldRingA.rotation.x = Math.PI * 0.5;
    shieldRingB.rotation.z = Math.PI * 0.5;

    const rapidRing = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.032, 8, 44), rapidMaterial);
    const rapidArcA = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), rapidMaterial);
    const rapidArcB = rapidArcA.clone();
    rapidRing.position.y = 0.18;
    rapidRing.rotation.x = Math.PI * 0.5;
    rapidArcA.position.set(0.78, 0.3, 0);
    rapidArcB.position.set(-0.78, 0.3, 0);

    const overchargeOrbit = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.03, 8, 44), overchargeMaterial);
    const overchargeCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.16), overchargeMaterial);
    overchargeOrbit.position.y = 1.25;
    overchargeOrbit.rotation.x = Math.PI * 0.62;
    overchargeCore.position.set(0.92, 1.25, 0);

    this.playerEffectRoot.add(shieldRingA, shieldRingB, rapidRing, rapidArcA, rapidArcB, overchargeOrbit, overchargeCore);
    this.playerEffectRoot.userData.shield = [shieldRingA, shieldRingB];
    this.playerEffectRoot.userData.rapid = [rapidRing, rapidArcA, rapidArcB];
    this.playerEffectRoot.userData.overcharge = [overchargeOrbit, overchargeCore];
  }

  private createEffectMaterial(color: number, opacity: number, emissiveIntensity: number): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity,
      transparent: true,
      opacity,
      roughness: 0.16
    });
  }

  private createAimMarker(): void {
    this.aimMarker.clear();
    const material = new THREE.MeshStandardMaterial({
      color: palette.cyan,
      emissive: palette.cyan,
      emissiveIntensity: 1.1,
      transparent: true,
      opacity: 0.72,
      roughness: 0.18
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.025, 8, 24), material);
    ring.rotation.x = Math.PI * 0.5;
    const lineA = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.025, 0.025), material);
    const lineB = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 0.74), material);
    this.aimMarker.add(ring, lineA, lineB);
    this.aimMarker.position.set(0, 0.08, -1);
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
    const { health, radius } = getEnemyStats(config.kind);

    const material = new THREE.MeshStandardMaterial({
      color: config.kind === 'boss' ? palette.purple : config.kind === 'shieldBot' ? palette.cyan : palette.pink,
      emissive: config.kind === 'boss' ? 0x2a0f63 : config.kind === 'shieldBot' ? 0x0a4f63 : 0x611138,
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
      const rotorMaterial = new THREE.MeshStandardMaterial({
        color: palette.cyan,
        emissive: palette.cyan,
        emissiveIntensity: 0.9,
        metalness: 0.35,
        roughness: 0.22
      });
      const rotorA = new THREE.Group();
      const rotorB = new THREE.Group();
      for (const rotor of [rotorA, rotorB]) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.035, 8, 24), rotorMaterial);
        ring.rotation.x = Math.PI * 0.5;
        const bladeA = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.025, 0.08), rotorMaterial);
        const bladeB = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.025, 0.56), rotorMaterial);
        rotor.add(ring, bladeA, bladeB);
        rotor.position.y = 0.03;
      }
      rotorA.position.x = -0.68;
      rotorB.position.x = 0.68;
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.4, 14), material);
      tail.position.set(0, 0, 0.5);
      tail.rotation.x = Math.PI * 0.5;
      group.add(body, eye, rotorA, rotorB, tail);
      group.userData.rotors = [rotorA, rotorB];
      group.position.set(base.x, 1.35, base.z);
    } else if (config.kind === 'turret') {
      const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.75, 0.5, 20), material);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 0.75), material);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 1.05, 16), eyeMaterial);
      const shield = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.045, 8, 28), material);
      baseMesh.position.y = 0.25;
      head.position.y = 0.8;
      barrel.position.set(0, 0.8, -0.72);
      barrel.rotation.x = Math.PI * 0.5;
      shield.position.set(0, 0.8, -0.2);
      shield.rotation.x = Math.PI * 0.5;
      group.add(baseMesh, head, barrel, shield);
      group.userData.pulse = shield;
      group.position.copy(base);
    } else if (config.kind === 'shieldBot') {
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.46, 0.78, 6, 18), material);
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.18, 0.06), eyeMaterial);
      const domeMaterial = new THREE.MeshStandardMaterial({
        color: palette.cyan,
        emissive: palette.cyan,
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 0.23,
        roughness: 0.18
      });
      const dome = new THREE.Mesh(new THREE.SphereGeometry(1.25, 28, 14), domeMaterial);
      body.position.y = 0.95;
      visor.position.set(0, 1.2, -0.43);
      dome.position.y = 0.95;
      group.add(body, visor, dome);
      group.userData.dome = dome;
      group.position.copy(base);
    } else if (config.kind === 'boss') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 1.7), material);
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 16), eyeMaterial);
      const armA = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.2, 0.42), material);
      const armB = armA.clone();
      const crown = new THREE.Mesh(new THREE.TorusGeometry(1.28, 0.08, 10, 36), eyeMaterial);
      const shoulderA = new THREE.Mesh(new THREE.SphereGeometry(0.38, 18, 12), material);
      const shoulderB = shoulderA.clone();
      const legA = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.6, 0.48), material);
      const legB = legA.clone();
      body.position.y = 1.4;
      core.position.set(0, 1.5, -0.88);
      armA.position.set(-1.45, 1.2, 0);
      armB.position.set(1.45, 1.2, 0);
      shoulderA.position.set(-1.1, 2.1, -0.05);
      shoulderB.position.set(1.1, 2.1, -0.05);
      legA.position.set(-0.55, 0.3, 0);
      legB.position.set(0.55, 0.3, 0);
      crown.position.set(0, 2.65, 0);
      crown.rotation.x = Math.PI * 0.5;
      group.add(body, core, armA, armB, shoulderA, shoulderB, legA, legB, crown);
      group.userData.core = core;
      group.userData.crown = crown;
      group.position.copy(base);
    } else {
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.55, 5, 14), material);
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.05), eyeMaterial);
      body.rotation.z = Math.PI * 0.5;
      const legs: THREE.Mesh[] = [];
      for (let i = 0; i < 6; i += 1) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.62), material);
        leg.position.set(i < 3 ? -0.38 : 0.38, 0.3, -0.25 + (i % 3) * 0.25);
        leg.rotation.z = i < 3 ? 0.45 : -0.45;
        legs.push(leg);
      }
      body.position.y = 0.55;
      eye.position.set(0, 0.62, -0.4);
      group.add(body, eye, ...legs);
      group.userData.legs = legs;
      group.position.copy(base);
    }

    if (config.kind !== 'beetle' && config.kind !== 'shieldBot') {
      const warningMaterial = new THREE.MeshStandardMaterial({
        color: palette.red,
        emissive: palette.red,
        emissiveIntensity: 1.3,
        transparent: true,
        opacity: 0.65,
        roughness: 0.25
      });
      const warning = new THREE.Mesh(new THREE.TorusGeometry(config.kind === 'boss' ? 2.15 : 0.92, 0.035, 8, 32), warningMaterial);
      warning.rotation.x = Math.PI * 0.5;
      warning.position.y = config.kind === 'drone' ? -1.28 : 0.05;
      warning.visible = false;
      group.add(warning);
      group.userData.warning = warning;
    }

    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    this.dynamicRoot.add(group);
    this.enemies.push({ group, kind: config.kind, material, base, health, maxHealth: health, radius, shootTimer: ENEMY_INITIAL_SHOOT_DELAY, alive: true, phase: 1, hitTimer: 0 });
  }

  private spawnDoor(config: DoorConfig): void {
    const group = new THREE.Group();
    const doorWidth = 7.2;
    const material = new THREE.MeshStandardMaterial({
      color: palette.cyan,
      emissive: palette.blue,
      emissiveIntensity: 1.1,
      transparent: true,
      opacity: 0.78,
      metalness: 0.05,
      roughness: 0.18
    });
    const panel = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, 2.5, 0.34), material);
    panel.position.y = 1.25;
    const label = this.createFloatingLabel(describeDoorLabel(false), 0, 1.35, 0);
    label.scale.set(3.2, 0.8, 1);
    group.add(panel, label);
    group.position.set(config.position.x, 0, config.position.z);
    this.dynamicRoot.add(group);
    this.doors.push({
      id: config.id,
      group,
      material,
      label,
      position: new THREE.Vector3(config.position.x, 0, config.position.z),
      halfWidth: doorWidth * 0.5,
      halfDepth: 0.28,
      open: false
    });
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
      opensDoorIds: config.opensDoorIds ?? [config.opensDoorId],
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
    const footprint = getLaserHazardFootprint(config);
    const warningMaterial = new THREE.MeshStandardMaterial({
      color: palette.orange,
      emissive: palette.red,
      emissiveIntensity: 0.75,
      transparent: true,
      opacity: 0.32,
      roughness: 0.5
    });
    const warningLane = new THREE.Mesh(new THREE.BoxGeometry(footprint.width, 0.025, footprint.depth), warningMaterial);
    warningLane.position.y = 0.045;
    const postA = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 1.2, 14), material);
    const postB = postA.clone();
    if (config.axis === 'x') {
      postA.position.set(-config.length * 0.5, 0.55, 0);
      postB.position.set(config.length * 0.5, 0.55, 0);
    } else {
      postA.position.set(0, 0.55, -config.length * 0.5);
      postB.position.set(0, 0.55, config.length * 0.5);
    }
    group.add(warningLane, beam, postA, postB);
    group.position.set(config.position.x, 0, config.position.z);
    this.dynamicRoot.add(group);
    this.lasers.push({ group, material, config, basePosition: new THREE.Vector3(config.position.x, 0, config.position.z), active: true });
  }

  private spawnPowerUp(config: PowerUpConfig): void {
    const colors: Record<PowerUpKind, number> = {
      repair: palette.green,
      rapid: palette.yellow,
      shield: palette.cyan,
      overcharge: palette.orange
    };
    const color = colors[config.kind];
    const material = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 1.15,
      metalness: 0.2,
      roughness: 0.22
    });
    const group = new THREE.Group();
    if (config.kind === 'repair') {
      const caseMaterial = new THREE.MeshStandardMaterial({
        color: 0xf4fbff,
        emissive: 0x173f31,
        emissiveIntensity: 0.35,
        metalness: 0.2,
        roughness: 0.28
      });
      const crossMaterial = new THREE.MeshStandardMaterial({
        color: palette.green,
        emissive: palette.green,
        emissiveIntensity: 1.25,
        metalness: 0.15,
        roughness: 0.2
      });
      const medkit = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.46, 0.42), caseMaterial);
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.035, 8, 18), crossMaterial);
      const crossA = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.08, 0.045), crossMaterial);
      const crossB = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 0.045), crossMaterial);
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.035, 8, 28), crossMaterial);
      handle.position.y = 0.32;
      handle.rotation.x = Math.PI * 0.5;
      crossA.position.set(0, 0.02, -0.24);
      crossB.position.set(0, 0.02, -0.25);
      halo.rotation.x = Math.PI * 0.5;
      group.add(medkit, handle, crossA, crossB, halo);
      group.userData.pulse = halo;
    } else if (config.kind === 'overcharge') {
      const bolt = new THREE.Mesh(new THREE.OctahedronGeometry(0.38), material);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.045, 8, 28), material);
      const spark = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.5, 5), material);
      ring.rotation.x = Math.PI * 0.5;
      spark.position.y = 0.44;
      group.add(bolt, ring, spark);
    } else {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.07, 10, 28), material);
      const coreGeometry = config.kind === 'rapid' ? new THREE.OctahedronGeometry(0.32) : new THREE.SphereGeometry(0.28, 18, 12);
      const core = new THREE.Mesh(coreGeometry, material);
      ring.rotation.x = Math.PI * 0.5;
      group.add(ring, core);
    }
    group.position.set(config.position.x, 0.72, config.position.z);
    this.dynamicRoot.add(group);
    this.powerUps.push({
      group,
      kind: config.kind,
      position: new THREE.Vector3(config.position.x, 0.72, config.position.z),
      collected: false
    });
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
    group.userData.pad = pad;
    group.userData.padMaterial = material;
    group.userData.label = sign;
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
    sprite.userData.text = text;
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
    this.rapidTimer = Math.max(0, this.rapidTimer - delta);
    this.shieldTimer = Math.max(0, this.shieldTimer - delta);
    this.dashCooldown = Math.max(0, this.dashCooldown - delta);
    this.toastTimer = Math.max(0, this.toastTimer - delta);
    this.laserContactTimer = Math.max(0, this.laserContactTimer - delta);
    this.blasterFlashTimer = Math.max(0, this.blasterFlashTimer - delta);
    this.hitConfirmTimer = Math.max(0, this.hitConfirmTimer - delta);
    this.updateAimFromPointer();
    this.updateAimMarker(delta);
    this.updateFirstPersonBlaster(delta);
    this.updatePlayer(delta);
    this.updatePlayerAnimation();
    this.updatePlayerEffectRings(delta);
    this.updateEnemies(delta);
    this.updateBullets(delta);
    this.updateTargets(delta);
    this.updateCollectibles(delta);
    this.updatePowerUps(delta);
    this.updateButtons();
    this.updateDoors(delta);
    this.updateLasers(delta);
    this.updateSparks(delta);
    this.updatePulses(delta);
    this.updateCamera(delta);
    this.checkExit(delta);
    this.updateHud();
  }

  private updatePlayer(delta: number): void {
    const movementInput = new THREE.Vector3();
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) movementInput.z -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) movementInput.z += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) movementInput.x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) movementInput.x += 1;
    const movementDirection = this.cameraController.getMovementDirection(movementInput);
    if (movementDirection.lengthSq() > 0) {
      this.lastMoveDirection.copy(movementDirection);
      this.movePlayer(movementDirection.clone().multiplyScalar(PLAYER_SPEED * delta));
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

    this.player.position.copy(this.playerPosition);
    const aimDirection = this.aimPoint.clone().sub(this.playerPosition);
    aimDirection.y = 0;
    const facingDirection = movementDirection.lengthSq() > 0.01 ? movementDirection : aimDirection;
    if (facingDirection.lengthSq() > 0.01) {
      this.player.rotation.y = robotYawForDirection(facingDirection.x, facingDirection.z);
    }
  }

  private updatePlayerAnimation(): void {
    const moving =
      this.keys.has('KeyW') ||
      this.keys.has('ArrowUp') ||
      this.keys.has('KeyS') ||
      this.keys.has('ArrowDown') ||
      this.keys.has('KeyA') ||
      this.keys.has('ArrowLeft') ||
      this.keys.has('KeyD') ||
      this.keys.has('ArrowRight');
    const bob = Math.sin(this.elapsed * (moving ? 11 : 3)) * (moving ? 0.045 : 0.015);
    this.player.position.y = this.playerPosition.y + bob;

    const [, antennaTip, armA, armB, footA, footB] = this.playerAnimationParts;
    if (antennaTip) {
      antennaTip.scale.setScalar(1 + Math.sin(this.elapsed * 5) * 0.08);
    }
    if (armA && armB) {
      armA.rotation.x = Math.sin(this.elapsed * 9) * (moving ? 0.42 : 0.08);
      armB.rotation.x = -armA.rotation.x;
    }
    if (footA && footB) {
      footA.rotation.x = Math.sin(this.elapsed * 11) * (moving ? 0.2 : 0.03);
      footB.rotation.x = -footA.rotation.x;
    }
    const shieldShell = this.player.userData.shieldShell as THREE.Object3D | undefined;
    if (shieldShell) {
      shieldShell.visible = this.shieldTimer > 0;
      shieldShell.scale.setScalar(1 + Math.sin(this.elapsed * 8) * 0.035);
    }
  }

  private updatePlayerEffectRings(delta: number): void {
    this.playerEffectRoot.position.copy(this.playerPosition);
    const shieldObjects = (this.playerEffectRoot.userData.shield ?? []) as THREE.Object3D[];
    const rapidObjects = (this.playerEffectRoot.userData.rapid ?? []) as THREE.Object3D[];
    const overchargeObjects = (this.playerEffectRoot.userData.overcharge ?? []) as THREE.Object3D[];
    const shieldVisible = this.shieldTimer > 0 || this.invulnerableTimer > 0;
    const rapidVisible = this.rapidTimer > 0;
    const overchargeVisible = this.overchargeShots > 0;

    shieldObjects.forEach((object, index) => {
      const aura = describePowerAuraState(shieldVisible, index === 0 ? 1.9 : -1.35, this.elapsed, index, this.settings.reducedMotion);
      object.visible = aura.visible;
      object.rotation.y += delta * aura.rotationSpeed;
      object.scale.setScalar(aura.scale);
    });
    rapidObjects.forEach((object, index) => {
      const aura = describePowerAuraState(rapidVisible, 4.8 + index, this.elapsed, index, this.settings.reducedMotion);
      object.visible = aura.visible;
      object.rotation.y += delta * aura.rotationSpeed;
      object.scale.setScalar(aura.scale);
    });
    overchargeObjects.forEach((object, index) => {
      const aura = describePowerAuraState(overchargeVisible, 2.2 + index, this.elapsed, index, this.settings.reducedMotion);
      object.visible = aura.visible;
      object.rotation.y += delta * aura.rotationSpeed;
      object.scale.setScalar(aura.scale);
    });
  }

  private movePlayer(deltaMove: THREE.Vector3): void {
    const steps = Math.max(1, Math.ceil(deltaMove.length() / 0.35));
    const step = deltaMove.clone().multiplyScalar(1 / steps);

    for (let i = 0; i < steps; i += 1) {
      this.playerPosition.add(step);
      this.playerPosition.x = THREE.MathUtils.clamp(this.playerPosition.x, -ROOM_HALF_WIDTH + PLAYER_RADIUS, ROOM_HALF_WIDTH - PLAYER_RADIUS);
      this.playerPosition.z = THREE.MathUtils.clamp(this.playerPosition.z, -ROOM_HALF_DEPTH + PLAYER_RADIUS, ROOM_HALF_DEPTH - PLAYER_RADIUS);
      this.resolveSolidCollisions(this.playerPosition);
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
      const enemyPacing = getEnemyPacingMultiplier(this.settings.difficulty);
      enemy.shootTimer -= delta * enemyPacing;
      enemy.hitTimer = Math.max(0, enemy.hitTimer - delta);
      const hitFeedback = describeEnemyHitFeedback(enemy.hitTimer, this.settings.reducedMotion);
      enemy.material.emissiveIntensity = hitFeedback.emissiveIntensity;
      enemy.group.scale.setScalar(hitFeedback.scale);
      const warning = enemy.group.userData.warning as THREE.Object3D | undefined;
      if (warning) {
        warning.visible = enemy.shootTimer < 0.5;
        const pulse = 1 + Math.sin(this.elapsed * 20) * 0.12;
        warning.scale.setScalar(warning.visible ? pulse : 1);
      }

      if (enemy.kind === 'drone') {
        enemy.group.position.x = enemy.base.x + Math.sin(this.elapsed * 1.4 + enemy.base.x) * 0.7;
        enemy.group.position.y = 1.35 + Math.sin(this.elapsed * 3 + enemy.base.z) * 0.22;
        for (const rotor of (enemy.group.userData.rotors ?? []) as THREE.Object3D[]) {
          rotor.rotation.y += delta * 20;
        }
        if (enemy.shootTimer <= 0 && distance < 12) {
          this.fireEnemyBullet(enemy.group.position, toPlayer.normalize(), 12);
          enemy.shootTimer = 2.35;
        }
      } else if (enemy.kind === 'turret') {
        const pulse = enemy.group.userData.pulse as THREE.Object3D | undefined;
        if (pulse) {
          pulse.scale.setScalar(1 + Math.sin(this.elapsed * 4) * 0.06);
        }
        if (enemy.shootTimer <= 0 && distance < 13) {
          this.fireEnemyBullet(enemy.group.position.clone().add(new THREE.Vector3(0, 0.9, 0)), toPlayer.normalize(), 16);
          enemy.shootTimer = 1.8;
        }
      } else if (enemy.kind === 'shieldBot') {
        const dome = enemy.group.userData.dome as THREE.Object3D | undefined;
        if (dome) {
          dome.scale.setScalar(1 + Math.sin(this.elapsed * 4.5) * 0.08);
        }
        if (distance > 6) {
          enemy.group.position.add(toPlayer.normalize().multiplyScalar(delta * 1.25 * enemyPacing));
          this.resolveObstacleCollisions(enemy.group.position, 0.7);
        }
      } else if (enemy.kind === 'boss') {
        enemy.group.position.y = Math.sin(this.elapsed * 1.8) * 0.08;
        const core = enemy.group.userData.core as THREE.Object3D | undefined;
        const crown = enemy.group.userData.crown as THREE.Object3D | undefined;
        const phase = getBossPhase(enemy.health, enemy.maxHealth);
        if (phase.index !== enemy.phase) {
          enemy.phase = phase.index;
          this.audio.play('phase');
          const burst = describeBossPhaseTransitionBurst(phase.index, this.settings.reducedMotion);
          const burstPosition = enemy.group.position.clone().add(new THREE.Vector3(0, 1.05, 0));
          for (let ring = 0; ring < burst.ringCount; ring += 1) {
            this.addPulseRing(burstPosition, burst.color, burst.maxScale * (1 + ring * 0.14));
          }
          this.addSpark(burstPosition, burst.color, burst.sparkScale);
          this.showToast(phase.index === 2 ? 'Бос пришвидшує атаку!' : 'Фінальна фаза боса!', 1.5);
        }
        const phaseVisual = describeBossPhaseVisual(phase.index, this.elapsed, this.settings.reducedMotion);
        if (core) {
          core.scale.setScalar(phaseVisual.coreScale);
          const coreMaterial = (core as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
          if (coreMaterial) {
            coreMaterial.color.setHex(phaseVisual.coreColor);
            coreMaterial.emissive.setHex(phaseVisual.coreColor);
            coreMaterial.emissiveIntensity = phaseVisual.emissiveIntensity;
          }
        }
        if (crown) {
          const crownMaterial = (crown as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
          if (crownMaterial) {
            crownMaterial.color.setHex(phaseVisual.coreColor);
            crownMaterial.emissive.setHex(phaseVisual.coreColor);
            crownMaterial.emissiveIntensity = phaseVisual.emissiveIntensity;
          }
          crown.rotation.z += delta * phaseVisual.crownRotationSpeed;
        }
        if (enemy.shootTimer <= 0) {
          const baseAngle = Math.atan2(toPlayer.x, toPlayer.z);
          const center = (phase.bulletCount - 1) * 0.5;
          for (let index = 0; index < phase.bulletCount; index += 1) {
            const offset = (index - center) * phase.spread;
            const direction = new THREE.Vector3(Math.sin(baseAngle + offset), 0, Math.cos(baseAngle + offset));
            this.fireEnemyBullet(enemy.group.position.clone().add(new THREE.Vector3(0, 1.4, 0)), direction, phase.damage);
          }
          enemy.shootTimer = phase.cooldown;
        }
      } else {
        const legs = (enemy.group.userData.legs ?? []) as THREE.Object3D[];
        legs.forEach((leg, index) => {
          leg.rotation.x = Math.sin(this.elapsed * 9 + index) * 0.28;
        });
        if (distance > 1.1) {
          enemy.group.position.add(toPlayer.normalize().multiplyScalar(delta * 2.2 * enemyPacing));
          this.resolveObstacleCollisions(enemy.group.position, 0.55);
        } else {
          this.damagePlayer(BEETLE_CONTACT_DAMAGE);
        }
      }
    }
  }

  private resolveSolidCollisions(position: THREE.Vector3): void {
    this.resolveObstacleCollisions(position, PLAYER_RADIUS);
    for (const door of this.doors) {
      if (door.open) continue;
      this.resolveBoxCollision(position, door.position, door.halfWidth, door.halfDepth, PLAYER_RADIUS);
    }
  }

  private resolveObstacleCollisions(position: THREE.Vector3, radius = PLAYER_RADIUS): void {
    for (const obstacle of this.obstacles) {
      this.resolveBoxCollision(position, obstacle.position, obstacle.halfWidth, obstacle.halfDepth, radius);
    }
  }

  private resolveBoxCollision(position: THREE.Vector3, center: THREE.Vector3, halfWidth: number, halfDepth: number, radius: number): void {
    const dx = position.x - center.x;
    const dz = position.z - center.z;
    const overlapX = halfWidth + radius - Math.abs(dx);
    const overlapZ = halfDepth + radius - Math.abs(dz);

    if (overlapX <= 0 || overlapZ <= 0) return;

    if (overlapX < overlapZ) {
      position.x += dx >= 0 ? overlapX : -overlapX;
    } else {
      position.z += dz >= 0 ? overlapZ : -overlapZ;
    }
  }

  private pointHitsObstacle(position: THREE.Vector3, radius = 0.18): boolean {
    return pointHitsSolid(position, this.obstacles, this.doors, radius);
  }

  private isEnemyProtected(enemy: Enemy): boolean {
    if (enemy.kind === 'shieldBot') return false;
    return this.enemies.some((candidate) => {
      return candidate.alive && candidate.kind === 'shieldBot' && this.distance2D(candidate.group.position, enemy.group.position) < 5.8;
    });
  }

  private updateBullets(delta: number): void {
    for (let i = this.bullets.length - 1; i >= 0; i -= 1) {
      const bullet = this.bullets[i];
      bullet.life -= delta;
      bullet.mesh.position.addScaledVector(bullet.velocity, delta);
      const outOfBounds = Math.abs(bullet.mesh.position.x) > ROOM_HALF_WIDTH + 2 || Math.abs(bullet.mesh.position.z) > ROOM_HALF_DEPTH + 2;
      if (bullet.life <= 0 || outOfBounds || this.pointHitsObstacle(bullet.mesh.position)) {
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
          if (this.isEnemyProtected(enemy) && bullet.damage < 70) {
            this.addSpark(bullet.mesh.position, palette.cyan);
            this.showToast('Щит-бот блокує постріл!', 0.9);
            this.removeBullet(i);
            continue;
          }
          enemy.health -= bullet.damage;
          enemy.hitTimer = 0.16;
          this.hitConfirmTimer = 0.16;
          this.audio.play(enemy.kind === 'boss' ? 'boss' : 'hit');
          this.addSpark(bullet.mesh.position, enemy.kind === 'boss' ? palette.purple : palette.pink);
          this.removeBullet(i);
          if (enemy.health <= 0) {
            enemy.alive = false;
            enemy.group.visible = false;
            this.score += enemy.kind === 'boss' ? 1000 : 180;
            this.showToast(enemy.kind === 'boss' ? 'Боса вимкнено!' : 'Робота вимкнено!', 1.4);
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
        this.hitConfirmTimer = 0.16;
        this.applyTargetStatus(target);
        this.score += 90;
        this.showToast('Мішень збито!', 1.2);
        return true;
      }
    }
    return false;
  }

  private updateTargets(delta: number): void {
    for (const target of this.targets) {
      target.group.rotation.y += delta * 2.2;
      target.group.rotation.x = Math.sin(this.elapsed * 2 + target.position.x) * 0.16;
      this.applyTargetStatus(target);
    }
  }

  private applyTargetStatus(target: Target): void {
    const status = describeTargetStatus(target.hit, this.elapsed);
    target.material.color.setHex(status.color);
    target.material.emissive.setHex(status.color);
    target.material.emissiveIntensity = status.emissiveIntensity;
    target.group.scale.setScalar(status.scale);
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
        this.score += 50;
        this.audio.play('pickup');
        this.addSpark(collectible.position.clone().add(new THREE.Vector3(0, 0.7, 0)), palette.yellow);
      }
    }
  }

  private updatePowerUps(delta: number): void {
    for (const powerUp of this.powerUps) {
      if (powerUp.collected) continue;
      powerUp.group.rotation.y += delta * 2.8;
      powerUp.group.rotation.x = Math.sin(this.elapsed * 2.6 + powerUp.position.x) * 0.22;
      powerUp.group.position.y = 0.72 + Math.sin(this.elapsed * 3.4 + powerUp.position.z) * 0.14;
      const pulse = powerUp.group.userData.pulse as THREE.Object3D | undefined;
      if (pulse) {
        pulse.scale.setScalar(1 + Math.sin(this.elapsed * 5) * 0.12);
      }

      if (this.distance2D(this.playerPosition, powerUp.position) < 0.8) {
        if (powerUp.kind === 'repair' && this.health >= PLAYER_MAX_HEALTH) {
          this.showToast('Аптечка зачекає: енергія повна.', 1.3);
          continue;
        }
        const effectTheme = getPowerEffectTheme(powerUp.kind);
        powerUp.collected = true;
        powerUp.group.visible = false;
        this.score += 120;
        if (powerUp.kind === 'repair') {
          this.health = Math.min(PLAYER_MAX_HEALTH, this.health + REPAIR_AMOUNT);
          this.showToast('Аптечка: енергія відновлена!', 1.8);
        } else if (powerUp.kind === 'rapid') {
          this.rapidTimer = 8;
          this.showToast('Швидкий бластер активний!', 1.8);
        } else if (powerUp.kind === 'shield') {
          this.shieldTimer = 9;
          this.showToast('Щит увімкнено!', 1.8);
        } else {
          this.overchargeShots += 1;
          this.showToast('Заряджений постріл готовий!', 1.8);
        }
        const burst = describePickupBurst(powerUp.kind, this.settings.reducedMotion);
        const effectPosition = powerUp.position.clone().add(new THREE.Vector3(0, 0.8, 0));
        this.addSpark(effectPosition, effectTheme.color, effectTheme.pulseScale * burst.sparkScale);
        for (let ring = 0; ring < burst.ringCount; ring += 1) {
          const ringPosition = effectPosition.clone();
          ringPosition.y += ring * 0.12;
          this.addPulseRing(ringPosition, effectTheme.color, effectTheme.pulseScale * burst.ringScale * (1 + ring * 0.12));
        }
        this.audio.play('pickup');
      }
    }
  }

  private updateButtons(): void {
    for (const button of this.buttons) {
      if (!button.active && this.distance2D(this.playerPosition, button.position) < 0.95) {
        button.active = true;
        button.group.scale.y = 0.82;
        this.score += 100;
        this.showToast('Кнопку активовано!', 1.4);
        this.addSpark(button.position.clone().add(new THREE.Vector3(0, 0.45, 0)), palette.green);
      }
    }
  }

  private updateDoors(delta: number): void {
    let openedThisFrame = 0;
    for (const door of this.doors) {
      const relatedButtons = this.buttons.filter((button) => button.opensDoorIds.includes(door.id));
      const shouldOpen = relatedButtons.length > 0 && relatedButtons.every((button) => button.active);
      if (shouldOpen && !door.open) {
        door.open = true;
        openedThisFrame += 1;
        this.addSpark(door.position.clone().add(new THREE.Vector3(0, 1.2, 0)), palette.green, 1.05);
      }
      const visual = describeDoorVisualStatus(door.open);
      const label = describeDoorLabel(door.open);
      if (door.label.userData.text !== label) {
        const nextLabel = this.createFloatingLabel(label, 0, 1.35, 0);
        nextLabel.position.copy(door.label.position);
        nextLabel.scale.copy(door.label.scale);
        door.group.add(nextLabel);
        door.group.remove(door.label);
        const currentMaterial = door.label.material;
        currentMaterial.map?.dispose();
        currentMaterial.dispose();
        door.label = nextLabel;
      }
      door.material.opacity = visual.opacity;
      door.material.emissiveIntensity = visual.emissiveIntensity;
      door.group.position.y = THREE.MathUtils.lerp(door.group.position.y, visual.targetY, delta * 4);
    }
    if (shouldPlayDoorOpenAudio(openedThisFrame)) {
      this.audio.play('door');
      this.showToast(describeDoorOpenedToast(openedThisFrame), 1.7);
    }
  }

  private updateLasers(delta: number): void {
    for (const laser of this.lasers) {
      if (laser.config.sweep) {
        const offset = Math.sin(this.elapsed * laser.config.sweep.speed + laser.config.phase) * laser.config.sweep.distance;
        if (laser.config.axis === 'x') {
          laser.group.position.z = laser.basePosition.z + offset;
        } else {
          laser.group.position.x = laser.basePosition.x + offset;
        }
      }
      laser.active = Math.sin(this.elapsed * 2.4 + laser.config.phase) > -0.25;
      const laserVisibility = describeLaserVisibility(laser.active);
      laser.group.visible = laserVisibility.groupVisible;
      const [warningLane, beam, postA, postB] = laser.group.children as THREE.Object3D[];
      beam.visible = laserVisibility.beamVisible;
      postA.visible = laserVisibility.postVisible;
      postB.visible = laserVisibility.postVisible;
      laser.material.opacity = laser.active ? 0.85 : 0.18;
      const warningOffset = getLaserWarningLaneOffset(
        laser.config,
        { x: laser.basePosition.x, z: laser.basePosition.z },
        { x: laser.group.position.x, z: laser.group.position.z }
      );
      warningLane.position.x = warningOffset.x;
      warningLane.position.z = warningOffset.z;
      const warningMaterial = (warningLane as THREE.Mesh | undefined)?.material as THREE.MeshStandardMaterial | undefined;
      if (warningMaterial) {
        warningMaterial.opacity = laserVisibility.warningOpacity;
      }
      if (!laser.active || this.playerPosition.y > 0.45) continue;

      const nearBeam = isPointInLaserDamage(
        { x: this.playerPosition.x, z: this.playerPosition.z },
        { x: laser.group.position.x, z: laser.group.position.z },
        laser.config
      );
      if (nearBeam) {
        if (shouldPlayLaserContactAudio(this.laserContactTimer)) {
          this.audio.play('laser');
        }
        this.damagePlayer(LASER_DAMAGE_PER_SECOND * delta, { continuous: true });
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

  private updatePulses(delta: number): void {
    for (let i = this.pulses.length - 1; i >= 0; i -= 1) {
      const pulse = this.pulses[i];
      pulse.life -= delta;
      const progress = 1 - pulse.life / pulse.maxLife;
      pulse.mesh.scale.setScalar(1 + progress * pulse.maxScale);
      pulse.material.opacity = Math.max(0, (pulse.life / pulse.maxLife) * 0.58);
      if (pulse.life <= 0) {
        this.dynamicRoot.remove(pulse.mesh);
        this.pulses.splice(i, 1);
      }
    }
  }

  private updateAimMarker(delta: number): void {
    this.aimMarker.visible = this.state === 'playing' && this.cameraController.getMode() === 'thirdPerson';
    this.aimMarker.position.lerp(new THREE.Vector3(this.aimPoint.x, 0.09, this.aimPoint.z), 1 - Math.pow(0.004, delta));
    this.aimMarker.rotation.y += delta * 2.4;
  }

  private updateFirstPersonBlaster(delta: number): void {
    const flash = this.firstPersonBlaster.userData.flash as THREE.Object3D | undefined;
    const coil = this.firstPersonBlaster.userData.coil as THREE.Object3D | undefined;
    const glowMaterial = this.firstPersonBlaster.userData.glowMaterial as THREE.MeshStandardMaterial | undefined;
    const state = describeFirstPersonBlasterState({
      flashTimer: this.blasterFlashTimer,
      rapidTimer: this.rapidTimer,
      overchargeShots: this.overchargeShots,
      elapsed: this.elapsed,
      reducedMotion: this.settings.reducedMotion
    });
    if (glowMaterial) {
      glowMaterial.color.setHex(state.color);
      glowMaterial.emissive.setHex(state.color);
      glowMaterial.emissiveIntensity = state.emissiveIntensity;
    }
    if (flash) {
      flash.visible = state.flashVisible;
      flash.scale.setScalar(state.flashScale);
    }
    if (coil) {
      coil.rotation.z += delta * state.coilRotationSpeed;
      coil.scale.setScalar(state.coilScale);
    }
    this.firstPersonBlaster.position.z = THREE.MathUtils.lerp(this.firstPersonBlaster.position.z, state.recoilZ, 1 - Math.pow(0.001, delta));
    this.firstPersonBlaster.rotation.x = THREE.MathUtils.lerp(this.firstPersonBlaster.rotation.x, state.recoilPitch, 1 - Math.pow(0.001, delta));
  }

  private updateCamera(delta: number): void {
    const aimDirection = this.aimPoint.clone().sub(this.playerPosition);
    this.cameraController.update(delta, this.playerPosition, aimDirection.lengthSq() > 0.001 ? aimDirection : this.lastMoveDirection);
    const isFirstPersonPlaying = this.state === 'playing' && this.cameraController.getMode() === 'firstPerson';
    this.player.visible = !isFirstPersonPlaying;
    this.firstPersonBlaster.visible = isFirstPersonPlaying;
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
    this.settings = saveSettings({
      bestScore: Math.max(this.settings.bestScore, this.score),
      highestUnlockedRoom: Math.max(this.settings.highestUnlockedRoom, Math.min(next + 1, LEVELS.length))
    });
    const now = performance.now();
    this.runStats = completeRoom(this.runStats);
    if (next >= LEVELS.length) {
      this.audio.play('victory');
      this.showOverlay('Перемога!', `${formatVictoryOverlayIntro({ completedRooms: this.runStats.completedRooms, totalRooms: LEVELS.length, gears: this.gears, score: this.score })} ${formatVictorySummary(this.runStats, now)}. Лабораторія відкрита!`, 'Грати ще раз', () => this.startGame(), 'victory');
      return;
    }

    this.showOverlay('Кімнату пройдено!', `Двері до наступного випробування відкриті. ${formatRoomSummary(this.runStats, now)}. Готовий рухатись далі?`, 'Наступна кімната', () => {
      this.state = 'playing';
      this.shell.classList.remove('is-menu');
      this.overlay.classList.remove('is-visible');
      this.loadLevel(next);
    });
  }

  private isObjectiveComplete(): boolean {
    const level = LEVELS[this.levelIndex];
    if (level.objective === 'targets') return this.targets.every((target) => target.hit);
    if (level.objective === 'enemies') return this.enemies.every((enemy) => !enemy.alive);
    if (level.objective === 'buttons') return this.buttons.every((button) => button.active);
    if (level.objective === 'boss') return this.enemies.filter((enemy) => enemy.kind === 'boss').every((enemy) => !enemy.alive);
    return this.distance2D(this.playerPosition, new THREE.Vector3(level.exit.x, 0, level.exit.z)) < 2.2;
  }

  private objectiveProgressText(): string {
    const level = LEVELS[this.levelIndex];
    if (level.objective === 'targets') {
      return describeObjectiveProgress({ objective: level.objective, done: this.targets.filter((target) => target.hit).length, total: this.targets.length });
    }
    if (level.objective === 'enemies') {
      return describeObjectiveProgress({ objective: level.objective, done: this.enemies.filter((enemy) => !enemy.alive).length, total: this.enemies.length });
    }
    if (level.objective === 'buttons') {
      return describeObjectiveProgress({ objective: level.objective, done: this.buttons.filter((button) => button.active).length, total: this.buttons.length });
    }
    if (level.objective === 'boss') {
      const boss = this.enemies.find((enemy) => enemy.kind === 'boss');
      const percent = boss ? Math.max(0, Math.ceil((boss.health / boss.maxHealth) * 100)) : 0;
      return describeObjectiveProgress({ objective: level.objective, done: percent, total: 100 });
    }
    return describeObjectiveProgress({ objective: level.objective, done: 0, total: 0 });
  }

  private shoot(): void {
    if (this.shootCooldown > 0 || this.state !== 'playing') return;
    const thirdPersonDirection = this.aimPoint.clone().sub(this.playerPosition);
    const direction = this.cameraController.getAimDirection(thirdPersonDirection, this.lastMoveDirection);
    const overcharged = this.overchargeShots > 0;
    const projectileTheme = getPlayerProjectileTheme({
      rapidTimer: this.rapidTimer,
      overchargeShots: this.overchargeShots
    });
    const material = new THREE.MeshStandardMaterial({
      color: projectileTheme.color,
      emissive: projectileTheme.color,
      emissiveIntensity: projectileTheme.emissiveIntensity,
      roughness: 0.18
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(projectileTheme.radius, 16, 12), material);
    mesh.position.copy(this.playerPosition).add(new THREE.Vector3(direction.x * 0.7, 1.1, direction.z * 0.7));
    this.dynamicRoot.add(mesh);
    if (overcharged) {
      this.overchargeShots -= 1;
    }
    this.bullets.push({
      mesh,
      velocity: direction.clone().multiplyScalar(BULLET_SPEED),
      owner: 'player',
      damage: overcharged ? PLAYER_OVERCHARGE_DAMAGE : this.rapidTimer > 0 ? PLAYER_RAPID_DAMAGE : PLAYER_BASE_DAMAGE,
      life: 1.6
    });
    this.blasterFlashTimer = 0.12;
    this.audio.play('shot');
    this.shootCooldown = this.rapidTimer > 0 ? 0.09 : 0.18;
  }

  private dash(): void {
    if (this.state !== 'playing' || this.dashCooldown > 0) return;
    const direction = this.lastMoveDirection.clone();
    if (direction.lengthSq() < 0.01) {
      direction.set(0, 0, -1);
    }
    direction.normalize();
    this.movePlayer(direction.multiplyScalar(3.1));
    this.player.position.copy(this.playerPosition);
    this.player.rotation.y = robotYawForDirection(direction.x, direction.z);
    this.dashCooldown = 2.6;
    this.addSpark(this.playerPosition.clone().add(new THREE.Vector3(0, 0.45, 0)), palette.cyan, 1.25);
    this.audio.play('dash');
    this.showToast('Ривок заряджається!', 1.25);
  }

  private showToast(message: string, seconds = 1.8): void {
    this.toast.textContent = message;
    this.toastTimer = seconds;
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

  private damagePlayer(amount: number, options: DamageOptions = {}): void {
    const continuous = options.continuous ?? false;
    if (!canApplyDamage(this.invulnerableTimer, continuous)) return;
    const finalAmount = effectiveDamage(amount, this.shieldTimer > 0, this.settings.difficulty);
    this.health = Math.max(0, this.health - finalAmount);
    if (this.shieldTimer > 0 && !continuous) {
      const shieldTheme = getPowerEffectTheme('shield');
      const shieldHitPosition = this.playerPosition.clone().add(new THREE.Vector3(0, 1.05, 0));
      this.addSpark(shieldHitPosition, shieldTheme.color, 0.85);
      this.addPulseRing(shieldHitPosition, shieldTheme.color, 0.75);
    }
    if (!continuous) {
      this.invulnerableTimer = 0.45;
    } else {
      this.laserContactTimer = 0.18;
    }
    if (this.health <= 0) {
      this.addSpark(this.playerPosition.clone().add(new THREE.Vector3(0, 1, 0)), palette.red, 1.6);
      this.restartCurrentLevel();
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
    const motionScale = this.settings.reducedMotion ? 0.65 : 1;
    const life = this.settings.reducedMotion ? 0.24 : 0.42;
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.28 * scale * motionScale, 18, 12), material);
    mesh.position.copy(position);
    this.dynamicRoot.add(mesh);
    this.sparks.push({ mesh, material, life, maxLife: life });
  }

  private addPulseRing(position: THREE.Vector3, color: number, scale = 1): void {
    const material = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 1.8,
      transparent: true,
      opacity: 0.58,
      roughness: 0.2
    });
    const motionScale = this.settings.reducedMotion ? 0.72 : 1;
    const life = this.settings.reducedMotion ? 0.32 : 0.56;
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(0.52 * scale * motionScale, 0.035, 8, 48), material);
    mesh.position.copy(position);
    mesh.rotation.x = Math.PI * 0.5;
    this.dynamicRoot.add(mesh);
    this.pulses.push({ mesh, material, life, maxLife: life, maxScale: this.settings.reducedMotion ? 1.55 : 2.8 });
  }

  private updateHud(): void {
    const level = LEVELS[this.levelIndex];
    const objectiveDone = this.isObjectiveComplete();
    this.hudLevel.textContent = `Кімната ${level.id}/${LEVELS.length}: ${level.name}`;
    const healthHud = describeHealthHud({
      health: this.health,
      maxHealth: PLAYER_MAX_HEALTH,
      shieldTimer: this.shieldTimer,
      difficulty: this.settings.difficulty
    });
    this.hudHealth.textContent = healthHud.text;
    this.hudHealth.className = healthHud.classes.join(' ');
    this.hudGears.textContent = `Очки ${this.score} | Шестерні ${this.gears}`;
    const objectiveHud = describeObjectiveHud(objectiveDone);
    this.hudObjective.textContent = objectiveHud.text || formatObjectiveHint(this.objectiveProgressText(), level.tip);
    this.hudObjective.className = objectiveHud.classes.join(' ');
    this.updateExitPadStatus(objectiveDone);
    this.hudHint.classList.toggle('is-alert', this.invulnerableTimer > 0 || this.laserContactTimer > 0);
    const feedback = describePlayerFeedback({
      health: this.health,
      maxHealth: PLAYER_MAX_HEALTH,
      invulnerableTimer: this.invulnerableTimer,
      laserContactTimer: this.laserContactTimer,
      shieldTimer: this.shieldTimer
    });
    this.feedbackVignette.className = feedback.classes.join(' ');
    this.feedbackVignette.style.setProperty('--feedback-opacity', String(feedback.opacity));
    const powerHud = describePowerHud({
      rapidTimer: this.rapidTimer,
      shieldTimer: this.shieldTimer,
      overchargeShots: this.overchargeShots
    });
    this.hudPower.textContent = powerHud.text;
    this.hudPower.className = powerHud.classes.join(' ');
    this.hudDash.textContent = this.dashCooldown <= 0 ? 'Ривок готовий' : `Ривок ${this.dashCooldown.toFixed(1)}с`;
    this.hudDash.classList.toggle('is-ready', this.dashCooldown <= 0);
    this.hudCamera.textContent = this.cameraController.getHudLabel();
    const isFirstPerson = this.cameraController.getMode() === 'firstPerson';
    this.shell.classList.toggle('is-first-person', isFirstPerson);
    this.shell.classList.toggle('is-reduced-motion', this.settings.reducedMotion);
    this.shell.classList.toggle('is-pointer-locked', this.pointerLocked);
    this.shell.classList.toggle('is-mouse-captured', this.isFirstPersonMouseCaptured());
    this.crosshair.className = getCrosshairClasses({
      visible: this.state === 'playing' && isFirstPerson,
      flashTimer: this.blasterFlashTimer,
      hitTimer: this.hitConfirmTimer,
      rapidTimer: this.rapidTimer,
      overchargeShots: this.overchargeShots
    }).join(' ');
    this.hudProgress.innerHTML = LEVELS.map((item, index) => {
      const state = index < this.levelIndex ? 'is-done' : index === this.levelIndex ? 'is-current' : '';
      return `<span class="progress-dot ${state}" title="Кімната ${item.id}: ${item.name}">${item.id}</span>`;
    }).join('');
    this.toast.classList.toggle('is-visible', this.toastTimer > 0);

    const boss = this.enemies.find((enemy) => enemy.kind === 'boss' && enemy.alive);
    this.hudBoss.classList.remove('is-phase-1', 'is-phase-2', 'is-phase-3');
    if (boss) {
      const status = describeBossStatus(boss.health, boss.maxHealth);
      this.hudBoss.textContent = status.text;
      this.hudBoss.classList.add('is-visible', status.cssClass);
    } else {
      this.hudBoss.classList.remove('is-visible');
    }
  }

  private updateExitPadStatus(objectiveDone: boolean): void {
    if (!this.exitPad || !this.exitPadMaterial) return;
    const status = describeExitPadStatus(objectiveDone, this.elapsed);
    this.exitPadMaterial.color.setHex(status.color);
    this.exitPadMaterial.emissive.setHex(status.color);
    this.exitPadMaterial.emissiveIntensity = status.emissiveIntensity;
    this.exitPad.scale.setScalar(status.scale);
    const currentLabel = this.exitLabel;
    if (currentLabel && currentLabel.userData.text !== status.label) {
      const nextLabel = this.createFloatingLabel(status.label, 0, 0.38, 0);
      nextLabel.position.copy(currentLabel.position);
      nextLabel.scale.copy(currentLabel.scale);
      const parent = currentLabel.parent;
      const currentMaterial = currentLabel.material;
      const currentMap = currentMaterial.map;
      parent?.add(nextLabel);
      parent?.remove(currentLabel);
      currentMap?.dispose();
      currentMaterial.dispose();
      this.exitLabel = nextLabel;
    }
  }

  private updateAimFromPointer(): void {
    if (this.cameraController.getMode() === 'firstPerson') return;
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
    if (this.cameraController.getMode() === 'firstPerson') {
      if (!shouldUseFirstPersonMouseLook(this.state, this.cameraController.getMode(), this.pointerLocked, this.fallbackMouseCaptured)) return;
      this.cameraController.applyFirstPersonLookDelta(event.movementX, event.movementY);
      return;
    }
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  };

  private handlePointerDown = (event: PointerEvent): void => {
    if (event.button === 0 && this.state === 'playing' && this.cameraController.getMode() === 'firstPerson' && !this.isFirstPersonMouseCaptured()) {
      this.requestPointerLockForFirstPerson();
      return;
    }
    if (event.button === 0 && this.state === 'playing') {
      this.shoot();
    }
  };

  private toggleCameraMode(): void {
    this.cameraController.toggleMode();
    if (this.cameraController.getMode() === 'firstPerson') {
      const aimDirection = this.aimPoint.clone().sub(this.playerPosition);
      this.cameraController.resetFirstPersonLook(aimDirection.lengthSq() > 0.001 ? aimDirection : this.lastMoveDirection);
      this.requestPointerLockForFirstPerson();
    } else {
      this.fallbackMouseCaptured = false;
      this.exitPointerLock();
    }
    this.settings = saveSettings({ preferredCameraMode: this.cameraController.getMode() });
    this.showToast(this.cameraController.getMode() === 'firstPerson' ? 'Вид від першої особи.' : 'Тактичний вид зверху.', 1.15);
    this.updateHud();
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    this.keys.add(event.code);
    if (
      event.code === 'Escape' &&
      this.state === 'playing' &&
      this.cameraController.getMode() === 'firstPerson' &&
      (this.isFirstPersonMouseCaptured() || performance.now() - this.lastPointerUnlockAt < 350)
    ) {
      event.preventDefault();
      this.exitPointerLock();
      this.fallbackMouseCaptured = false;
      this.shell.classList.remove('is-mouse-captured');
      this.showToast(getPointerLockToast('released'), 1.4);
      return;
    }
    if (event.code === 'Escape' && this.state === 'playing') {
      this.showPauseOverlay();
    }
    if (this.handleDevShortcut(event)) {
      return;
    }
    if (event.code === 'KeyC' && this.state === 'playing' && !event.repeat) {
      this.toggleCameraMode();
    }
    if (event.code === 'KeyM' && !event.repeat) {
      this.settings = saveSettings({ soundOn: !this.settings.soundOn });
      this.audio.setEnabled(this.settings.soundOn);
      this.showToast(this.settings.soundOn ? 'Звук увімкнено.' : 'Звук вимкнено.', 1.15);
    }
    if ((event.code === 'ShiftLeft' || event.code === 'ShiftRight') && !event.repeat) {
      this.dash();
    }
    if (event.code === 'KeyR' && this.state === 'playing') {
      this.restartCurrentLevel();
    }
  };

  private handleDevShortcut(event: KeyboardEvent): boolean {
    if (!import.meta.env.DEV || this.state !== 'playing' || event.repeat) return false;
    if (getDevEffectTarget(event.code) === 'all') {
      this.rapidTimer = 8;
      this.shieldTimer = 9;
      this.overchargeShots = Math.max(this.overchargeShots, 1);
      const effectPosition = this.playerPosition.clone().add(new THREE.Vector3(0, 1, 0));
      this.addPulseRing(effectPosition, getPowerEffectTheme('shield').color, 1.4);
      this.showToast('QA: усі ефекти активні.', 1.4);
      this.updateHud();
      return true;
    }
    if (getDevCompletionTarget(event.code) === 'complete-room') {
      this.completeLevel();
      return true;
    }
    const targetLevel = getDevLevelTarget(event.code, this.levelIndex + 1, LEVELS.length);
    if (targetLevel === undefined) return false;

    this.health = PLAYER_MAX_HEALTH;
    this.loadLevel(targetLevel - 1);
    return true;
  }

  private handleKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.code);
  };

  private requestPointerLockForFirstPerson(): void {
    if (this.state !== 'playing' || this.cameraController.getMode() !== 'firstPerson' || this.pointerLocked) return;
    if (!this.pointerLockAvailable || !this.renderer.domElement.requestPointerLock) {
      this.handlePointerLockUnavailable();
      return;
    }
    if (!shouldRequestPointerLock(this.state, this.cameraController.getMode(), this.pointerLocked, this.pointerLockAvailable)) return;
    try {
      const result = this.renderer.domElement.requestPointerLock();
      if (result && typeof result.catch === 'function') {
        result.catch(() => this.handlePointerLockUnavailable());
      }
    } catch {
      this.handlePointerLockUnavailable();
    }
  }

  private exitPointerLock(): void {
    if (document.pointerLockElement === this.renderer.domElement) {
      document.exitPointerLock?.();
    }
  }

  private isFirstPersonMouseCaptured(): boolean {
    return this.pointerLocked || this.fallbackMouseCaptured;
  }

  private handlePointerLockChange = (): void => {
    const wasPointerLocked = this.pointerLocked;
    this.pointerLocked = document.pointerLockElement === this.renderer.domElement;
    if (this.pointerLocked) {
      this.fallbackMouseCaptured = false;
    }
    if (wasPointerLocked && !this.pointerLocked) {
      this.lastPointerUnlockAt = performance.now();
      if (this.state === 'playing' && this.cameraController.getMode() === 'firstPerson') {
        this.showToast(getPointerLockToast('returnAim'), 1.4);
      }
    }
    this.shell.classList.toggle('is-pointer-locked', this.pointerLocked);
    this.shell.classList.toggle('is-mouse-captured', this.isFirstPersonMouseCaptured());
  };

  private handlePointerLockError = (): void => {
    this.handlePointerLockUnavailable();
  };

  private handlePointerLockUnavailable(): void {
    this.pointerLockAvailable = false;
    if (this.state === 'playing' && this.cameraController.getMode() === 'firstPerson') {
      this.fallbackMouseCaptured = true;
      this.shell.classList.add('is-mouse-captured');
      this.showToast(getPointerLockToast('captured'), 1.4);
    }
  }

  destroy(): void {
    window.cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerdown', this.handlePointerDown);
    document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
    document.removeEventListener('pointerlockerror', this.handlePointerLockError);
    this.renderer.dispose();
  }
}
