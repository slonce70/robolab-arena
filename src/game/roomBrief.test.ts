import { describe, expect, it } from 'vitest';
import { LEVELS } from './levels';
import { createRoomBrief } from './roomBrief';

describe('room brief copy', () => {
  it('summarizes doors and lasers for a button pressure room', () => {
    const brief = createRoomBrief(LEVELS[5]);

    expect(brief.title).toContain('Кімната 6');
    expect(brief.stats).toEqual(expect.arrayContaining(['3 ворогів', '3 апгрейдів', '1 дверей', '3 лазери']));
  });

  it('warns late-game players without changing level tips', () => {
    const brief = createRoomBrief(LEVELS[11]);

    expect(brief.warning).toContain('Фінальний сектор');
    expect(LEVELS[11].tip).toContain('Фінал');
  });
});
