import { describe, expect, it } from 'vitest';
import { describeObjectiveHud, describeObjectiveProgress } from './objectives';

describe('describeObjectiveProgress', () => {
  it('formats target and enemy counters for the HUD', () => {
    expect(describeObjectiveProgress({ objective: 'targets', done: 3, total: 5 })).toBe('3 з 5 мішеней');
    expect(describeObjectiveProgress({ objective: 'enemies', done: 4, total: 7 })).toBe('4 з 7 роботів');
  });

  it('uses natural total-count wording for compact objective counters', () => {
    expect(describeObjectiveProgress({ objective: 'targets', done: 1, total: 1 })).toBe('1 з 1 мішені');
    expect(describeObjectiveProgress({ objective: 'enemies', done: 1, total: 2 })).toBe('1 з 2 роботів');
  });

  it('formats boss health as a remaining percentage', () => {
    expect(describeObjectiveProgress({ objective: 'boss', done: 64, total: 100 })).toBe('ядро боса 64%');
  });

  it('clamps noisy counter inputs before rendering progress', () => {
    expect(describeObjectiveProgress({ objective: 'buttons', done: 1.2, total: 3.1 })).toBe('2 з 4 кнопок');
    expect(describeObjectiveProgress({ objective: 'targets', done: -1, total: 5 })).toBe('0 з 5 мішеней');
  });

  it('keeps laser-survival rooms focused on reaching the exit', () => {
    expect(describeObjectiveProgress({ objective: 'survive-lasers', done: 0, total: 0 })).toBe('дійди до виходу');
  });

  it('marks completed objectives for stronger HUD feedback', () => {
    expect(describeObjectiveHud(false)).toMatchObject({ text: '', classes: ['objective-chip'] });
    expect(describeObjectiveHud(true)).toMatchObject({
      text: 'Ціль виконано. Біжи до зеленого виходу!',
      classes: ['objective-chip', 'is-complete']
    });
  });
});
