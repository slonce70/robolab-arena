import { describe, expect, it } from 'vitest';
import { getLaserHazardFootprint } from './laserHazard';

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
});
