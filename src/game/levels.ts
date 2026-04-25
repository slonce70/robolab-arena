import type { LevelConfig } from './types';

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Кімната запуску',
    objective: 'targets',
    tip: 'Рухайся, прицілюйся мишкою і збий три світні мішені.',
    playerStart: { x: 0, z: 7 },
    exit: { x: 0, z: -8 },
    targets: [
      { position: { x: -4, z: -2 } },
      { position: { x: 0, z: -4 } },
      { position: { x: 4, z: -2 } }
    ],
    collectibles: [
      { position: { x: -6, z: 4 } },
      { position: { x: 6, z: 4 } }
    ]
  },
  {
    id: 2,
    name: 'Дрони на волі',
    objective: 'enemies',
    tip: 'Дрони повільні, але хитрі. Тримай дистанцію і стріляй енергією.',
    playerStart: { x: 0, z: 7 },
    exit: { x: 0, z: -8 },
    enemies: [
      { kind: 'drone', position: { x: -4, z: -3 } },
      { kind: 'drone', position: { x: 4, z: -3 } },
      { kind: 'turret', position: { x: 0, z: -6 } }
    ],
    collectibles: [
      { position: { x: -7, z: -1 } },
      { position: { x: 7, z: -1 } },
      { position: { x: 0, z: 2 } }
    ]
  },
  {
    id: 3,
    name: 'Кнопки і двері',
    objective: 'buttons',
    tip: 'Засвіти дві кнопки, щоб відкрити енергетичні двері.',
    playerStart: { x: 0, z: 7 },
    exit: { x: 0, z: -8 },
    buttons: [
      { position: { x: -6, z: 0 }, opensDoorId: 'main' },
      { position: { x: 6, z: 0 }, opensDoorId: 'main' }
    ],
    doors: [{ id: 'main', position: { x: 0, z: -5 } }],
    enemies: [
      { kind: 'beetle', position: { x: -2, z: -2 } },
      { kind: 'beetle', position: { x: 2, z: -2 } }
    ],
    collectibles: [
      { position: { x: -5, z: 4 } },
      { position: { x: 5, z: 4 } }
    ]
  },
  {
    id: 4,
    name: 'Лазерний коридор',
    objective: 'survive-lasers',
    tip: 'Лазери миготять. Дочекайся моменту і пробіжи до виходу.',
    playerStart: { x: 0, z: 7 },
    exit: { x: 0, z: -8 },
    lasers: [
      { position: { x: 0, z: 2 }, length: 12, axis: 'x', phase: 0 },
      { position: { x: 0, z: -1 }, length: 12, axis: 'x', phase: 1.2 },
      { position: { x: 0, z: -4 }, length: 12, axis: 'x', phase: 2.1 }
    ],
    enemies: [{ kind: 'turret', position: { x: 6, z: -6 } }],
    collectibles: [
      { position: { x: -7, z: 2 } },
      { position: { x: 7, z: -1 } },
      { position: { x: -7, z: -4 } }
    ]
  },
  {
    id: 5,
    name: 'Турбо-Вартовий',
    objective: 'boss',
    tip: 'У боса багато енергії. Рухайся колом і стріляй у світне ядро.',
    playerStart: { x: 0, z: 7 },
    exit: { x: 0, z: -8 },
    enemies: [
      { kind: 'boss', position: { x: 0, z: -2 } },
      { kind: 'drone', position: { x: -6, z: 0 } },
      { kind: 'drone', position: { x: 6, z: 0 } }
    ],
    collectibles: [
      { position: { x: -7, z: 5 } },
      { position: { x: 7, z: 5 } },
      { position: { x: -7, z: -6 } },
      { position: { x: 7, z: -6 } }
    ]
  }
];

