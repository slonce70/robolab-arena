import { describe, expect, it } from 'vitest';
import { stepMouseSensitivity } from './sensitivity';

describe('mouse sensitivity stepping', () => {
  it('moves up and down through readable preset steps', () => {
    expect(stepMouseSensitivity(1, 'up')).toBe(1.2);
    expect(stepMouseSensitivity(1, 'down')).toBe(0.8);
  });

  it('clamps instead of wrapping so pause controls are predictable', () => {
    expect(stepMouseSensitivity(2, 'up')).toBe(2);
    expect(stepMouseSensitivity(0.6, 'down')).toBe(0.6);
  });

  it('recovers from invalid values by stepping from the default', () => {
    expect(stepMouseSensitivity(Number.NaN, 'up')).toBe(1.2);
    expect(stepMouseSensitivity(Number.NaN, 'down')).toBe(0.8);
  });
});
