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

  it('uses readable Ukrainian count labels in pause support summaries', () => {
    expect(getLevelIntel(LEVELS[1]).threat).toContain('1 турель');
    expect(getLevelIntel(LEVELS[4]).support).toContain('2 ремонти');
    expect(getLevelIntel(LEVELS[11]).support).toContain('5 шестерень');
    expect(getLevelIntel(LEVELS[11]).threat).toContain('1 бос');
  });

  it('calls out boss and laser rooms with specific tactics', () => {
    expect(getLevelIntel(LEVELS[3]).tactic).toContain('ривок');
    expect(getLevelIntel(LEVELS[11]).threat).toContain('бос');
    expect(getLevelIntel(LEVELS[11]).tactic).toContain('рухайся колом');
  });
});
