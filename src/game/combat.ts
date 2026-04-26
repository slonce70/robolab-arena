import type { Difficulty } from './storage';
import { getIncomingDamageMultiplier } from './difficulty';

export function canApplyDamage(invulnerableTimer: number, continuous: boolean): boolean {
  return continuous || invulnerableTimer <= 0;
}

export function effectiveDamage(amount: number, shieldActive: boolean, difficulty: Difficulty = 'normal'): number {
  const shieldedDamage = shieldActive ? amount * 0.35 : amount;
  return shieldedDamage * getIncomingDamageMultiplier(difficulty);
}
