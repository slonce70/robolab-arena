import { describe, expect, it } from 'vitest';
import { getDifficultyLabel, getIncomingDamageMultiplier, nextDifficulty } from './difficulty';

describe('difficulty settings', () => {
  it('cycles through approachable Ukrainian labels', () => {
    expect(getDifficultyLabel('easy')).toBe('Легко');
    expect(getDifficultyLabel('normal')).toBe('Нормально');
    expect(getDifficultyLabel('hard')).toBe('Важко');

    expect(nextDifficulty('easy')).toBe('normal');
    expect(nextDifficulty('normal')).toBe('hard');
    expect(nextDifficulty('hard')).toBe('easy');
  });

  it('keeps normal damage unchanged while easy and hard are explicit modifiers', () => {
    expect(getIncomingDamageMultiplier('easy')).toBe(0.8);
    expect(getIncomingDamageMultiplier('normal')).toBe(1);
    expect(getIncomingDamageMultiplier('hard')).toBe(1.2);
  });
});
