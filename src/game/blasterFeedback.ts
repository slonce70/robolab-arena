export type FirstPersonBlasterInput = {
  flashTimer: number;
  rapidTimer: number;
  overchargeShots: number;
  elapsed: number;
  reducedMotion?: boolean;
};

export type FirstPersonBlasterState = {
  color: number;
  emissiveIntensity: number;
  flashVisible: boolean;
  flashScale: number;
  coilRotationSpeed: number;
  coilScale: number;
  recoilZ: number;
  recoilPitch: number;
};

const CYAN = 0x54f1ff;
const YELLOW = 0xffd166;
const ORANGE = 0xff9f43;

export function describeFirstPersonBlasterState(input: FirstPersonBlasterInput): FirstPersonBlasterState {
  const flashActive = input.flashTimer > 0;
  const overchargeActive = input.overchargeShots > 0;
  const rapidActive = input.rapidTimer > 0;
  const reducedMotion = input.reducedMotion ?? false;
  const kick = flashActive && !reducedMotion ? input.flashTimer / 0.12 : 0;
  const recoilPitch = kick > 0 ? -kick * 0.08 : 0;
  const flashScale = flashActive ? 1 + input.flashTimer * (reducedMotion ? 5 : overchargeActive ? 14 : 10) : 1;
  const coilScale = reducedMotion
    ? overchargeActive || rapidActive ? 1.08 : 1
    : overchargeActive ? 1.24 + Math.sin(input.elapsed * 10) * 0.08 : rapidActive ? 1.14 : 1;

  return {
    color: overchargeActive ? ORANGE : rapidActive ? YELLOW : CYAN,
    emissiveIntensity: overchargeActive ? 2.6 : rapidActive ? 2.1 : 1.5,
    flashVisible: flashActive,
    flashScale,
    coilRotationSpeed: rapidActive ? 16 : 7,
    coilScale,
    recoilZ: kick * 0.08,
    recoilPitch
  };
}
