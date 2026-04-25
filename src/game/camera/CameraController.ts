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
    return this.mode === 'thirdPerson' ? 'Вид: 3-я особа' : 'Вид: 1-а особа';
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
    const targetPosition = playerPosition.clone().add(THIRD_PERSON_OFFSET);
    if (this.snapNextUpdate) {
      this.camera.position.copy(targetPosition);
      this.snapNextUpdate = false;
    } else {
      this.camera.position.lerp(targetPosition, 1 - Math.pow(0.001, delta));
    }
    this.camera.lookAt(playerPosition.clone().add(THIRD_PERSON_LOOK_OFFSET));
  }

  updateFirstPerson(delta: number, playerPosition: THREE.Vector3, facingDirection: THREE.Vector3): void {
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, 62, 1 - Math.pow(0.002, delta));
    this.camera.updateProjectionMatrix();
    if (!this.firstPersonLookReady) {
      this.resetFirstPersonLook(facingDirection);
    }
    const normalizedFacing = this.getFirstPersonLookDirection();
    const headPosition = playerPosition.clone().add(FIRST_PERSON_HEAD_OFFSET);
    if (this.snapNextUpdate) {
      this.camera.position.copy(headPosition);
      this.snapNextUpdate = false;
    } else {
      this.camera.position.lerp(headPosition, 1 - Math.pow(0.0006, delta));
    }
    this.camera.lookAt(headPosition.clone().add(normalizedFacing.multiplyScalar(8)));
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

  private getFirstPersonLookDirection(): THREE.Vector3 {
    const cosPitch = Math.cos(this.firstPersonPitch);
    return new THREE.Vector3(
      Math.sin(this.firstPersonYaw) * cosPitch,
      Math.sin(this.firstPersonPitch),
      -Math.cos(this.firstPersonYaw) * cosPitch
    ).normalize();
  }

  getMovementDirection(input: THREE.Vector3): THREE.Vector3 {
    const planarInput = input.clone();
    planarInput.y = 0;
    if (planarInput.lengthSq() < 0.001) {
      return new THREE.Vector3();
    }

    if (this.mode !== 'firstPerson') {
      return planarInput.normalize();
    }

    if (!this.firstPersonLookReady) {
      this.resetFirstPersonLook(new THREE.Vector3(0, 0, -1));
    }

    const forward = this.getFirstPersonLookDirection();
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3(-forward.z, 0, forward.x);
    const movement = new THREE.Vector3()
      .addScaledVector(right, planarInput.x)
      .addScaledVector(forward, -planarInput.z);

    return movement.lengthSq() > 0.001 ? movement.normalize() : movement;
  }

  getAimDirection(thirdPersonDirection: THREE.Vector3, fallbackDirection: THREE.Vector3): THREE.Vector3 {
    if (this.mode === 'firstPerson') {
      const direction = new THREE.Vector3();
      this.camera.getWorldDirection(direction);
      direction.y = 0;
      if (direction.lengthSq() > 0.001) {
        return direction.normalize();
      }
    }

    const direction = thirdPersonDirection.clone();
    direction.y = 0;
    if (direction.lengthSq() > 0.001) {
      return direction.normalize();
    }

    const fallback = fallbackDirection.clone();
    fallback.y = 0;
    if (fallback.lengthSq() > 0.001) {
      return fallback.normalize();
    }

    return new THREE.Vector3(0, 0, -1);
  }
}
