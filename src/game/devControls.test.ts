import { describe, expect, it } from 'vitest';
import { getDevEffectTarget, getDevLevelTarget } from './devControls';

describe('getDevLevelTarget', () => {
  it('moves between rooms with bracket shortcuts', () => {
    expect(getDevLevelTarget('BracketRight', 3, 12)).toBe(4);
    expect(getDevLevelTarget('BracketLeft', 3, 12)).toBe(2);
  });

  it('jumps to important QA rooms', () => {
    expect(getDevLevelTarget('KeyM', 1, 12)).toBe(6);
    expect(getDevLevelTarget('KeyB', 1, 12)).toBe(12);
  });

  it('exposes a visual-effects QA shortcut', () => {
    expect(getDevEffectTarget('KeyV')).toBe('all');
    expect(getDevEffectTarget('KeyC')).toBeUndefined();
  });
});
