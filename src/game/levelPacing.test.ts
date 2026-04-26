import { describe, expect, it } from 'vitest';
import { LEVELS } from './levels';
import { summarizeLevelPacing, validateBossOverchargeSupport, validateLateRoomSupport } from './levelPacing';

describe('late-room pacing support', () => {
  it('keeps the pressure rooms stocked with repair and power-up support', () => {
    const failures = LEVELS.flatMap(validateLateRoomSupport);

    expect(failures).toEqual([]);
  });

  it('documents why the final boss arena is forgiving enough for a full run', () => {
    const boss = LEVELS.find((level) => level.objective === 'boss');

    expect(boss).toBeDefined();
    expect(summarizeLevelPacing(boss!)).toMatchObject({
      hasBoss: true,
      repairCount: 3,
      powerUpCount: 6,
      enemyCount: 7
    });
  });

  it('puts exactly one high-impact overcharge pickup in a risky final-boss position', () => {
    const boss = LEVELS.find((level) => level.objective === 'boss');

    expect(boss).toBeDefined();
    expect(validateBossOverchargeSupport(boss!)).toEqual([]);
  });
});
