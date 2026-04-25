import { describe, expect, it } from 'vitest';
import { getCrosshairClasses } from './weaponFeedback';

describe('weapon feedback classes', () => {
  it('keeps the crosshair hidden outside first-person play', () => {
    expect(getCrosshairClasses({ visible: false, flashTimer: 0, rapidTimer: 0, overchargeShots: 0 })).toEqual(['crosshair']);
  });

  it('marks a visible firing crosshair during first-person shots', () => {
    expect(getCrosshairClasses({ visible: true, flashTimer: 0.08, rapidTimer: 0, overchargeShots: 0 })).toEqual([
      'crosshair',
      'is-visible',
      'is-firing'
    ]);
  });

  it('surfaces rapid and overcharge weapon states visually', () => {
    expect(getCrosshairClasses({ visible: true, flashTimer: 0, rapidTimer: 3, overchargeShots: 1 })).toEqual(expect.arrayContaining([
      'is-rapid',
      'is-overcharged'
    ]));
  });
});
