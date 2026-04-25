import { describe, expect, it } from 'vitest';
import { describeObjectiveProgress } from './objectives';

describe('describeObjectiveProgress', () => {
  it('formats target and enemy counters for the HUD', () => {
    expect(describeObjectiveProgress({ objective: 'targets', done: 3, total: 5 })).toBe('3/5 мішеней');
    expect(describeObjectiveProgress({ objective: 'enemies', done: 4, total: 7 })).toBe('4/7 роботів');
  });

  it('formats boss health as a remaining percentage', () => {
    expect(describeObjectiveProgress({ objective: 'boss', done: 64, total: 100 })).toBe('ядро боса 64%');
  });
});
