import { describe, expect, it } from 'vitest';
import { getPointerLockToast, shouldRequestPointerLock, shouldUseFirstPersonMouseLook } from './pointerLock';

describe('pointer lock rules', () => {
  it('requests pointer lock only while playing in first-person', () => {
    expect(shouldRequestPointerLock('playing', 'firstPerson', false)).toBe(true);
    expect(shouldRequestPointerLock('playing', 'thirdPerson', false)).toBe(false);
    expect(shouldRequestPointerLock('paused', 'firstPerson', false)).toBe(false);
    expect(shouldRequestPointerLock('playing', 'firstPerson', true)).toBe(false);
    expect(shouldRequestPointerLock('playing', 'firstPerson', false, false)).toBe(false);
  });

  it('uses mouse movement for look only when the pointer is captured', () => {
    expect(shouldUseFirstPersonMouseLook('playing', 'firstPerson', true, false)).toBe(true);
    expect(shouldUseFirstPersonMouseLook('playing', 'firstPerson', false, true)).toBe(true);
    expect(shouldUseFirstPersonMouseLook('playing', 'firstPerson', false, false)).toBe(false);
    expect(shouldUseFirstPersonMouseLook('playing', 'thirdPerson', true, true)).toBe(false);
  });

  it('keeps first-person capture toasts polished and truthful', () => {
    expect(getPointerLockToast('released')).toBe('Курсор вільний. Клік по арені — повернути приціл.');
    expect(getPointerLockToast('returnAim')).toBe('Клік по арені — повернути приціл.');
    expect(getPointerLockToast('captured')).toBe('Приціл активний. Esc — показати курсор.');
  });
});
