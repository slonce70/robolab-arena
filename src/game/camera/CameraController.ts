import * as THREE from 'three';

export type CameraMode = 'thirdPerson' | 'firstPerson';

const THIRD_PERSON_OFFSET = new THREE.Vector3(0, 18, 15.5);
const THIRD_PERSON_LOOK_OFFSET = new THREE.Vector3(0, 0.7, -2.6);
const FIRST_PERSON_HEAD_OFFSET = new THREE.Vector3(0, 1.72, -0.08);
const FIRST_PERSON_MOUSE_SENSITIVITY = 0.0014;
const FIRST_PERSON_MAX_MOUSE_DELTA = 36;
const FIRST_PERSON_MAX_PITCH = 0.44;

export class CameraController {
  private mode: CameraMode = 'thirdPerson';
  private readonly camera: THREE.PerspectiveCamera;
  private snapNextUpdate = true;
  private firstPersonYaw = 0;
  private firstPersonPitch = 0;
  private firstPersonLookReady = false;
  private mouseSensitivity = 1;
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

  constructor(camera: THREE.PerspectiveCamera, initialMode: CameraMode = 'thirdPerson') {
    this.camera = camera;
    this.mode = initialMode;
  }

  getMode(): CameraMode {
    return this.mode;
  }

  setMode(mode: CameraMode): void {
    this.mode = mode;
    this.snapNextUpdate = true;
    if (mode === 'thirdPerson') {
      this.firstPersonLookReady = false;
    }
  }

  toggleMode(): CameraMode {
    this.mode = this.mode === 'thirdPerson' ? 'firstPerson' : 'thirdPerson';
    this.snapNextUpdate = true;
    if (this.mode === 'thirdPerson') {
      this.firstPersonLookReady = false;
    }
    return this.mode;
  }

  getHudLabel(): string {
    return this.mode === 'thirdPerson' ? 'Вид: від 3-ї особи' : 'Вид: від 1-ї особи';
  }

  getMouseSensitivity(): number {
    return this.mouseSensitivity;
  }

  setMouseSensitivity(value: number): void {
    this.mouseSensitivity = THREE.MathUtils.clamp(value, 0.6, 2);
  }

  update(delta: number, playerPosition: THREE.Vector3, facingDirection: THREE.Vector3): void {
    if (this.mode === 'firstPerson') {
      this.updateFirstPerson(delta, playerPosition, facingDirection);
      return;
    }
    this.updateThirdPerson(delta, playerPosition);
  }

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

  resetFirstPersonLook(direction: THREE.Vector3): void {
    const normalized = direction.clone();
    normalized.y = 0;
    if (normalized.lengthSq() < 0.001) {
      normalized.set(0, 0, -1);
    }
    normalized.normalize();
    this.firstPersonYaw = Math.atan2(normalized.x, -normalized.z);
    this.firstPersonPitch = 0;
    this.firstPersonLookReady = true;
  }

  applyFirstPersonLookDelta(deltaX: number, deltaY: number): void {
    const clampedX = THREE.MathUtils.clamp(deltaX, -FIRST_PERSON_MAX_MOUSE_DELTA, FIRST_PERSON_MAX_MOUSE_DELTA);
    const clampedY = THREE.MathUtils.clamp(deltaY, -FIRST_PERSON_MAX_MOUSE_DELTA, FIRST_PERSON_MAX_MOUSE_DELTA);
    this.firstPersonYaw += clampedX * FIRST_PERSON_MOUSE_SENSITIVITY * this.mouseSensitivity;
    this.firstPersonPitch = THREE.MathUtils.clamp(
      this.firstPersonPitch - clampedY * FIRST_PERSON_MOUSE_SENSITIVITY * this.mouseSensitivity,
      -FIRST_PERSON_MAX_PITCH,
      FIRST_PERSON_MAX_PITCH
    );
    this.firstPersonLookReady = true;
  }

  private getFirstPersonLookDirection(target = new THREE.Vector3()): THREE.Vector3 {
    const cosPitch = Math.cos(this.firstPersonPitch);
    return target.set(
      Math.sin(this.firstPersonYaw) * cosPitch,
      Math.sin(this.firstPersonPitch),
      -Math.cos(this.firstPersonYaw) * cosPitch
    ).normalize();
  }

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
}
