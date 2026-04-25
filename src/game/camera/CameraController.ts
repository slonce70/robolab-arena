import * as THREE from 'three';

export type CameraMode = 'thirdPerson' | 'firstPerson';

const THIRD_PERSON_OFFSET = new THREE.Vector3(0, 18, 15.5);
const THIRD_PERSON_LOOK_OFFSET = new THREE.Vector3(0, 0.7, -2.6);
const FIRST_PERSON_HEAD_OFFSET = new THREE.Vector3(0, 1.72, -0.08);

export class CameraController {
  private mode: CameraMode = 'thirdPerson';
  private readonly camera: THREE.PerspectiveCamera;
  private snapNextUpdate = true;

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
  }

  toggleMode(): CameraMode {
    this.mode = this.mode === 'thirdPerson' ? 'firstPerson' : 'thirdPerson';
    this.snapNextUpdate = true;
    return this.mode;
  }

  getHudLabel(): string {
    return this.mode === 'thirdPerson' ? 'Вид: 3-я особа' : 'Вид: 1-а особа';
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
    const normalizedFacing = facingDirection.clone();
    normalizedFacing.y = 0;
    if (normalizedFacing.lengthSq() < 0.001) {
      normalizedFacing.set(0, 0, -1);
    }
    normalizedFacing.normalize();
    const headPosition = playerPosition.clone().add(FIRST_PERSON_HEAD_OFFSET);
    if (this.snapNextUpdate) {
      this.camera.position.copy(headPosition);
      this.snapNextUpdate = false;
    } else {
      this.camera.position.lerp(headPosition, 1 - Math.pow(0.0006, delta));
    }
    this.camera.lookAt(headPosition.clone().add(normalizedFacing.multiplyScalar(8)));
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
