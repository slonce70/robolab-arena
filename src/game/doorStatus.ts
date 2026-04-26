import { formatUkrainianCount } from './ukrainianCounts';

export type DoorVisualStatus = {
  targetY: number;
  opacity: number;
  emissiveIntensity: number;
  isPassable: boolean;
};

export function describeDoorVisualStatus(open: boolean): DoorVisualStatus {
  return open
    ? { targetY: 3.2, opacity: 0.34, emissiveIntensity: 0.55, isPassable: true }
    : { targetY: 0, opacity: 0.78, emissiveIntensity: 1.1, isPassable: false };
}

export function describeDoorOpenedToast(openedCount: number): string {
  if (openedCount <= 1) return 'Двері відкрито — шлях вільний.';

  const doors = formatUkrainianCount(openedCount, { one: 'двері', few: 'двері', many: 'дверей' });
  return `Відкрито ${doors} — маршрут вільний.`;
}

export function shouldPlayDoorOpenAudio(openedCount: number): boolean {
  return openedCount > 0;
}
