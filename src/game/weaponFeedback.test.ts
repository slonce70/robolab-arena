import { describe, expect, it } from 'vitest';
import { getCrosshairClasses, getPlayerProjectileTheme } from './weaponFeedback';

describe('weapon feedback classes', () => {
  it('keeps the crosshair hidden outside first-person play', () => {
    expect(getCrosshairClasses({ visible: false, flashTimer: 0, hitTimer: 0, rapidTimer: 0, overchargeShots: 0 })).toEqual(['crosshair']);
  });

  it('marks a visible firing crosshair during first-person shots', () => {
    expect(getCrosshairClasses({ visible: true, flashTimer: 0.08, hitTimer: 0, rapidTimer: 0, overchargeShots: 0 })).toEqual([
      'crosshair',
      'is-visible',
      'is-firing'
    ]);
  });

  it('surfaces rapid and overcharge weapon states visually', () => {
    expect(getCrosshairClasses({ visible: true, flashTimer: 0, hitTimer: 0, rapidTimer: 3, overchargeShots: 1 })).toEqual(expect.arrayContaining([
      'is-rapid',
      'is-overcharged'
    ]));
  });

  it('adds a short hit-confirm state after successful shots', () => {
    expect(getCrosshairClasses({ visible: true, flashTimer: 0, hitTimer: 0.12, rapidTimer: 0, overchargeShots: 0 })).toContain('is-hit-confirmed');
  });
});

describe('player projectile theme', () => {
  it('uses exact base and overcharge projectile themes', () => {
    expect(getPlayerProjectileTheme({ rapidTimer: 0, overchargeShots: 0 })).toEqual({ color: 0x54f1ff, emissiveIntensity: 1.6, radius: 0.16 });
    expect(getPlayerProjectileTheme({ rapidTimer: 0, overchargeShots: 1 })).toEqual({ color: 0xff9f43, emissiveIntensity: 2.35, radius: 0.23 });
  });

  it('tints rapid shots and lets overcharge take visual precedence', () => {
    expect(getPlayerProjectileTheme({ rapidTimer: 3, overchargeShots: 0 })).toEqual({ color: 0xffd166, emissiveIntensity: 1.9, radius: 0.17 });
    expect(getPlayerProjectileTheme({ rapidTimer: 3, overchargeShots: 1 })).toEqual({ color: 0xff9f43, emissiveIntensity: 2.35, radius: 0.23 });
  });
});
