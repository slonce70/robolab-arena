export type LaserVisibilityState = {
  groupVisible: boolean;
  beamVisible: boolean;
  postVisible: boolean;
  warningOpacity: number;
  warningEmissiveIntensity: number;
};

export const LASER_ACTIVE_THRESHOLD = -0.25;
const LASER_WAVE_MINIMUM = -1;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function roundToHundredths(value: number): number {
  return Number(value.toFixed(2));
}

export function calculateLaserWarningCharge(wave: number): number {
  return clamp01((wave - LASER_WAVE_MINIMUM) / (LASER_ACTIVE_THRESHOLD - LASER_WAVE_MINIMUM));
}

export function describeLaserVisibility(active: boolean, warningCharge = active ? 1 : 0): LaserVisibilityState {
  const safeWarningCharge = clamp01(warningCharge);

  return {
    groupVisible: true,
    beamVisible: active,
    postVisible: active,
    warningOpacity: active ? 0.32 : roundToHundredths(0.16 + safeWarningCharge * 0.12),
    warningEmissiveIntensity: active ? 0.95 : roundToHundredths(0.55 + safeWarningCharge * 0.37)
  };
}
