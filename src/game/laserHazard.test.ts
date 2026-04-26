import { describe, expect, it } from 'vitest';
import { getLaserDangerClearance, getLaserHazardFootprint, getLaserWarningLaneOffset, isPointInLaserDamage } from './laserHazard';

describe('laser hazard footprint', () => {
  it('marks horizontal laser lanes wider than the damaging beam', () => {
    expect(getLaserHazardFootprint({ position: { x: 0, z: 0 }, length: 30, axis: 'x', phase: 0 })).toEqual({
      width: 30,
      depth: 0.72
    });
  });

  it('marks vertical laser lanes wider than the damaging beam', () => {
    expect(getLaserHazardFootprint({ position: { x: 0, z: 0 }, length: 24, axis: 'z', phase: 0 })).toEqual({
      width: 0.72,
      depth: 24
    });
  });

  it('measures spawn clearance against the damaging beam segment, not only the laser center', () => {
    const laser = { position: { x: 0, z: 0 }, length: 28, axis: 'x' as const, phase: 0 };

    expect(Math.hypot(13 - laser.position.x, 0.2 - laser.position.z)).toBeGreaterThan(4);
    expect(getLaserDangerClearance({ x: 13, z: 0.2 }, laser)).toBeLessThan(0);
    expect(getLaserDangerClearance({ x: 13, z: 2 }, laser)).toBeCloseTo(1.65, 5);
  });

  it('includes the full sweep envelope when measuring laser danger clearance', () => {
    const laser = {
      position: { x: 0, z: 5 },
      length: 30,
      axis: 'x' as const,
      phase: 0,
      sweep: { distance: 3, speed: 1.2 }
    };

    expect(getLaserDangerClearance({ x: 0, z: 7.9 }, laser)).toBeLessThan(0);
    expect(getLaserDangerClearance({ x: 0, z: 9.7 }, laser)).toBeCloseTo(1.35, 5);
  });

  it('expands warning lanes to show the full sweeping laser corridor', () => {
    expect(getLaserHazardFootprint({
      position: { x: 0, z: 0 },
      length: 30,
      axis: 'x',
      phase: 0,
      sweep: { distance: 3, speed: 1.2 }
    })).toEqual({
      width: 30,
      depth: 6.72
    });

    expect(getLaserHazardFootprint({
      position: { x: 0, z: 0 },
      length: 24,
      axis: 'z',
      phase: 0,
      sweep: { distance: 2, speed: 1 }
    })).toEqual({
      width: 4.72,
      depth: 24
    });
  });

  it('keeps a sweeping warning lane visually anchored to the base corridor', () => {
    expect(getLaserWarningLaneOffset(
      { position: { x: 0, z: 5 }, length: 30, axis: 'x', phase: 0, sweep: { distance: 3, speed: 1.2 } },
      { x: 0, z: 5 },
      { x: 0, z: 8 }
    )).toEqual({ x: 0, z: -3 });

    expect(getLaserWarningLaneOffset(
      { position: { x: -8, z: 0 }, length: 24, axis: 'z', phase: 0.6, sweep: { distance: 2, speed: 1 } },
      { x: -8, z: 0 },
      { x: -6, z: 0 }
    )).toEqual({ x: -2, z: 0 });
  });

  it('shares the instantaneous runtime damage check with the game loop', () => {
    const laser = { position: { x: 0, z: 0 }, length: 10, axis: 'z' as const, phase: 0 };

    expect(isPointInLaserDamage({ x: 0.34, z: 4.9 }, laser.position, laser)).toBe(true);
    expect(isPointInLaserDamage({ x: 0.36, z: 4.9 }, laser.position, laser)).toBe(false);
    expect(isPointInLaserDamage({ x: 0.1, z: 5.1 }, laser.position, laser)).toBe(false);
  });

});
