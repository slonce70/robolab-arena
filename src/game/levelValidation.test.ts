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

  it('starts every room away from immediate enemy, laser, and obstacle pressure', () => {
    for (const level of LEVELS) {
      const start = level.playerStart;
      for (const enemy of level.enemies ?? []) {
        expect(Math.hypot(start.x - enemy.position.x, start.z - enemy.position.z), `${level.name} enemy spawn distance`).toBeGreaterThanOrEqual(5);
      }
      for (const laser of level.lasers ?? []) {
        expect(Math.hypot(start.x - laser.position.x, start.z - laser.position.z), `${level.name} laser spawn distance`).toBeGreaterThanOrEqual(4);
      }
      for (const obstacle of level.obstacles ?? []) {
        const clearanceX = Math.abs(start.x - obstacle.position.x) - obstacle.size.width * 0.5;
        const clearanceZ = Math.abs(start.z - obstacle.position.z) - obstacle.size.depth * 0.5;
        expect(Math.max(clearanceX, clearanceZ), `${level.name} obstacle spawn clearance`).toBeGreaterThanOrEqual(1.2);
      }
    }
  });
});
