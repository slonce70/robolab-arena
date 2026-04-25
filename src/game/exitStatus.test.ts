import { describe, expect, it } from 'vitest';
import { EXIT_LOCKED_COLOR, EXIT_OPEN_COLOR, describeExitPadStatus } from './exitStatus';

describe('exit pad status', () => {
  it('keeps the exit visually locked before the room objective is complete', () => {
    expect(describeExitPadStatus(false)).toMatchObject({
      color: EXIT_LOCKED_COLOR,
      emissiveIntensity: 0.48,
      scale: 0.94,
      hint: 'locked'
    });
  });

  it('turns the exit into a pulsing green beacon after the objective is complete', () => {
    const status = describeExitPadStatus(true, 1);

    expect(status.color).toBe(EXIT_OPEN_COLOR);
    expect(status.emissiveIntensity).toBeGreaterThan(1);
    expect(status.scale).toBeGreaterThan(1);
    expect(status.hint).toBe('open');
  });
});
