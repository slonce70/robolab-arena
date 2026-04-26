import { describe, expect, it } from 'vitest';
import { BUTTON_ACTIVE_COLOR, BUTTON_IDLE_COLOR, describeButtonVisualStatus } from './buttonStatus';

describe('button visual status', () => {
  it('keeps inactive buttons red with a visible search halo', () => {
    expect(describeButtonVisualStatus(false, 0)).toMatchObject({
      color: BUTTON_IDLE_COLOR,
      haloOpacity: 0.34,
      scaleY: 1
    });
  });

  it('turns active buttons green and pressed down', () => {
    expect(describeButtonVisualStatus(true, 1)).toEqual({
      color: BUTTON_ACTIVE_COLOR,
      emissiveIntensity: 1.35,
      haloOpacity: 0.16,
      scaleY: 0.82
    });
  });
});
