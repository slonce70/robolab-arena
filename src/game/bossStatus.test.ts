import { describe, expect, it } from 'vitest';
import { describeBossStatus } from './bossStatus';

describe('boss status HUD copy', () => {
  it('explains the calm opening phase', () => {
    expect(describeBossStatus(210, 210)).toMatchObject({
      percent: 100,
      phaseIndex: 1,
      phaseName: 'Розвідка',
      warning: 'повільні черги',
      cssClass: 'is-phase-1'
    });
  });

  it('calls out the final phase as movement-critical instead of just showing health', () => {
    const status = describeBossStatus(42, 210);

    expect(status).toMatchObject({
      percent: 20,
      phaseIndex: 3,
      phaseName: 'Останній розряд',
      cssClass: 'is-phase-3'
    });
    expect(status.text).toContain('рухайся колом');
  });

  it('clamps broken health input before formatting player-facing copy', () => {
    expect(describeBossStatus(999, 210).percent).toBe(100);
    expect(describeBossStatus(-4, 210).percent).toBe(0);
    expect(describeBossStatus(10, 0).text).toContain('0%');
  });
});
