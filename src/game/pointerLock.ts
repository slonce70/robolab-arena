import type { CameraMode } from './camera/CameraController';

export type PointerLockState = 'menu' | 'playing' | 'levelComplete' | 'finished' | 'paused';

export function shouldRequestPointerLock(state: PointerLockState, mode: CameraMode, pointerLocked: boolean, pointerLockAvailable = true): boolean {
  return pointerLockAvailable && state === 'playing' && mode === 'firstPerson' && !pointerLocked;
}

export function shouldUseFirstPersonMouseLook(
  state: PointerLockState,
  mode: CameraMode,
  pointerLocked: boolean,
  fallbackCaptured: boolean
): boolean {
  return state === 'playing' && mode === 'firstPerson' && (pointerLocked || fallbackCaptured);
}
