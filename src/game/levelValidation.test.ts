import { describe, expect, it } from 'vitest';
import { LEVELS } from './levels';
import { validateLevel } from './levelValidation';

describe('final level validation', () => {
  it('keeps all objects inside the playable arena', () => {
    const failures = LEVELS.flatMap((level) => validateLevel(level));

    expect(failures).toEqual([]);
  });

  it('mixes mechanics in rooms five through twelve', () => {
    for (const level of LEVELS.slice(4)) {
      const mechanicCount = [
        (level.enemies?.length ?? 0) > 0,
        (level.lasers?.length ?? 0) > 0,
        (level.buttons?.length ?? 0) > 0,
        (level.powerUps?.length ?? 0) > 0,
        (level.obstacles?.length ?? 0) >= 4
      ].filter(Boolean).length;

      expect(mechanicCount, level.name).toBeGreaterThanOrEqual(3);
    }
  });
});
