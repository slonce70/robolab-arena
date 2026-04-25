import type { LevelConfig } from './types';

export type RoomBrief = {
  title: string;
  stats: string[];
  warning: string;
};

type CountForms = {
  one: string;
  few: string;
  many: string;
};

function formatCount(count: number, forms: CountForms): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  const noun = lastDigit === 1 && lastTwoDigits !== 11
    ? forms.one
    : lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)
      ? forms.few
      : forms.many;

  return `${count} ${noun}`;
}

export function createRoomBrief(level: LevelConfig): RoomBrief {
  const stats = [
    formatCount(level.enemies?.length ?? 0, { one: 'ворог', few: 'вороги', many: 'ворогів' }),
    formatCount(level.powerUps?.length ?? 0, { one: 'апгрейд', few: 'апгрейди', many: 'апгрейдів' }),
    formatCount(level.collectibles?.length ?? 0, { one: 'шестерня', few: 'шестерні', many: 'шестерень' })
  ];

  if ((level.doors?.length ?? 0) > 0) {
    stats.push(formatCount(level.doors?.length ?? 0, { one: 'двері', few: 'двері', many: 'дверей' }));
  }
  if ((level.lasers?.length ?? 0) > 0) {
    stats.push(formatCount(level.lasers?.length ?? 0, { one: 'лазер', few: 'лазери', many: 'лазерів' }));
  }

  return {
    title: `Кімната ${level.id}: ${level.name}`,
    stats,
    warning: level.id >= 10 ? 'Фінальний сектор: грай обережно й користуйся аптечками.' : level.tip
  };
}
