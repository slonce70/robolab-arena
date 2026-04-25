import { describe, expect, it } from 'vitest';
import { getLevelIntel } from './levelIntel';
import { LEVELS } from './levels';

describe('level intel', () => {
  it('gives every room actionable pause-screen guidance', () => {
    for (const level of LEVELS) {
      const intel = getLevelIntel(level);

      expect(intel.objective.length, level.name).toBeGreaterThan(24);
      expect(intel.threat.length, level.name).toBeGreaterThan(12);
      expect(intel.support.length, level.name).toBeGreaterThan(12);
      expect(intel.tactic.length, level.name).toBeGreaterThan(35);
    }
  });

  it('calls out boss and laser rooms with specific tactics', () => {
    expect(getLevelIntel(LEVELS[3]).tactic).toContain('ривок');
    expect(getLevelIntel(LEVELS[11]).threat).toContain('бос');
    expect(getLevelIntel(LEVELS[11]).tactic).toContain('рухайся колом');
  });
});
