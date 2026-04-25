import { describe, expect, it } from 'vitest';
import { describePowerAuraState } from './powerAura';

describe('power aura state', () => {
  it('hides inactive auras without accumulating rotation', () => {
    expect(describePowerAuraState(false, 4, 3)).toEqual({ visible: false, rotationSpeed: 0, scale: 1 });
  });

  it('keeps active auras visible and animated', () => {
    const state = describePowerAuraState(true, 4, 1, 0, false);

    expect(state.visible).toBe(true);
    expect(state.rotationSpeed).toBe(4);
    expect(state.scale).not.toBe(1);
  });

  it('respects calmer effects by reducing rotation speed', () => {
    expect(describePowerAuraState(true, 4, 1, 0, true).rotationSpeed).toBeLessThan(4);
  });
});
