export const MOUSE_SENSITIVITY_STEPS = [0.6, 0.8, 1, 1.2, 1.5, 2] as const;

export type SensitivityDirection = 'down' | 'up';

export function stepMouseSensitivity(current: number, direction: SensitivityDirection): number {
  const normalized = Number.isFinite(current) ? current : 1;
  if (direction === 'up') {
    const next = MOUSE_SENSITIVITY_STEPS.find((value) => value > normalized + 0.01);
    return next ?? MOUSE_SENSITIVITY_STEPS[MOUSE_SENSITIVITY_STEPS.length - 1];
  }

  const previous = [...MOUSE_SENSITIVITY_STEPS].reverse().find((value) => value < normalized - 0.01);
  return previous ?? MOUSE_SENSITIVITY_STEPS[0];
}
