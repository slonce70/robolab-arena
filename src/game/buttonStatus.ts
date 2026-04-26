export type ButtonVisualStatus = {
  color: number;
  emissiveIntensity: number;
  haloOpacity: number;
  scaleY: number;
};

export const BUTTON_IDLE_COLOR = 0xff4b55;
export const BUTTON_ACTIVE_COLOR = 0x7cf27c;

export function describeButtonVisualStatus(active: boolean, elapsed = 0): ButtonVisualStatus {
  if (active) {
    return {
      color: BUTTON_ACTIVE_COLOR,
      emissiveIntensity: 1.35,
      haloOpacity: 0.16,
      scaleY: 0.82
    };
  }

  return {
    color: BUTTON_IDLE_COLOR,
    emissiveIntensity: 1 + Math.max(0, Math.sin(elapsed * 5)) * 0.22,
    haloOpacity: 0.34,
    scaleY: 1
  };
}
