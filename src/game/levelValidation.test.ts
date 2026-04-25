import { describe, expect, it } from 'vitest';
import { LEVELS } from './levels';
import { validateLevel } from './levelValidation';

describe('final level validation', () => {
  it('keeps all objects inside the playable arena', () => {
    const failures = LEVELS.flatMap((level) => validateLevel(level));

    expect(failures).toEqual([]);
  });

  it('gives every objective the runtime objects it needs', () => {
    for (const level of LEVELS) {
      if (level.objective === 'targets') {
        expect(level.targets?.length ?? 0, level.name).toBeGreaterThan(0);
      }
      if (level.objective === 'enemies') {
        expect(level.enemies?.length ?? 0, level.name).toBeGreaterThan(0);
      }
      if (level.objective === 'buttons') {
        expect(level.buttons?.length ?? 0, level.name).toBeGreaterThan(0);
        expect(level.doors?.length ?? 0, level.name).toBeGreaterThan(0);
      }
      if (level.objective === 'survive-lasers') {
        expect(level.lasers?.length ?? 0, level.name).toBeGreaterThan(0);
      }
      if (level.objective === 'boss') {
        expect(level.enemies?.some((enemy) => enemy.kind === 'boss'), level.name).toBe(true);
      }
    }
  });

  it('keeps button door references resolvable', () => {
    for (const level of LEVELS) {
      const doorIds = new Set((level.doors ?? []).map((door) => door.id));
      const referencedDoorIds = (level.buttons ?? []).flatMap((button) => [
        button.opensDoorId,
        ...(button.opensDoorIds ?? [])
      ]);

      for (const doorId of referencedDoorIds) {
        expect(doorIds.has(doorId), `${level.name} references missing door ${doorId}`).toBe(true);
      }
    }
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
