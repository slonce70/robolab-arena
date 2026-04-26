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

export type PlayerProjectileThemeInput = {
  rapidTimer: number;
  overchargeShots: number;
};

export type PlayerProjectileTheme = {
  color: number;
  emissiveIntensity: number;
  radius: number;
};

const CYAN = 0x54f1ff;
const YELLOW = 0xffd166;
const ORANGE = 0xff9f43;

export function getPlayerProjectileTheme(input: PlayerProjectileThemeInput): PlayerProjectileTheme {
  if (input.overchargeShots > 0) {
    return { color: ORANGE, emissiveIntensity: 2.35, radius: 0.23 };
  }
  if (input.rapidTimer > 0) {
    return { color: YELLOW, emissiveIntensity: 1.9, radius: 0.17 };
  }
  return { color: CYAN, emissiveIntensity: 1.6, radius: 0.16 };
}
