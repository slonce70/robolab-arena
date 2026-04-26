import type { Difficulty } from './storage';

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'normal', 'hard'];
const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Легко',
  normal: 'Нормально',
  hard: 'Важко'
};

export function getDifficultyLabel(difficulty: Difficulty): string {
  return DIFFICULTY_LABELS[difficulty];
}

export function nextDifficulty(difficulty: Difficulty): Difficulty {
  const current = DIFFICULTY_ORDER.indexOf(difficulty);
  return DIFFICULTY_ORDER[(current + 1) % DIFFICULTY_ORDER.length];
}
