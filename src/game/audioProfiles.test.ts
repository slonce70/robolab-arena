import { describe, expect, it } from 'vitest';
import { getSoundProfile } from './audioProfiles';

describe('audio profiles', () => {
  it('keeps victory more celebratory than one beep', () => {
    const victory = getSoundProfile('victory');

    expect(victory).toHaveLength(3);
    expect(victory[2].frequency).toBeGreaterThan(victory[0].frequency);
  });

  it('makes door feedback distinct from laser warning', () => {
    expect(getSoundProfile('door').length).toBeGreaterThan(getSoundProfile('laser').length);
    expect(getSoundProfile('laser')[0]).toMatchObject({ type: 'sawtooth' });
  });

  it('keeps boss sound low and heavier than player hit feedback', () => {
    expect(getSoundProfile('boss')[0].frequency).toBeLessThan(getSoundProfile('hit')[0].frequency);
    expect(getSoundProfile('boss')[0].peakGain).toBeGreaterThan(getSoundProfile('hit')[0].peakGain);
  });
});
