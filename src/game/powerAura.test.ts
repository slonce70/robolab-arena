import { describe, expect, it } from 'vitest';
import { describePowerAuraState } from './powerAura';

describe('power aura state', () => {
  it('hides inactive auras without accumulating rotation', () => {
    expect(describePowerAuraState(false, 4, 3)).toEqual({ visible: false, rotationSpeed: 0, scale: 1, opacityMultiplier: 0 });
  });

  it('keeps active auras visible and animated', () => {
    const state = describePowerAuraState(true, 4, 1, 0, false);

    expect(state.visible).toBe(true);
    expect(state.rotationSpeed).toBe(4);
    expect(state.scale).not.toBe(1);
    expect(state.opacityMultiplier).toBe(1);
  });

  it('respects calmer effects by reducing rotation speed', () => {
    expect(describePowerAuraState(true, 4, 1, 0, true).rotationSpeed).toBeLessThan(4);
  });

  it('makes expiring timed powers visibly brighter without increasing motion', () => {
    const steady = describePowerAuraState(true, 4, 1, 0, false, false);
    const expiring = describePowerAuraState(true, 4, 1, 0, false, true);

    expect(expiring.opacityMultiplier).toBeGreaterThan(steady.opacityMultiplier);
    expect(expiring.rotationSpeed).toBe(steady.rotationSpeed);
  });

  it('keeps expiring reduced-motion auras brighter but calm', () => {
    const steadyReduced = describePowerAuraState(true, 4, 1, 0, true, false);
    const expiringReduced = describePowerAuraState(true, 4, 1, 0, true, true);

    expect(expiringReduced.opacityMultiplier).toBeGreaterThan(steadyReduced.opacityMultiplier);
    expect(expiringReduced.rotationSpeed).toBe(steadyReduced.rotationSpeed);
    expect(expiringReduced.rotationSpeed).toBeLessThan(4);
  });
});
