export type TargetStatus = {
  color: number;
  emissiveIntensity: number;
  scale: number;
  beamOpacity: number;
};

export const TARGET_ACTIVE_COLOR = 0xffd166;
export const TARGET_HIT_COLOR = 0x7cf27c;

export function describeTargetStatus(hit: boolean, elapsed = 0): TargetStatus {
  if (hit) {
    return { color: TARGET_HIT_COLOR, emissiveIntensity: 1.35, scale: 0.74, beamOpacity: 0 };
  }

  return {
    color: TARGET_ACTIVE_COLOR,
    emissiveIntensity: 0.8 + Math.sin(elapsed * 5) * 0.25,
    scale: 1,
    beamOpacity: 0.38
  };
}
