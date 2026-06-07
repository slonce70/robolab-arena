import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { CameraController } from './CameraController';

describe('CameraController', () => {
  it('starts in third-person mode and toggles to first-person', () => {
    const camera = new THREE.PerspectiveCamera();
    const controller = new CameraController(camera);

    expect(controller.getMode()).toBe('thirdPerson');
    expect(controller.getHudLabel()).toBe('Вид: від 3-ї особи');

    controller.toggleMode();

    expect(controller.getMode()).toBe('firstPerson');
    expect(controller.getHudLabel()).toBe('Вид: від 1-ї особи');
  });

  it('can restore a saved first-person camera preference', () => {
    const camera = new THREE.PerspectiveCamera();
    const controller = new CameraController(camera, 'firstPerson');

    expect(controller.getMode()).toBe('firstPerson');

    controller.setMode('thirdPerson');

    expect(controller.getMode()).toBe('thirdPerson');
    expect(controller.getHudLabel()).toBe('Вид: від 3-ї особи');
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

  it('keeps tiny first-person mouse movement from spinning the camera', () => {
    const camera = new THREE.PerspectiveCamera();
    const controller = new CameraController(camera);
    controller.toggleMode();
    controller.resetFirstPersonLook(new THREE.Vector3(0, 0, -1));

    controller.applyFirstPersonLookDelta(5, 0);
    controller.update(0.016, new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0));

    const direction = controller.getAimDirection(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, -1));

    expect(Math.abs(direction.x)).toBeLessThan(0.02);
    expect(direction.z).toBeLessThan(-0.99);
  });

  it('moves forward relative to first-person look direction', () => {
    const camera = new THREE.PerspectiveCamera();
    const controller = new CameraController(camera);
    controller.toggleMode();
    controller.resetFirstPersonLook(new THREE.Vector3(1, 0, 0));

    const movement = controller.getMovementDirection(new THREE.Vector3(0, 0, -1));

    expect(movement.x).toBeGreaterThan(0.99);
    expect(Math.abs(movement.z)).toBeLessThan(0.01);
  });

  it('keeps side movement perpendicular to first-person look direction', () => {
    const camera = new THREE.PerspectiveCamera();
    const controller = new CameraController(camera);
    controller.toggleMode();
    controller.resetFirstPersonLook(new THREE.Vector3(0, 0, -1));

    const movement = controller.getMovementDirection(new THREE.Vector3(1, 0, 0));

    expect(movement.x).toBeGreaterThan(0.99);
    expect(Math.abs(movement.z)).toBeLessThan(0.01);
  });

  it('clamps configurable mouse sensitivity for pause settings', () => {
    const camera = new THREE.PerspectiveCamera();
    const controller = new CameraController(camera);

    controller.setMouseSensitivity(9);
    expect(controller.getMouseSensitivity()).toBe(2);

    controller.setMouseSensitivity(0.1);
    expect(controller.getMouseSensitivity()).toBe(0.6);
  });

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
});
