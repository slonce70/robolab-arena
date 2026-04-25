import { describe, expect, it } from 'vitest';
import { LEVELS } from './levels';
import { createRoomBrief } from './roomBrief';
import type { LevelConfig } from './types';

describe('room brief copy', () => {
  it('summarizes doors and lasers for a button pressure room', () => {
    const brief = createRoomBrief(LEVELS[5]);

    expect(brief.title).toContain('Кімната 6');
    expect(brief.stats).toEqual(expect.arrayContaining(['3 вороги', '3 апгрейди', '1 двері', '3 лазери']));
  });

  it('uses readable Ukrainian count labels across room support stats', () => {
    const brief = createRoomBrief({
      id: 99,
      name: 'Граматичний тест',
      objective: 'enemies',
      tip: 'Перевір форми.',
      playerStart: { x: 0, z: 0 },
      exit: { x: 0, z: 1 },
      enemies: [
        { kind: 'drone', position: { x: 0, z: 0 } },
        { kind: 'drone', position: { x: 1, z: 0 } },
        { kind: 'drone', position: { x: 2, z: 0 } },
        { kind: 'drone', position: { x: 3, z: 0 } },
        { kind: 'drone', position: { x: 4, z: 0 } }
      ],
      powerUps: [{ kind: 'repair', position: { x: 0, z: 0 } }],
      collectibles: [
        { position: { x: 0, z: 0 } },
        { position: { x: 1, z: 0 } },
        { position: { x: 2, z: 0 } }
      ],
      doors: [
        { id: 'a', position: { x: 0, z: 0 } },
        { id: 'b', position: { x: 1, z: 0 } }
      ],
      lasers: [
        { position: { x: 0, z: 0 }, length: 1, axis: 'x', phase: 0 },
        { position: { x: 1, z: 0 }, length: 1, axis: 'x', phase: 0 },
        { position: { x: 2, z: 0 }, length: 1, axis: 'x', phase: 0 },
        { position: { x: 3, z: 0 }, length: 1, axis: 'x', phase: 0 },
        { position: { x: 4, z: 0 }, length: 1, axis: 'x', phase: 0 }
      ]
    } satisfies LevelConfig);

    expect(brief.stats).toEqual(['5 ворогів', '1 апгрейд', '3 шестерні', '2 двері', '5 лазерів']);
  });

  it('warns late-game players without changing level tips', () => {
    const brief = createRoomBrief(LEVELS[11]);

    expect(brief.warning).toContain('Фінальний сектор');
    expect(LEVELS[11].tip).toContain('Фінал');
  });
});
