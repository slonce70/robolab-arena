import { describe, expect, it } from 'vitest';
import { canApplyDamage, effectiveDamage } from './combat';

describe('combat damage rules', () => {
  it('lets laser-style continuous damage apply immediately during invulnerability', () => {
    expect(canApplyDamage(0.4, true)).toBe(true);
  });

  it('keeps bullet-style burst damage blocked during invulnerability', () => {
    expect(canApplyDamage(0.4, false)).toBe(false);
  });

  it('reduces damage while shield is active', () => {
    expect(effectiveDamage(40, true)).toBeCloseTo(14);
  });

  it('scales incoming damage by selected difficulty while preserving normal balance', () => {
    expect(effectiveDamage(50, false, 'normal')).toBe(50);
    expect(effectiveDamage(50, false, 'easy')).toBe(40);
    expect(effectiveDamage(50, false, 'hard')).toBe(60);
    expect(effectiveDamage(50, true, 'easy')).toBeCloseTo(14);
  });
});
