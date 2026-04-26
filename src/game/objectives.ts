import type { LevelObjective } from './types';

export type ObjectiveProgress = {
  objective: LevelObjective;
  done: number;
  total: number;
};

export type ObjectiveHud = {
  text: string;
  classes: string[];
};

export function describeObjectiveProgress(progress: ObjectiveProgress): string {
  const done = Math.max(0, Math.ceil(progress.done));
  const total = Math.max(0, Math.ceil(progress.total));

  if (progress.objective === 'targets') return `${done}/${total} мішеней`;
  if (progress.objective === 'enemies') return `${done}/${total} роботів`;
  if (progress.objective === 'buttons') return `${done}/${total} кнопки`;
  if (progress.objective === 'boss') return `ядро боса ${done}%`;
  return 'дійди до виходу';
}

export function describeObjectiveHud(done: boolean): ObjectiveHud {
  return {
    text: done ? 'Ціль виконано. Біжи до зеленого виходу!' : '',
    classes: done ? ['objective-chip', 'is-complete'] : ['objective-chip']
  };
}
