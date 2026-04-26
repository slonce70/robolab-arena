export type PlayerFeedbackInput = {
  health: number;
  maxHealth: number;
  invulnerableTimer: number;
  laserContactTimer: number;
  shieldTimer: number;
};

export type PlayerFeedbackState = {
  classes: string[];
  opacity: number;
  intensity: number;
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export type HealthHudInput = {
  health: number;
  maxHealth: number;
  shieldTimer: number;
};

export type HealthHudState = {
  text: string;
  classes: string[];
};

export function describeHealthHud(input: HealthHudInput): HealthHudState {
  const health = Math.max(0, Math.ceil(input.health));
  const healthRatio = input.maxHealth > 0 ? clamp01(input.health / input.maxHealth) : 0;
  const classes = ['status-chip', 'health-chip'];

  if (healthRatio > 0 && healthRatio <= 0.3) classes.push('is-critical');
  if (input.shieldTimer > 0) classes.push('is-shielded');

  return {
    text: `Енергія ${health}`,
    classes
  };
}

export function describePlayerFeedback(input: PlayerFeedbackInput): PlayerFeedbackState {
  const healthRatio = input.maxHealth > 0 ? clamp01(input.health / input.maxHealth) : 0;
  const bulletHit = clamp01(input.invulnerableTimer / 0.45);
  const laserHit = clamp01(input.laserContactTimer / 0.18);
  const shield = input.shieldTimer > 0 ? 0.3 : 0;
  const critical = healthRatio > 0 && healthRatio <= 0.3 ? 0.22 : 0;
  const intensity = Math.max(bulletHit, laserHit, shield, critical);
  const classes = ['feedback-vignette'];

  if (input.shieldTimer > 0) classes.push('is-shielded');
  if (critical > 0) classes.push('is-critical');
  if (bulletHit > 0) classes.push('is-damaged');
  if (laserHit > 0) classes.push('is-lasered');

  return {
    classes,
    opacity: Number(Math.min(0.72, intensity).toFixed(2)),
    intensity: Number(intensity.toFixed(2))
  };
}

export function shouldPlayLaserContactAudio(laserContactTimer: number): boolean {
  return laserContactTimer <= 0;
}
