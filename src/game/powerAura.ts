export type PowerAuraState = {
  visible: boolean;
  rotationSpeed: number;
  scale: number;
  opacityMultiplier: number;
};

export function describePowerAuraState(active: boolean, baseSpeed: number, elapsed: number, index = 0, reducedMotion = false, expiring = false): PowerAuraState {
  if (!active) {
    return { visible: false, rotationSpeed: 0, scale: 1, opacityMultiplier: 0 };
  }

  const motionScale = reducedMotion ? 0.55 : 1;
  const pulseAmount = reducedMotion ? 0.025 : 0.07;
  return {
    visible: true,
    rotationSpeed: baseSpeed * motionScale,
    scale: Number((1 + Math.sin(elapsed * (reducedMotion ? 5 : 9) + index) * pulseAmount).toFixed(3)),
    opacityMultiplier: expiring ? 1.32 : 1
  };
}
