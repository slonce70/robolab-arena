export function canApplyDamage(invulnerableTimer: number, continuous: boolean): boolean {
  return continuous || invulnerableTimer <= 0;
}

export function effectiveDamage(amount: number, shieldActive: boolean): number {
  return shieldActive ? amount * 0.35 : amount;
}
