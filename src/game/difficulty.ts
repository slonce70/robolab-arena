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

export function getIncomingDamageMultiplier(difficulty: Difficulty): number {
  if (difficulty === 'easy') return 0.8;
  if (difficulty === 'hard') return 1.2;
  return 1;
}

export function getEnemyPacingMultiplier(difficulty: Difficulty): number {
  if (difficulty === 'easy') return 0.9;
  if (difficulty === 'hard') return 1.1;
  return 1;
}

export function scaleEnemyPacingDelta(delta: number, difficulty: Difficulty): number {
  return delta * getEnemyPacingMultiplier(difficulty);
}

export function describeDifficultyChange(difficulty: Difficulty): string {
  if (difficulty === 'easy') return 'Складність: Легко. Урон ворогів нижчий, темп спокійніший.';
  if (difficulty === 'hard') return 'Складність: Важко. Урон ворогів вищий, темп швидший.';
  return 'Складність: Нормально. Базовий баланс.';
}
