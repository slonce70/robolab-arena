import type { LevelConfig } from './types';

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Кімната запуску',
    objective: 'targets',
    tip: 'Рухайся вперед до мішеней, прицілюйся мишкою і стріляй енергією.',
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
    ],
    powerUps: [
      { kind: 'repair', position: { x: 0, z: 1 } }
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
    ],
    powerUps: [
      { kind: 'rapid', position: { x: 0, z: 4 } }
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
    ],
    powerUps: [
      { kind: 'shield', position: { x: 0, z: 0 } }
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
    ],
    powerUps: [
      { kind: 'repair', position: { x: 0, z: -6 } }
    ]
  },
  {
    id: 5,
    name: 'Магнітна майстерня',
    objective: 'enemies',
    tip: 'У майстерні багато механізмів. Ховайся за колонами і вимикай роботів.',
    playerStart: { x: 0, z: 7 },
    exit: { x: 0, z: -8 },
    enemies: [
      { kind: 'turret', position: { x: -6, z: -4 } },
      { kind: 'turret', position: { x: 6, z: -4 } },
      { kind: 'beetle', position: { x: -3, z: 1 } },
      { kind: 'beetle', position: { x: 3, z: 1 } }
    ],
    collectibles: [
      { position: { x: -7, z: 5 } },
      { position: { x: 7, z: 5 } },
      { position: { x: 0, z: -1 } }
    ],
    powerUps: [
      { kind: 'rapid', position: { x: 0, z: 3 } },
      { kind: 'shield', position: { x: 0, z: -5 } }
    ]
  },
  {
    id: 6,
    name: 'Секретний реактор',
    objective: 'buttons',
    tip: 'Натисни три реакторні кнопки. Лазери краще перестрибувати.',
    playerStart: { x: 0, z: 7 },
    exit: { x: 0, z: -8 },
    buttons: [
      { position: { x: -6.5, z: 3 }, opensDoorId: 'reactor' },
      { position: { x: 6.5, z: 3 }, opensDoorId: 'reactor' },
      { position: { x: 0, z: -3 }, opensDoorId: 'reactor' }
    ],
    doors: [{ id: 'reactor', position: { x: 0, z: -6 } }],
    lasers: [
      { position: { x: 0, z: 1 }, length: 13, axis: 'x', phase: 0.5 },
      { position: { x: 0, z: -2 }, length: 13, axis: 'x', phase: 1.7 }
    ],
    enemies: [
      { kind: 'drone', position: { x: -5, z: -1 } },
      { kind: 'drone', position: { x: 5, z: -1 } }
    ],
    collectibles: [
      { position: { x: -7, z: -5 } },
      { position: { x: 7, z: -5 } }
    ],
    powerUps: [
      { kind: 'repair', position: { x: 0, z: 5 } }
    ]
  },
  {
    id: 7,
    name: 'Швидкісний тунель',
    objective: 'survive-lasers',
    tip: 'Швидкий тунель: збирай щити, обирай момент і проривайся до виходу.',
    playerStart: { x: 0, z: 7 },
    exit: { x: 0, z: -8 },
    lasers: [
      { position: { x: 0, z: 4 }, length: 12, axis: 'x', phase: 0 },
      { position: { x: 0, z: 1.5 }, length: 12, axis: 'x', phase: 0.9 },
      { position: { x: 0, z: -1 }, length: 12, axis: 'x', phase: 1.8 },
      { position: { x: 0, z: -3.5 }, length: 12, axis: 'x', phase: 2.7 },
      { position: { x: 0, z: -6 }, length: 12, axis: 'x', phase: 3.6 }
    ],
    enemies: [
      { kind: 'turret', position: { x: -7, z: -7 } },
      { kind: 'turret', position: { x: 7, z: -7 } }
    ],
    collectibles: [
      { position: { x: -6, z: 2 } },
      { position: { x: 6, z: -1 } },
      { position: { x: -6, z: -4 } }
    ],
    powerUps: [
      { kind: 'shield', position: { x: 0, z: 2.7 } },
      { kind: 'repair', position: { x: 0, z: -5 } }
    ]
  },
  {
    id: 8,
    name: 'Турбо-Вартовий',
    objective: 'boss',
    tip: 'Фінал! У боса багато енергії. Рухайся колом і стріляй у світне ядро.',
    playerStart: { x: 0, z: 7 },
    exit: { x: 0, z: -8 },
    enemies: [
      { kind: 'boss', position: { x: 0, z: -2 } },
      { kind: 'drone', position: { x: -6, z: 0 } },
      { kind: 'drone', position: { x: 6, z: 0 } },
      { kind: 'turret', position: { x: -7, z: -6 } },
      { kind: 'turret', position: { x: 7, z: -6 } }
    ],
    collectibles: [
      { position: { x: -7, z: 5 } },
      { position: { x: 7, z: 5 } },
      { position: { x: -7, z: -6 } },
      { position: { x: 7, z: -6 } }
    ],
    powerUps: [
      { kind: 'rapid', position: { x: -3, z: 4 } },
      { kind: 'shield', position: { x: 3, z: 4 } },
      { kind: 'repair', position: { x: 0, z: -6 } }
    ]
  }
];
