import { describe, expect, it } from 'vitest';
import { describePickupBurst } from './transientEffects';

describe('pickup burst effects', () => {
  it('gives overcharge the most expressive pickup burst', () => {
    const repair = describePickupBurst('repair', false);
    const overcharge = describePickupBurst('overcharge', false);

    expect(overcharge.sparkScale).toBeGreaterThan(repair.sparkScale);
    expect(overcharge.ringCount).toBeGreaterThan(repair.ringCount);
  });

  it('keeps reduced-motion bursts calmer but still visible', () => {
    const full = describePickupBurst('shield', false);
    const reduced = describePickupBurst('shield', true);

    expect(reduced.sparkScale).toBeLessThan(full.sparkScale);
    expect(reduced.ringCount).toBe(1);
    expect(reduced.sparkScale).toBeGreaterThan(0);
  });
});
