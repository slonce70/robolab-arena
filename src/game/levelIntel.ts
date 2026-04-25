import type { EnemyKind, LevelConfig, LevelObjective, PowerUpKind } from './types';

export type LevelIntel = {
  objective: string;
  threat: string;
  support: string;
  tactic: string;
};

const objectiveLabels: Record<LevelObjective, string> = {
  targets: 'Збий усі мішені, тоді відкрий шлях до виходу.',
  enemies: 'Знешкодь усіх роботів, потім рухайся до зеленого виходу.',
  buttons: 'Активуй усі кнопки, щоб розблокувати двері до виходу.',
  'survive-lasers': 'Пройди лазерний маршрут і дістанься виходу живим.',
  boss: 'Збий ядро боса, контролюй арену й добігай до фінішу.'
};

const enemyLabels: Record<EnemyKind, string> = {
  drone: 'дрони',
  turret: 'турелі',
  beetle: 'жуки-тарани',
  shieldBot: 'щитоботи',
  boss: 'бос'
};

const powerLabels: Record<PowerUpKind, string> = {
  repair: 'ремонт',
  rapid: 'rapid-вогонь',
  shield: 'щит',
  overcharge: 'суперзаряд'
};

export function getLevelIntel(level: LevelConfig): LevelIntel {
  return {
    objective: objectiveLabels[level.objective],
    threat: describeThreat(level),
    support: describeSupport(level),
    tactic: describeTactic(level)
  };
}

function describeThreat(level: LevelConfig): string {
  const parts = countBy(level.enemies?.map((enemy) => enemy.kind) ?? []);
  const enemySummary = Object.entries(parts)
    .map(([kind, count]) => `${count} ${enemyLabels[kind as EnemyKind]}`)
    .join(', ');
  const laserSummary = level.lasers?.length ? `${level.lasers.length} лазерні пастки` : '';
  const summary = [enemySummary, laserSummary].filter(Boolean).join(' + ');

  return summary || 'ворогів немає, головна загроза - маршрут і таймінг';
}

function describeSupport(level: LevelConfig): string {
  const powers = countBy(level.powerUps?.map((powerUp) => powerUp.kind) ?? []);
  const powerSummary = Object.entries(powers)
    .map(([kind, count]) => `${count} ${powerLabels[kind as PowerUpKind]}`)
    .join(', ');
  const gearCount = level.collectibles?.length ?? 0;
  const gearSummary = gearCount > 0 ? `${gearCount} шестерні` : '';
  const summary = [powerSummary, gearSummary].filter(Boolean).join(' + ');

  return summary || 'допомоги немає - грай обережно';
}

function describeTactic(level: LevelConfig): string {
  if (level.objective === 'boss') return 'Тримай дистанцію, рухайся колом, бери ремонт тільки після втрати енергії.';
  if (level.objective === 'buttons') return 'Спочатку запам’ятай кнопки, чисть найближчі загрози й відкривай двері по черзі.';
  if (level.objective === 'survive-lasers') return 'Не поспішай: дочекайся вікна, роби ривок між укриттями, щит бережи для помилки.';
  if ((level.enemies?.length ?? 0) >= 7) return 'Розбирай ворогів малими групами, не заходь у центр без щита або ремонту поруч.';
  if ((level.targets?.length ?? 0) >= 5) return 'Перевір кути арени, збивай дальні мішені з безпечної позиції, потім іди до виходу.';
  return 'Рухайся від укриття до укриття й не забувай про камеру C для складних кутів.';
}

function countBy<T extends string>(items: T[]): Partial<Record<T, number>> {
  return items.reduce<Partial<Record<T, number>>>((counts, item) => {
    counts[item] = (counts[item] ?? 0) + 1;
    return counts;
  }, {});
}
