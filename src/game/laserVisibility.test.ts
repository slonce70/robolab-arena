import { describe, expect, it } from 'vitest';
import { describeLaserVisibility } from './laserVisibility';

describe('laser warning visibility', () => {
  it('keeps the warning lane visible even while the damaging beam is inactive', () => {
    expect(describeLaserVisibility(false)).toEqual({
      groupVisible: true,
      beamVisible: false,
      postVisible: false,
      warningOpacity: 0.16
    });
  });

  it('shows beam and posts together when the laser is active', () => {
    expect(describeLaserVisibility(true)).toEqual({
      groupVisible: true,
      beamVisible: true,
      postVisible: true,
      warningOpacity: 0.32
    });
  });
});
