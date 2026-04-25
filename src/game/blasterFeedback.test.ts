import { describe, expect, it } from 'vitest';
import { describeFirstPersonBlasterState } from './blasterFeedback';

describe('first-person blaster feedback', () => {
  it('keeps the idle blaster calm and cyan', () => {
    const state = describeFirstPersonBlasterState({
      flashTimer: 0,
      rapidTimer: 0,
      overchargeShots: 0,
      elapsed: 0
    });

    expect(state.color).toBe(0x54f1ff);
    expect(state.emissiveIntensity).toBe(1.5);
    expect(state.flashVisible).toBe(false);
    expect(state.flashScale).toBe(1);
    expect(state.coilRotationSpeed).toBe(7);
    expect(state.coilScale).toBe(1);
    expect(state.recoilZ).toBe(0);
    expect(state.recoilPitch).toBe(0);
  });

  it('makes rapid fire read faster without using overcharge recoil', () => {
    const state = describeFirstPersonBlasterState({
      flashTimer: 0.06,
      rapidTimer: 2,
      overchargeShots: 0,
      elapsed: 0.25
    });

    expect(state.color).toBe(0xffd166);
    expect(state.emissiveIntensity).toBe(2.1);
    expect(state.flashVisible).toBe(true);
    expect(state.flashScale).toBeCloseTo(1.6);
    expect(state.coilRotationSpeed).toBe(16);
    expect(state.coilScale).toBe(1.14);
    expect(state.recoilZ).toBeCloseTo(0.04);
    expect(state.recoilPitch).toBeCloseTo(-0.04);
  });

  it('makes overcharge shots visibly hotter and larger than rapid fire', () => {
    const state = describeFirstPersonBlasterState({
      flashTimer: 0.06,
      rapidTimer: 0,
      overchargeShots: 1,
      elapsed: Math.PI / 20
    });

    expect(state.color).toBe(0xff9f43);
    expect(state.emissiveIntensity).toBe(2.6);
    expect(state.flashScale).toBeCloseTo(1.84);
    expect(state.coilRotationSpeed).toBe(7);
    expect(state.coilScale).toBeCloseTo(1.32);
    expect(state.recoilZ).toBeCloseTo(0.04);
    expect(state.recoilPitch).toBeCloseTo(-0.04);
  });
});
