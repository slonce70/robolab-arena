import { formatUkrainianCount } from './ukrainianCounts';

export type VictoryOverlayIntroInput = {
  completedRooms: number;
  totalRooms: number;
  gears: number;
  score: number;
};

export function formatVictoryOverlayIntro(input: VictoryOverlayIntroInput): string {
  const completedRooms = Math.max(0, Math.floor(input.completedRooms));
  const totalRooms = Math.max(1, Math.floor(input.totalRooms));
  const gears = Math.max(0, Math.floor(input.gears));
  const score = Math.max(0, Math.floor(input.score));
  const gearText = formatUkrainianCount(gears, { one: 'шестерню', few: 'шестерні', many: 'шестерень' });

  if (completedRooms >= totalRooms) {
    return `Бліц пройшов усі ${totalRooms} кімнат, зібрав ${gearText} і набрав ${score} очок.`;
  }

  return `Бліц завершив фінальний відрізок: ${completedRooms} з ${totalRooms} кімнат, ${gearText} і ${score} очок.`;
}
