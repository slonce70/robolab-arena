import { describe, expect, it } from 'vitest';
import { calculateLaserWarningCharge, describeLaserVisibility } from './laserVisibility';

describe('laser warning visibility', () => {
  it('keeps the warning lane visible even while the damaging beam is inactive', () => {
    expect(describeLaserVisibility(false)).toEqual({
      groupVisible: true,
      beamVisible: false,
      postVisible: false,
      warningOpacity: 0.16,
      warningEmissiveIntensity: 0.55
    });
  });

  it('shows beam and posts together when the laser is active', () => {
    expect(describeLaserVisibility(true)).toEqual({
      groupVisible: true,
      beamVisible: true,
      postVisible: true,
      warningOpacity: 0.32,
      warningEmissiveIntensity: 0.95
    });
  });

  it('ramps the floor warning lane before an inactive laser turns dangerous', () => {
    expect(calculateLaserWarningCharge(-1)).toBe(0);
    expect(calculateLaserWarningCharge(-0.625)).toBeCloseTo(0.5, 5);
    expect(calculateLaserWarningCharge(-0.25)).toBe(1);

    expect(describeLaserVisibility(false, 0.75)).toMatchObject({
      beamVisible: false,
      postVisible: false,
      warningOpacity: 0.25,
      warningEmissiveIntensity: 0.83
    });
  });
});
