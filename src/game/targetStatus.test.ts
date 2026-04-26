import { describe, expect, it } from 'vitest';
import { TARGET_ACTIVE_COLOR, TARGET_HIT_COLOR, describeTargetStatus } from './targetStatus';

describe('target visual status', () => {
  it('keeps active targets yellow and full size', () => {
    expect(describeTargetStatus(false, 0)).toMatchObject({
      color: TARGET_ACTIVE_COLOR,
      scale: 1,
      beamOpacity: 0.38
    });
  });

  it('makes hit targets green and visibly smaller', () => {
    expect(describeTargetStatus(true, 4)).toEqual({
      color: TARGET_HIT_COLOR,
      emissiveIntensity: 1.35,
      scale: 0.74,
      beamOpacity: 0
    });
  });
});
