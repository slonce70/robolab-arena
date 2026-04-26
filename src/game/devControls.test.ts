import { describe, expect, it } from 'vitest';
import { getDevBossTarget, getDevCompletionTarget, getDevEffectTarget, getDevLevelTarget } from './devControls';

describe('getDevLevelTarget', () => {
  it('moves between rooms with bracket shortcuts', () => {
    expect(getDevLevelTarget('BracketRight', 3, 12)).toBe(4);
    expect(getDevLevelTarget('BracketLeft', 3, 12)).toBe(2);
  });

  it('jumps to important QA rooms without stealing player-facing shortcuts', () => {
    expect(getDevLevelTarget('Digit6', 1, 12)).toBe(6);
    expect(getDevLevelTarget('KeyB', 1, 12)).toBe(12);
    expect(getDevLevelTarget('KeyM', 1, 12)).toBeUndefined();
  });

  it('exposes a visual-effects QA shortcut', () => {
    expect(getDevEffectTarget('KeyV')).toBe('all');
    expect(getDevEffectTarget('KeyC')).toBeUndefined();
  });

  it('exposes a room-completion QA shortcut for true victory smoke tests', () => {
    expect(getDevCompletionTarget('KeyN')).toBe('complete-room');
    expect(getDevCompletionTarget('KeyC')).toBeUndefined();
  });

  it('exposes a boss phase QA shortcut without stealing player-facing controls', () => {
    expect(getDevBossTarget('KeyP')).toBe('phase-three');
    expect(getDevBossTarget('KeyM')).toBeUndefined();
  });
});
