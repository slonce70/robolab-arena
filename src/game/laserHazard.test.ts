import { describe, expect, it } from 'vitest';
import { getLaserDangerClearance, getLaserHazardFootprint } from './laserHazard';

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
});
