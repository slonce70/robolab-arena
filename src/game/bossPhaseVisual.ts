export type BossPhaseVisual = {
  coreColor: number;
  emissiveIntensity: number;
  coreScale: number;
  crownRotationSpeed: number;
};

type BossPhaseIndex = 1 | 2 | 3;

const PHASE_VISUALS: Record<BossPhaseIndex, { coreColor: number; emissiveIntensity: number; baseScale: number; pulse: number; crownRotationSpeed: number }> = {
  1: { coreColor: 0xff4b55, emissiveIntensity: 1.3, baseScale: 1.05, pulse: 0.06, crownRotationSpeed: 1.6 },
  2: { coreColor: 0xff9f43, emissiveIntensity: 1.8, baseScale: 1.16, pulse: 0.09, crownRotationSpeed: 2.05 },
  3: { coreColor: 0xff4fa3, emissiveIntensity: 2.35, baseScale: 1.28, pulse: 0.12, crownRotationSpeed: 2.65 }
};

export function describeBossPhaseVisual(phaseIndex: BossPhaseIndex, elapsed: number, reducedMotion = false): BossPhaseVisual {
  const visual = PHASE_VISUALS[phaseIndex];
  const motionScale = reducedMotion ? 0.5 : 1;
  const pulse = Math.sin(elapsed * (5 + phaseIndex)) * visual.pulse * motionScale;

  return {
    coreColor: visual.coreColor,
    emissiveIntensity: Number((visual.emissiveIntensity * (reducedMotion ? 0.86 : 1)).toFixed(2)),
    coreScale: Number((visual.baseScale + pulse).toFixed(3)),
    crownRotationSpeed: Number((visual.crownRotationSpeed * motionScale).toFixed(3))
  };
}
