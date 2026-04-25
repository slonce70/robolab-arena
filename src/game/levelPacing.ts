import type { LevelConfig } from './types';

export type LevelPacingSummary = {
  repairCount: number;
  powerUpCount: number;
  enemyCount: number;
  laserCount: number;
  hasBoss: boolean;
};

export function summarizeLevelPacing(level: LevelConfig): LevelPacingSummary {
  return {
    repairCount: (level.powerUps ?? []).filter((powerUp) => powerUp.kind === 'repair').length,
    powerUpCount: level.powerUps?.length ?? 0,
    enemyCount: level.enemies?.length ?? 0,
    laserCount: level.lasers?.length ?? 0,
    hasBoss: (level.enemies ?? []).some((enemy) => enemy.kind === 'boss')
  };
}

export function validateLateRoomSupport(level: LevelConfig): string[] {
  const summary = summarizeLevelPacing(level);
  const failures: string[] = [];

  if (level.id >= 6 && summary.powerUpCount === 0) {
    failures.push(`Level ${level.id} has no support power-ups.`);
  }
  if ((level.id === 6 || level.id === 10) && summary.repairCount < 1) {
    failures.push(`Level ${level.id} needs at least one repair pickup for laser/button pressure.`);
  }
  if (summary.hasBoss && summary.repairCount < 3) {
    failures.push(`Level ${level.id} boss arena needs at least three repair pickups.`);
  }

  return failures;
}
