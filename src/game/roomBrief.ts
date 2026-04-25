import type { LevelConfig } from './types';
import { formatUkrainianCount } from './ukrainianCounts';

export type RoomBrief = {
  title: string;
  stats: string[];
  warning: string;
};

export function createRoomBrief(level: LevelConfig): RoomBrief {
  const stats = [
    formatUkrainianCount(level.enemies?.length ?? 0, { one: 'ворог', few: 'вороги', many: 'ворогів' }),
    formatUkrainianCount(level.powerUps?.length ?? 0, { one: 'апгрейд', few: 'апгрейди', many: 'апгрейдів' }),
    formatUkrainianCount(level.collectibles?.length ?? 0, { one: 'шестерня', few: 'шестерні', many: 'шестерень' })
  ];

  if ((level.doors?.length ?? 0) > 0) {
    stats.push(formatUkrainianCount(level.doors?.length ?? 0, { one: 'двері', few: 'двері', many: 'дверей' }));
  }
  if ((level.lasers?.length ?? 0) > 0) {
    stats.push(formatUkrainianCount(level.lasers?.length ?? 0, { one: 'лазер', few: 'лазери', many: 'лазерів' }));
  }

  return {
    title: `Кімната ${level.id}: ${level.name}`,
    stats,
    warning: level.id >= 10 ? 'Фінальний сектор: грай обережно й користуйся аптечками.' : level.tip
  };
}
