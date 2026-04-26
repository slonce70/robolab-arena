import { describe, expect, it } from 'vitest';
import { describePowerHud, describePowerStatus } from './powerStatus';

describe('HUD power status copy', () => {
  it('shows an empty state when no upgrades are active', () => {
    expect(describePowerStatus({ rapidTimer: 0, shieldTimer: 0, overchargeShots: 0 })).toBe('Апгрейди —');
  });

  it('uses Ukrainian labels for active power timers and charges', () => {
    expect(describePowerStatus({ rapidTimer: 7.2, shieldTimer: 8.1, overchargeShots: 2 })).toBe('Прискорення 8с + Щит 9с + Заряд ×2');
  });

  it('adds HUD classes for active rapid, shield, and overcharge states', () => {
    expect(describePowerHud({ rapidTimer: 3, shieldTimer: 4, overchargeShots: 1 })).toEqual({
      text: 'Прискорення 3с + Щит 4с + Заряд ×1',
      classes: ['status-chip', 'power-chip', 'is-rapid', 'is-shielded', 'is-overcharged']
    });
  });

  it('marks timed powers as expiring when the last seconds are visible', () => {
    expect(describePowerHud({ rapidTimer: 1.2, shieldTimer: 0, overchargeShots: 0 }).classes).toContain('is-expiring');
    expect(describePowerHud({ rapidTimer: 0, shieldTimer: 2.01, overchargeShots: 0 }).classes).not.toContain('is-expiring');
  });
});
