import type { LevelConfig } from './types';

export type RoomBrief = {
  title: string;
  stats: string[];
  warning: string;
};

export function createRoomBrief(level: LevelConfig): RoomBrief {
  const stats = [
    `${level.enemies?.length ?? 0} ворогів`,
    `${level.powerUps?.length ?? 0} апгрейдів`,
    `${level.collectibles?.length ?? 0} шестерень`
  ];

  if ((level.doors?.length ?? 0) > 0) stats.push(`${level.doors?.length ?? 0} дверей`);
  if ((level.lasers?.length ?? 0) > 0) stats.push(`${level.lasers?.length ?? 0} лазери`);

  return {
    title: `Кімната ${level.id}: ${level.name}`,
    stats,
    warning: level.id >= 10 ? 'Фінальний сектор: грай обережно й користуйся аптечками.' : level.tip
  };
}
