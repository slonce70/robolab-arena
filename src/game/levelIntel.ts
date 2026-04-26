import type { EnemyKind, LevelConfig, LevelObjective, PowerUpKind } from './types';
import { formatUkrainianCount, type UkrainianCountForms } from './ukrainianCounts';

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

const enemyLabels: Record<EnemyKind, UkrainianCountForms> = {
  drone: { one: 'дрон', few: 'дрони', many: 'дронів' },
  turret: { one: 'турель', few: 'турелі', many: 'турелей' },
  beetle: { one: 'жук-таран', few: 'жуки-тарани', many: 'жуків-таранів' },
  shieldBot: { one: 'щитобот', few: 'щитоботи', many: 'щитоботів' },
  boss: { one: 'бос', few: 'боси', many: 'босів' }
};

const powerLabels: Record<PowerUpKind, UkrainianCountForms> = {
  repair: { one: 'ремонт', few: 'ремонти', many: 'ремонтів' },
  rapid: { one: 'прискорювач', few: 'прискорювачі', many: 'прискорювачів' },
  shield: { one: 'щит', few: 'щити', many: 'щитів' },
  overcharge: { one: 'суперзаряд', few: 'суперзаряди', many: 'суперзарядів' }
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
    .map(([kind, count]) => formatUkrainianCount(count, enemyLabels[kind as EnemyKind]))
    .join(', ');
  const laserSummary = level.lasers?.length
    ? formatUkrainianCount(level.lasers.length, { one: 'лазерна пастка', few: 'лазерні пастки', many: 'лазерних пасток' })
    : '';
  const summary = [enemySummary, laserSummary].filter(Boolean).join(' + ');

  return summary || 'ворогів немає, головна загроза — маршрут і таймінг';
}

function describeSupport(level: LevelConfig): string {
  const powers = countBy(level.powerUps?.map((powerUp) => powerUp.kind) ?? []);
  const powerSummary = Object.entries(powers)
    .map(([kind, count]) => formatUkrainianCount(count, powerLabels[kind as PowerUpKind]))
    .join(', ');
  const gearCount = level.collectibles?.length ?? 0;
  const gearSummary = gearCount > 0 ? formatUkrainianCount(gearCount, { one: 'шестерня', few: 'шестерні', many: 'шестерень' }) : '';
  const summary = [powerSummary, gearSummary].filter(Boolean).join(' + ');

  return summary || 'допомоги немає — грай обережно';
}

function describeTactic(level: LevelConfig): string {
  if (level.objective === 'boss') return 'Тримай дистанцію, рухайся колом, бери ремонт тільки після втрати енергії.';
  if (level.objective === 'buttons' && (level.lasers?.length ?? 0) > 0) {
    const hasShield = (level.powerUps ?? []).some((powerUp) => powerUp.kind === 'shield');
    return hasShield
      ? 'Йди між лазерними вікнами, відкривай двері по черзі, а щит тримай для останньої кнопки або помилки.'
      : 'Йди між лазерними вікнами, відкривай двері по черзі й відступай до ремонту після помилки.';
  }
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
