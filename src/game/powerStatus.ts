export type PowerStatusInput = {
  rapidTimer: number;
  shieldTimer: number;
  overchargeShots: number;
};

export function describePowerStatus(input: PowerStatusInput): string {
  const powers: string[] = [];
  if (input.rapidTimer > 0) powers.push(`Прискорення ${Math.ceil(input.rapidTimer)}с`);
  if (input.shieldTimer > 0) powers.push(`Щит ${Math.ceil(input.shieldTimer)}с`);
  if (input.overchargeShots > 0) powers.push(`Заряд ×${input.overchargeShots}`);

  return powers.length > 0 ? powers.join(' + ') : 'Апгрейди —';
}

export type PowerHud = {
  text: string;
  classes: string[];
};

export function describePowerHud(input: PowerStatusInput): PowerHud {
  const classes = ['status-chip', 'power-chip'];
  if (input.rapidTimer > 0) classes.push('is-rapid');
  if (input.shieldTimer > 0) classes.push('is-shielded');
  if (input.overchargeShots > 0) classes.push('is-overcharged');
  if (isExpiringTimer(input.rapidTimer) || isExpiringTimer(input.shieldTimer)) classes.push('is-expiring');

  return {
    text: describePowerStatus(input),
    classes
  };
}

function isExpiringTimer(seconds: number): boolean {
  return seconds > 0 && seconds <= 2;
}
