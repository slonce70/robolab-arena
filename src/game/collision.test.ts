import { describe, expect, it } from 'vitest';
import { pointHitsSolid } from './collision';

const point = { x: 0, z: -18 };

describe('projectile solid collision checks', () => {
  it('treats cover obstacles as projectile blockers', () => {
    const obstacle = {
      position: { x: 2, z: -4 },
      halfWidth: 1.5,
      halfDepth: 0.5
    };

    expect(pointHitsSolid({ x: 2.2, z: -4.1 }, [obstacle], [], 0.18)).toBe(true);
  });

  it('uses projectile radius for near-edge solid checks', () => {
    const obstacle = {
      position: { x: 0, z: 0 },
      halfWidth: 1,
      halfDepth: 1
    };

    expect(pointHitsSolid({ x: 1.1, z: 0 }, [obstacle], [], 0.18)).toBe(true);
    expect(pointHitsSolid({ x: 1.19, z: 0 }, [obstacle], [], 0.18)).toBe(false);
  });

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
