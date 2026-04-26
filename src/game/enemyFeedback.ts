export type EnemyHitFeedback = {
  emissiveIntensity: number;
  scale: number;
};

export type BeetleContactWarning = {
  opacity: number;
  scale: number;
};

const BASE_EMISSIVE_INTENSITY = 0.55;
const HIT_FLASH_WINDOW = 0.16;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function describeEnemyHitFeedback(hitTimer: number, reducedMotion = false): EnemyHitFeedback {
  const intensity = clamp01(hitTimer / HIT_FLASH_WINDOW);
  if (intensity <= 0) return { emissiveIntensity: BASE_EMISSIVE_INTENSITY, scale: 1 };

  const scaleBoost = reducedMotion ? 0.035 : 0.085;
  return {
    emissiveIntensity: Number((BASE_EMISSIVE_INTENSITY + intensity * 1.45).toFixed(2)),
    scale: Number((1 + intensity * scaleBoost).toFixed(3))
  };
}

export function describeBeetleContactWarning(elapsed: number, reducedMotion = false): BeetleContactWarning {
  const motionScale = reducedMotion ? 0.04 : 0.08;
  const pulse = Math.max(0, Math.sin(elapsed * 6));

  return {
    opacity: Number((0.34 + pulse * 0.1).toFixed(2)),
    scale: Number((1.08 + pulse * motionScale).toFixed(3))
  };
}
