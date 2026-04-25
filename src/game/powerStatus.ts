export type PowerStatusInput = {
  rapidTimer: number;
  shieldTimer: number;
  overchargeShots: number;
};

export function describePowerStatus(input: PowerStatusInput): string {
  const powers: string[] = [];
  if (input.rapidTimer > 0) powers.push(`Прискорення ${Math.ceil(input.rapidTimer)}с`);
  if (input.shieldTimer > 0) powers.push(`Щит ${Math.ceil(input.shieldTimer)}с`);
  if (input.overchargeShots > 0) powers.push(`Заряд x${input.overchargeShots}`);

  return powers.length > 0 ? powers.join(' + ') : 'Апгрейди -';
}
