import { describe, expect, it } from 'vitest';
import { getDifficultyLabel, nextDifficulty } from './difficulty';

describe('difficulty settings', () => {
  it('cycles through approachable Ukrainian labels', () => {
    expect(getDifficultyLabel('easy')).toBe('Легко');
    expect(getDifficultyLabel('normal')).toBe('Нормально');
    expect(getDifficultyLabel('hard')).toBe('Важко');

    expect(nextDifficulty('easy')).toBe('normal');
    expect(nextDifficulty('normal')).toBe('hard');
    expect(nextDifficulty('hard')).toBe('easy');
  });
});
