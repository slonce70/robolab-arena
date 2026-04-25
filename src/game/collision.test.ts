import { describe, expect, it } from 'vitest';
import { pointHitsSolid } from './collision';

const point = { x: 0, z: -18 };

describe('projectile solid collision checks', () => {
  it('treats closed doors as projectile blockers', () => {
    const closedDoor = {
      position: { x: 0, z: -18 },
      halfWidth: 3.6,
      halfDepth: 0.35,
      open: false
    };

    expect(pointHitsSolid(point, [], [closedDoor], 0.18)).toBe(true);
  });

  it('lets projectiles pass through open doors', () => {
    const openDoor = {
      position: { x: 0, z: -18 },
      halfWidth: 3.6,
      halfDepth: 0.35,
      open: true
    };

    expect(pointHitsSolid(point, [], [openDoor], 0.18)).toBe(false);
  });
});
