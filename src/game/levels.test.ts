import { describe, expect, it } from 'vitest';
import { LEVELS } from './levels';

describe('RoboLab Arena levels', () => {
  it('ships with twelve expanded chambers', () => {
    expect(LEVELS).toHaveLength(12);
  });

  it('gives every chamber a clear objective and exit', () => {
    for (const level of LEVELS) {
      expect(level.name.length).toBeGreaterThan(3);
      expect(level.tip.length).toBeGreaterThan(12);
      expect(level.exit).toEqual(expect.objectContaining({ x: expect.any(Number), z: expect.any(Number) }));
      expect(level.objective).toMatch(/targets|enemies|buttons|survive-lasers|boss/);
    }
  });

  it('keeps the first chamber friendly for learning controls', () => {
    expect(LEVELS[0]?.enemies ?? []).toHaveLength(0);
    expect(LEVELS[0]?.targets ?? []).toHaveLength(5);
  });

  it('uses the larger arena space after the expansion', () => {
    for (const level of LEVELS) {
      expect(Math.abs(level.playerStart.z)).toBeGreaterThanOrEqual(20);
      expect(Math.abs(level.exit.z)).toBeGreaterThanOrEqual(20);
      expect(level.obstacles?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it('places healing kits through the campaign', () => {
    const repairCount = LEVELS.flatMap((level) => level.powerUps ?? []).filter((powerUp) => powerUp.kind === 'repair').length;
    expect(repairCount).toBeGreaterThanOrEqual(10);
  });
});
