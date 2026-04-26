export type WeaponFeedbackInput = {
  visible: boolean;
  flashTimer: number;
  hitTimer: number;
  rapidTimer: number;
  overchargeShots: number;
};

export function getCrosshairClasses(input: WeaponFeedbackInput): string[] {
  const classes = ['crosshair'];
  if (input.visible) classes.push('is-visible');
  if (input.flashTimer > 0) classes.push('is-firing');
  if (input.hitTimer > 0) classes.push('is-hit-confirmed');
  if (input.rapidTimer > 0) classes.push('is-rapid');
  if (input.overchargeShots > 0) classes.push('is-overcharged');
  return classes;
}
