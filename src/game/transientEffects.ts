import type { PowerUpKind } from './types';

export type PickupBurst = {
  sparkScale: number;
  ringScale: number;
  ringCount: number;
};

const BURSTS: Record<PowerUpKind, PickupBurst> = {
  repair: { sparkScale: 1.1, ringScale: 1.05, ringCount: 1 },
  rapid: { sparkScale: 1.24, ringScale: 1.22, ringCount: 2 },
  shield: { sparkScale: 1.34, ringScale: 1.32, ringCount: 2 },
  overcharge: { sparkScale: 1.52, ringScale: 1.48, ringCount: 3 }
};

export function describePickupBurst(kind: PowerUpKind, reducedMotion = false): PickupBurst {
  const burst = BURSTS[kind];
  if (!reducedMotion) return burst;

  return {
    sparkScale: Number((burst.sparkScale * 0.74).toFixed(2)),
    ringScale: Number((burst.ringScale * 0.78).toFixed(2)),
    ringCount: 1
  };
}
