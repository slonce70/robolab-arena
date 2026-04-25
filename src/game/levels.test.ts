import { describe, expect, it } from 'vitest';
import { LEVELS } from './levels';

describe('RoboLab Arena levels', () => {
  it('ships with five first-release chambers', () => {
    expect(LEVELS).toHaveLength(5);
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
    expect(LEVELS[0]?.targets ?? []).toHaveLength(3);
  });
});

