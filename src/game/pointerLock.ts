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

export type PointerLockToast = 'released' | 'returnAim' | 'captured';

const POINTER_LOCK_TOASTS: Record<PointerLockToast, string> = {
  released: 'Курсор вільний. Клік по арені — повернути приціл.',
  returnAim: 'Клік по арені — повернути приціл.',
  captured: 'Приціл активний. Esc — показати курсор.'
};

export function getPointerLockToast(toast: PointerLockToast): string {
  return POINTER_LOCK_TOASTS[toast];
}
