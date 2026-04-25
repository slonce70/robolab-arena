import { describe, expect, it } from 'vitest';
import {
  ENEMY_INITIAL_SHOOT_DELAY,
  PLAYER_BASE_DAMAGE,
  PLAYER_OVERCHARGE_DAMAGE,
  SPAWN_INVULNERABILITY_SECONDS,
  getBossPhase,
  getEnemyStats,
  shotsToDefeat
} from './balance';

describe('RoboLab combat balance', () => {
  it('keeps regular enemies readable without turning them into damage sponges', () => {
    expect(shotsToDefeat('drone')).toBeLessThanOrEqual(2);
    expect(shotsToDefeat('beetle')).toBeLessThanOrEqual(2);
    expect(shotsToDefeat('turret')).toBeLessThanOrEqual(2);
    expect(shotsToDefeat('shieldBot')).toBeLessThanOrEqual(3);
  });

  it('makes overcharge feel meaningful against protected rooms and the boss', () => {
    expect(PLAYER_OVERCHARGE_DAMAGE).toBeGreaterThan(getEnemyStats('shieldBot').health);
    expect(PLAYER_OVERCHARGE_DAMAGE).toBeGreaterThan(PLAYER_BASE_DAMAGE * 3);
  });

  it('keeps the boss fight phased but forgiving for a child player', () => {
    const maxHealth = getEnemyStats('boss').health;

    expect(shotsToDefeat('boss')).toBe(7);
    expect(getBossPhase(maxHealth, maxHealth)).toMatchObject({ index: 1, bulletCount: 2, damage: 14 });
    expect(getBossPhase(maxHealth * 0.5, maxHealth)).toMatchObject({ index: 2, bulletCount: 3, damage: 14 });
    expect(getBossPhase(maxHealth * 0.2, maxHealth)).toMatchObject({ index: 3, bulletCount: 4, damage: 13 });
  });

  it('gives the player a short orientation window after entering a room', () => {
    expect(SPAWN_INVULNERABILITY_SECONDS).toBeGreaterThanOrEqual(1.2);
    expect(ENEMY_INITIAL_SHOOT_DELAY).toBeGreaterThan(SPAWN_INVULNERABILITY_SECONDS);
  });
});
