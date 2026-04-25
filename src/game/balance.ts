import type { EnemyKind } from './types';

export const PLAYER_BASE_DAMAGE = 30;
export const PLAYER_RAPID_DAMAGE = 22;
export const PLAYER_OVERCHARGE_DAMAGE = 96;
export const REPAIR_AMOUNT = 45;
export const LASER_DAMAGE_PER_SECOND = 42;
export const BEETLE_CONTACT_DAMAGE = 14;
export const SPAWN_INVULNERABILITY_SECONDS = 1.4;
export const ENEMY_INITIAL_SHOOT_DELAY = 1.8;

export type EnemyStats = {
  health: number;
  radius: number;
};

export type BossPhase = {
  index: 1 | 2 | 3;
  bulletCount: number;
  spread: number;
  damage: number;
  cooldown: number;
};

const ENEMY_STATS: Record<EnemyKind, EnemyStats> = {
  drone: { health: 34, radius: 0.7 },
  turret: { health: 54, radius: 0.85 },
  beetle: { health: 42, radius: 0.65 },
  shieldBot: { health: 66, radius: 0.9 },
  boss: { health: 210, radius: 1.5 }
};

export function getEnemyStats(kind: EnemyKind): EnemyStats {
  return ENEMY_STATS[kind];
}

export function shotsToDefeat(kind: EnemyKind, damage = PLAYER_BASE_DAMAGE): number {
  return Math.ceil(getEnemyStats(kind).health / damage);
}

export function getBossPhase(health: number, maxHealth: number): BossPhase {
  const healthRatio = maxHealth > 0 ? health / maxHealth : 0;
  if (healthRatio <= 0.34) {
    return { index: 3, bulletCount: 4, spread: 0.42, damage: 13, cooldown: 2.35 };
  }
  if (healthRatio <= 0.67) {
    return { index: 2, bulletCount: 3, spread: 0.34, damage: 14, cooldown: 2.45 };
  }
  return { index: 1, bulletCount: 2, spread: 0.26, damage: 14, cooldown: 2.55 };
}
