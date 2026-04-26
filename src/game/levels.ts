import type { LevelConfig } from './types';

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Великий запуск',
    objective: 'targets',
    tip: 'Нова велика арена. Збий п’ять мішеней, збери шестерні й знай зелений вихід.',
    playerStart: { x: 0, z: 20 },
    exit: { x: 0, z: -21 },
    targets: [
      { position: { x: -11, z: 9 } },
      { position: { x: 11, z: 9 } },
      { position: { x: -7, z: -2 } },
      { position: { x: 7, z: -2 } },
      { position: { x: 0, z: -13 } }
    ],
    collectibles: [
      { position: { x: -14, z: 15 } },
      { position: { x: 14, z: 15 } },
      { position: { x: -13, z: -11 } },
      { position: { x: 13, z: -11 } }
    ],
    powerUps: [
      { kind: 'repair', position: { x: 0, z: 8 } }
    ],
    obstacles: [
      { position: { x: -7, z: 3 }, size: { width: 5, depth: 1.1 } },
      { position: { x: 7, z: 3 }, size: { width: 5, depth: 1.1 } },
      { position: { x: 0, z: -7 }, size: { width: 9, depth: 1.1 } }
    ]
  },
  {
    id: 2,
    name: 'Дроновий ангар',
    objective: 'enemies',
    tip: 'Дрони патрулюють ангар. Використовуй укриття і не стій на місці.',
    playerStart: { x: 0, z: 20 },
    exit: { x: 0, z: -21 },
    enemies: [
      { kind: 'drone', position: { x: -12, z: 8 } },
      { kind: 'drone', position: { x: 12, z: 8 } },
      { kind: 'drone', position: { x: -8, z: -5 } },
      { kind: 'drone', position: { x: 8, z: -5 } },
      { kind: 'turret', position: { x: 0, z: -14 } }
    ],
    collectibles: [
      { position: { x: -15, z: 0 } },
      { position: { x: 15, z: 0 } },
      { position: { x: 0, z: -8 } }
    ],
    powerUps: [
      { kind: 'rapid', position: { x: 0, z: 13 } },
      { kind: 'repair', position: { x: 0, z: -2 } }
    ],
    obstacles: [
      { position: { x: -9, z: 3 }, size: { width: 2.4, depth: 7 } },
      { position: { x: 9, z: 3 }, size: { width: 2.4, depth: 7 } },
      { position: { x: -4, z: -10 }, size: { width: 5, depth: 1.2 } },
      { position: { x: 4, z: -10 }, size: { width: 5, depth: 1.2 } }
    ]
  },
  {
    id: 3,
    name: 'Кнопковий лабіринт',
    objective: 'buttons',
    tip: 'Знайди три кнопки в лабіринті. Коли всі світяться, біжи до виходу.',
    playerStart: { x: 0, z: 20 },
    exit: { x: 0, z: -21 },
    buttons: [
      { position: { x: -14, z: 9 }, opensDoorId: 'maze' },
      { position: { x: 14, z: 2 }, opensDoorId: 'maze' },
      { position: { x: -10, z: -11 }, opensDoorId: 'maze' }
    ],
    doors: [{ id: 'maze', position: { x: 0, z: -17 } }],
    enemies: [
      { kind: 'beetle', position: { x: -6, z: 11 } },
      { kind: 'beetle', position: { x: 7, z: 4 } },
      { kind: 'drone', position: { x: 5, z: -9 } }
    ],
    collectibles: [
      { position: { x: -15, z: -4 } },
      { position: { x: 15, z: -9 } },
      { position: { x: 0, z: 4 } }
    ],
    powerUps: [
      { kind: 'shield', position: { x: 0, z: 12 } },
      { kind: 'repair', position: { x: 11, z: -13 } }
    ],
    obstacles: [
      { position: { x: -6, z: 12 }, size: { width: 1.2, depth: 12 } },
      { position: { x: 6, z: 8 }, size: { width: 1.2, depth: 14 } },
      { position: { x: -11, z: -3 }, size: { width: 10, depth: 1.2 } },
      { position: { x: 9, z: -5 }, size: { width: 10, depth: 1.2 } },
      { position: { x: -3, z: -13 }, size: { width: 1.2, depth: 8 } }
    ]
  },
  {
    id: 4,
    name: 'Лазерна траса',
    objective: 'survive-lasers',
    tip: 'Довга лазерна траса. Ривок і стрибок допоможуть пройти небезпечні смуги.',
    playerStart: { x: 0, z: 20 },
    exit: { x: 0, z: -21 },
    lasers: [
      { position: { x: 0, z: 13 }, length: 28, axis: 'x', phase: 0 },
      { position: { x: 0, z: 8 }, length: 28, axis: 'x', phase: 1.1 },
      { position: { x: 0, z: 3 }, length: 28, axis: 'x', phase: 2.2 },
      { position: { x: 0, z: -2 }, length: 28, axis: 'x', phase: 3.3 },
      { position: { x: 0, z: -7 }, length: 28, axis: 'x', phase: 4.4 },
      { position: { x: 0, z: -12 }, length: 28, axis: 'x', phase: 5.5 }
    ],
    enemies: [
      { kind: 'turret', position: { x: -14, z: -16 } },
      { kind: 'turret', position: { x: 14, z: -16 } }
    ],
    collectibles: [
      { position: { x: -14, z: 6 } },
      { position: { x: 14, z: 1 } },
      { position: { x: -14, z: -9 } }
    ],
    powerUps: [
      { kind: 'shield', position: { x: 0, z: 15 } },
      { kind: 'repair', position: { x: 0, z: -14 } }
    ],
    obstacles: [
      { position: { x: -9, z: 5 }, size: { width: 4, depth: 1 } },
      { position: { x: 9, z: 0 }, size: { width: 4, depth: 1 } },
      { position: { x: -9, z: -5 }, size: { width: 4, depth: 1 } },
      { position: { x: 9, z: -10 }, size: { width: 4, depth: 1 } }
    ]
  },
  {
    id: 5,
    name: 'Магнітна майстерня',
    objective: 'enemies',
    tip: 'Майстерня широка. Вороги заходять з боків, аптечки заховані біля стін.',
    playerStart: { x: 0, z: 20 },
    exit: { x: 0, z: -21 },
    enemies: [
      { kind: 'turret', position: { x: -14, z: 8 } },
      { kind: 'turret', position: { x: 14, z: 8 } },
      { kind: 'shieldBot', position: { x: 0, z: 8.2 } },
      { kind: 'beetle', position: { x: -10, z: 1 } },
      { kind: 'beetle', position: { x: 10, z: 1 } },
      { kind: 'drone', position: { x: -11, z: -10 } },
      { kind: 'drone', position: { x: 11, z: -10 } }
    ],
    collectibles: [
      { position: { x: -15, z: 15 } },
      { position: { x: 15, z: 15 } },
      { position: { x: -13, z: -15 } },
      { position: { x: 13, z: -15 } }
    ],
    powerUps: [
      { kind: 'rapid', position: { x: 0, z: 11 } },
      { kind: 'shield', position: { x: 0, z: -4 } },
      { kind: 'overcharge', position: { x: 0, z: -16 } },
      { kind: 'repair', position: { x: -15, z: -4 } },
      { kind: 'repair', position: { x: 15, z: -4 } }
    ],
    obstacles: [
      { position: { x: 0, z: 6 }, size: { width: 10, depth: 1.2 } },
      { position: { x: -8, z: -3 }, size: { width: 1.2, depth: 10 } },
      { position: { x: 8, z: -3 }, size: { width: 1.2, depth: 10 } },
      { position: { x: 0, z: -13 }, size: { width: 12, depth: 1.2 } }
    ]
  },
  {
    id: 6,
    name: 'Секретний реактор',
    objective: 'buttons',
    tip: 'Реактор має чотири кнопки. Натискай їх, ухиляючись від лазерів і дронів.',
    playerStart: { x: 0, z: 20 },
    exit: { x: 0, z: -21 },
    buttons: [
      { position: { x: -14, z: 13 }, opensDoorId: 'reactor' },
      { position: { x: 14, z: 13 }, opensDoorId: 'reactor' },
      { position: { x: -14, z: -8 }, opensDoorId: 'reactor' },
      { position: { x: 14, z: -8 }, opensDoorId: 'reactor' }
    ],
    doors: [{ id: 'reactor', position: { x: 0, z: -18 } }],
    lasers: [
      { position: { x: 0, z: 5 }, length: 30, axis: 'x', phase: 0.5, sweep: { distance: 3, speed: 1.2 } },
      { position: { x: 0, z: -4 }, length: 30, axis: 'x', phase: 1.7 },
      { position: { x: 0, z: 0 }, length: 34, axis: 'z', phase: 2.8 }
    ],
    enemies: [
      { kind: 'drone', position: { x: -8, z: 2 } },
      { kind: 'drone', position: { x: 8, z: 2 } },
      { kind: 'turret', position: { x: 0, z: -12 } }
    ],
    collectibles: [
      { position: { x: -4, z: 12 } },
      { position: { x: 4, z: 12 } },
      { position: { x: -4, z: -12 } },
      { position: { x: 4, z: -12 } }
    ],
    powerUps: [
      { kind: 'repair', position: { x: 0, z: 16 } },
      { kind: 'overcharge', position: { x: -11, z: 0 } },
      { kind: 'shield', position: { x: 0, z: -10 } }
    ],
    obstacles: [
      { position: { x: -6, z: 7 }, size: { width: 1.2, depth: 9 } },
      { position: { x: 6, z: 7 }, size: { width: 1.2, depth: 9 } },
      { position: { x: -6, z: -8 }, size: { width: 1.2, depth: 9 } },
      { position: { x: 6, z: -8 }, size: { width: 1.2, depth: 9 } }
    ]
  },
  {
    id: 7,
    name: 'Швидкісний тунель',
    objective: 'survive-lasers',
    tip: 'Тунель став довшим. Плануй ривки між укриттями і не забувай про аптечку.',
    playerStart: { x: 0, z: 20 },
    exit: { x: 0, z: -21 },
    lasers: [
      { position: { x: 0, z: 15 }, length: 32, axis: 'x', phase: 0 },
      { position: { x: 0, z: 10 }, length: 32, axis: 'x', phase: 0.9 },
      { position: { x: 0, z: 5 }, length: 32, axis: 'x', phase: 1.8, sweep: { distance: 3.5, speed: 1.35 } },
      { position: { x: 0, z: 0 }, length: 32, axis: 'x', phase: 2.7 },
      { position: { x: 0, z: -5 }, length: 32, axis: 'x', phase: 3.6 },
      { position: { x: 0, z: -10 }, length: 32, axis: 'x', phase: 4.5 },
      { position: { x: 0, z: -15 }, length: 32, axis: 'x', phase: 5.4 }
    ],
    enemies: [
      { kind: 'turret', position: { x: -15, z: -18 } },
      { kind: 'turret', position: { x: 15, z: -18 } },
      { kind: 'drone', position: { x: 0, z: -8 } }
    ],
    collectibles: [
      { position: { x: -14, z: 8 } },
      { position: { x: 14, z: 3 } },
      { position: { x: -14, z: -7 } },
      { position: { x: 14, z: -12 } }
    ],
    powerUps: [
      { kind: 'shield', position: { x: 0, z: 12 } },
      { kind: 'overcharge', position: { x: -12, z: -17 } },
      { kind: 'repair', position: { x: 0, z: -13 } }
    ],
    obstacles: [
      { position: { x: -11, z: 12 }, size: { width: 4.8, depth: 1 } },
      { position: { x: 11, z: 7 }, size: { width: 4.8, depth: 1 } },
      { position: { x: -11, z: 2 }, size: { width: 4.8, depth: 1 } },
      { position: { x: 11, z: -3 }, size: { width: 4.8, depth: 1 } },
      { position: { x: -11, z: -8 }, size: { width: 4.8, depth: 1 } }
    ]
  },
  {
    id: 8,
    name: 'Сторожові башти',
    objective: 'enemies',
    tip: 'Башти контролюють центр. Обходь флангами, збирай аптечки і вимикай турелі.',
    playerStart: { x: 0, z: 20 },
    exit: { x: 0, z: -21 },
    enemies: [
      { kind: 'turret', position: { x: -12, z: 9 } },
      { kind: 'turret', position: { x: 12, z: 9 } },
      { kind: 'shieldBot', position: { x: 0, z: 12 } },
      { kind: 'turret', position: { x: -12, z: -9 } },
      { kind: 'turret', position: { x: 12, z: -9 } },
      { kind: 'drone', position: { x: 0, z: 3 } },
      { kind: 'drone', position: { x: 0, z: -6 } }
    ],
    collectibles: [
      { position: { x: -15, z: 0 } },
      { position: { x: 15, z: 0 } },
      { position: { x: 0, z: -15 } }
    ],
    powerUps: [
      { kind: 'repair', position: { x: -15, z: 15 } },
      { kind: 'repair', position: { x: 15, z: 15 } },
      { kind: 'overcharge', position: { x: 0, z: 0 } },
      { kind: 'rapid', position: { x: 0, z: 15 } }
    ],
    obstacles: [
      { position: { x: 0, z: 8 }, size: { width: 8, depth: 1.2 } },
      { position: { x: 0, z: -8 }, size: { width: 8, depth: 1.2 } },
      { position: { x: -7, z: 0 }, size: { width: 1.2, depth: 12 } },
      { position: { x: 7, z: 0 }, size: { width: 1.2, depth: 12 } }
    ]
  },
  {
    id: 9,
    name: 'Склад запчастин',
    objective: 'targets',
    tip: 'Мішені заховані між контейнерами. Рухайся по всій карті, щоб знайти їх.',
    playerStart: { x: 0, z: 20 },
    exit: { x: 0, z: -21 },
    targets: [
      { position: { x: -14, z: 12 } },
      { position: { x: 14, z: 12 } },
      { position: { x: -15, z: -2 } },
      { position: { x: 15, z: -2 } },
      { position: { x: -9, z: -16 } },
      { position: { x: 9, z: -16 } }
    ],
    enemies: [
      { kind: 'beetle', position: { x: -4, z: 6 } },
      { kind: 'beetle', position: { x: 4, z: 6 } },
      { kind: 'drone', position: { x: 0, z: -7 } }
    ],
    collectibles: [
      { position: { x: -12, z: 4 } },
      { position: { x: 12, z: 4 } },
      { position: { x: 0, z: -12 } }
    ],
    powerUps: [
      { kind: 'repair', position: { x: 0, z: 9 } },
      { kind: 'shield', position: { x: 0, z: -3 } }
    ],
    obstacles: [
      { position: { x: -10, z: 8 }, size: { width: 4, depth: 3 } },
      { position: { x: 10, z: 8 }, size: { width: 4, depth: 3 } },
      { position: { x: -10, z: -4 }, size: { width: 4, depth: 3 } },
      { position: { x: 10, z: -4 }, size: { width: 4, depth: 3 } },
      { position: { x: 0, z: -14 }, size: { width: 5, depth: 3 } }
    ]
  },
  {
    id: 10,
    name: 'Подвійний реактор',
    objective: 'buttons',
    tip: 'П’ять кнопок, дві двері, багато ворогів. Це вже справжній виклик.',
    playerStart: { x: 0, z: 20 },
    exit: { x: 0, z: -21 },
    buttons: [
      { position: { x: -15, z: 14 }, opensDoorId: 'left' },
      { position: { x: -15, z: -7 }, opensDoorId: 'left' },
      { position: { x: 15, z: 14 }, opensDoorId: 'right' },
      { position: { x: 15, z: -7 }, opensDoorId: 'right' },
      { position: { x: 0, z: -2 }, opensDoorId: 'left', opensDoorIds: ['left', 'right'] }
    ],
    doors: [
      { id: 'left', position: { x: -4, z: -18 } },
      { id: 'right', position: { x: 4, z: -18 } }
    ],
    enemies: [
      { kind: 'drone', position: { x: -9, z: 5 } },
      { kind: 'drone', position: { x: 9, z: 5 } },
      { kind: 'turret', position: { x: -12, z: -12 } },
      { kind: 'turret', position: { x: 12, z: -12 } },
      { kind: 'beetle', position: { x: 0, z: 10 } }
    ],
    lasers: [
      { position: { x: -8, z: 0 }, length: 24, axis: 'z', phase: 0.6 },
      { position: { x: 8, z: 0 }, length: 24, axis: 'z', phase: 1.6 }
    ],
    collectibles: [
      { position: { x: -4, z: 15 } },
      { position: { x: 4, z: 15 } },
      { position: { x: 0, z: -14 } }
    ],
    powerUps: [
      { kind: 'repair', position: { x: -12, z: 0 } },
      { kind: 'repair', position: { x: 12, z: 0 } },
      { kind: 'rapid', position: { x: 0, z: 7 } }
    ],
    obstacles: [
      { position: { x: 0, z: 11 }, size: { width: 10, depth: 1.2 } },
      { position: { x: -6, z: 1 }, size: { width: 1.2, depth: 16 } },
      { position: { x: 6, z: 1 }, size: { width: 1.2, depth: 16 } },
      { position: { x: 0, z: -11 }, size: { width: 11, depth: 1.2 } }
    ]
  },
  {
    id: 11,
    name: 'Передбосова арена',
    objective: 'enemies',
    tip: 'Остання перевірка перед босом. Вороги наступають хвилями з усіх боків.',
    playerStart: { x: 0, z: 20 },
    exit: { x: 0, z: -21 },
    enemies: [
      { kind: 'drone', position: { x: -13, z: 12 } },
      { kind: 'drone', position: { x: 13, z: 12 } },
      { kind: 'drone', position: { x: -13, z: -8 } },
      { kind: 'drone', position: { x: 13, z: -8 } },
      { kind: 'shieldBot', position: { x: 0, z: 0 } },
      { kind: 'beetle', position: { x: -5, z: 4 } },
      { kind: 'beetle', position: { x: 5, z: 4 } },
      { kind: 'turret', position: { x: 0, z: -17.5 } }
    ],
    collectibles: [
      { position: { x: -16, z: 0 } },
      { position: { x: 16, z: 0 } },
      { position: { x: -8, z: -16 } },
      { position: { x: 8, z: -16 } }
    ],
    powerUps: [
      { kind: 'repair', position: { x: -15, z: 16 } },
      { kind: 'repair', position: { x: 15, z: 16 } },
      { kind: 'shield', position: { x: 0, z: 11 } },
      { kind: 'overcharge', position: { x: 5, z: -16 } },
      { kind: 'rapid', position: { x: 0, z: -5 } }
    ],
    obstacles: [
      { position: { x: -8, z: 8 }, size: { width: 5, depth: 1.2 } },
      { position: { x: 8, z: 8 }, size: { width: 5, depth: 1.2 } },
      { position: { x: -8, z: -4 }, size: { width: 5, depth: 1.2 } },
      { position: { x: 8, z: -4 }, size: { width: 5, depth: 1.2 } },
      { position: { x: 0, z: -12 }, size: { width: 1.2, depth: 8 } }
    ]
  },
  {
    id: 12,
    name: 'Турбо-Вартовий XL',
    objective: 'boss',
    tip: 'Фінал на великій карті. Лікуйся аптечками, рухайся колом і бий ядро боса.',
    playerStart: { x: 0, z: 20 },
    exit: { x: 0, z: -21 },
    enemies: [
      { kind: 'boss', position: { x: 0, z: -5 } },
      { kind: 'drone', position: { x: -13, z: 5 } },
      { kind: 'drone', position: { x: 13, z: 5 } },
      { kind: 'turret', position: { x: -15, z: -16 } },
      { kind: 'turret', position: { x: 15, z: -16 } },
      { kind: 'beetle', position: { x: -8, z: 13 } },
      { kind: 'beetle', position: { x: 8, z: 13 } }
    ],
    collectibles: [
      { position: { x: -16, z: 17 } },
      { position: { x: 16, z: 17 } },
      { position: { x: -16, z: -12 } },
      { position: { x: 16, z: -12 } },
      { position: { x: 0, z: -17 } }
    ],
    powerUps: [
      { kind: 'rapid', position: { x: -5, z: 12 } },
      { kind: 'shield', position: { x: 5, z: 12 } },
      { kind: 'repair', position: { x: -14, z: -3 } },
      { kind: 'repair', position: { x: 14, z: -3 } },
      { kind: 'repair', position: { x: 0, z: -18 } }
    ],
    obstacles: [
      { position: { x: -10, z: 8 }, size: { width: 5, depth: 1.2 } },
      { position: { x: 10, z: 8 }, size: { width: 5, depth: 1.2 } },
      { position: { x: -10, z: -7 }, size: { width: 5, depth: 1.2 } },
      { position: { x: 10, z: -7 }, size: { width: 5, depth: 1.2 } },
      { position: { x: 0, z: 3 }, size: { width: 1.2, depth: 10 } }
    ]
  }
];
