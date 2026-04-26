import { describe, expect, it } from 'vitest';
import { describePowerStatus } from './powerStatus';

describe('HUD power status copy', () => {
  it('shows an empty state when no upgrades are active', () => {
    expect(describePowerStatus({ rapidTimer: 0, shieldTimer: 0, overchargeShots: 0 })).toBe('Апгрейди —');
  });

  it('uses Ukrainian labels for active power timers and charges', () => {
    expect(describePowerStatus({ rapidTimer: 7.2, shieldTimer: 8.1, overchargeShots: 2 })).toBe('Прискорення 8с + Щит 9с + Заряд ×2');
  });
});
