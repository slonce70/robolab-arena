import type { LevelObjective } from './types';
import { formatUkrainianCount, type UkrainianCountForms } from './ukrainianCounts';

export type ObjectiveProgress = {
  objective: LevelObjective;
  done: number;
  total: number;
};

export type ObjectiveHud = {
  text: string;
  classes: string[];
};

const TARGET_FORMS: UkrainianCountForms = { one: 'мішені', few: 'мішеней', many: 'мішеней' };
const ENEMY_FORMS: UkrainianCountForms = { one: 'робота', few: 'роботів', many: 'роботів' };
const BUTTON_FORMS: UkrainianCountForms = { one: 'кнопки', few: 'кнопок', many: 'кнопок' };

export function describeObjectiveProgress(progress: ObjectiveProgress): string {
  const done = Math.max(0, Math.ceil(progress.done));
  const total = Math.max(0, Math.ceil(progress.total));

  if (progress.objective === 'targets') return formatObjectiveCounter(done, total, TARGET_FORMS);
  if (progress.objective === 'enemies') return formatObjectiveCounter(done, total, ENEMY_FORMS);
  if (progress.objective === 'buttons') return formatObjectiveCounter(done, total, BUTTON_FORMS);
  if (progress.objective === 'boss') return `ядро боса ${done}%`;
  return 'дійди до виходу';
}

export function describeObjectiveHud(done: boolean): ObjectiveHud {
  return {
    text: done ? 'Ціль виконано. Біжи до зеленого виходу!' : '',
    classes: done ? ['objective-chip', 'is-complete'] : ['objective-chip']
  };
}

function formatObjectiveCounter(done: number, total: number, forms: UkrainianCountForms): string {
  return `${done} з ${formatUkrainianCount(total, forms)}`;
}
