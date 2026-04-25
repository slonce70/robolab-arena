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

  it('clamps noisy counter inputs before rendering progress', () => {
    expect(describeObjectiveProgress({ objective: 'buttons', done: 1.2, total: 3.1 })).toBe('2/4 кнопки');
    expect(describeObjectiveProgress({ objective: 'targets', done: -1, total: 5 })).toBe('0/5 мішеней');
  });

  it('keeps laser-survival rooms focused on reaching the exit', () => {
    expect(describeObjectiveProgress({ objective: 'survive-lasers', done: 0, total: 0 })).toBe('дійди до виходу');
  });
});
