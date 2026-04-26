export const EXIT_OPEN_COLOR = 0x7cf27c;
export const EXIT_LOCKED_COLOR = 0xff9f43;

export type ExitPadStatus = {
  color: number;
  emissiveIntensity: number;
  scale: number;
  hint: 'locked' | 'open';
  label: string;
};

export function describeExitPadStatus(objectiveComplete: boolean, elapsed = 0): ExitPadStatus {
  if (objectiveComplete) {
    return {
      color: EXIT_OPEN_COLOR,
      emissiveIntensity: 1.35 + Math.sin(elapsed * 6) * 0.18,
      scale: 1.08 + Math.sin(elapsed * 6) * 0.04,
      hint: 'open',
      label: 'ВИХІД'
    };
  }

  return {
    color: EXIT_LOCKED_COLOR,
    emissiveIntensity: 0.48,
    scale: 0.94,
    hint: 'locked',
    label: 'ЗАЧИНЕНО'
  };
}
