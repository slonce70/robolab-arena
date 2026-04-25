import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { CameraController } from './CameraController';

describe('CameraController', () => {
  it('starts in third-person mode and toggles to first-person', () => {
    const camera = new THREE.PerspectiveCamera();
    const controller = new CameraController(camera);

    expect(controller.getMode()).toBe('thirdPerson');
    expect(controller.getHudLabel()).toBe('Вид: 3-я особа');

    controller.toggleMode();

    expect(controller.getMode()).toBe('firstPerson');
    expect(controller.getHudLabel()).toBe('Вид: 1-а особа');
  });

  it('aims forward from the camera in first-person mode', () => {
    const camera = new THREE.PerspectiveCamera();
    const controller = new CameraController(camera);
    controller.toggleMode();
    camera.position.set(2, 3, 4);
    camera.lookAt(new THREE.Vector3(2, 3, 0));

    const direction = controller.getAimDirection(new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0, 0));

    expect(direction.x).toBeCloseTo(0);
    expect(direction.y).toBeCloseTo(0);
    expect(direction.z).toBeLessThan(-0.99);
  });
});
