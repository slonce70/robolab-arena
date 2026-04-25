export type FirstPersonBlasterInput = {
  flashTimer: number;
  rapidTimer: number;
  overchargeShots: number;
  elapsed: number;
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
  const kick = flashActive ? input.flashTimer / 0.12 : 0;
  const recoilPitch = kick > 0 ? -kick * 0.08 : 0;

  return {
    color: overchargeActive ? ORANGE : rapidActive ? YELLOW : CYAN,
    emissiveIntensity: overchargeActive ? 2.6 : rapidActive ? 2.1 : 1.5,
    flashVisible: flashActive,
    flashScale: flashActive ? 1 + input.flashTimer * (overchargeActive ? 14 : 10) : 1,
    coilRotationSpeed: rapidActive ? 16 : 7,
    coilScale: overchargeActive ? 1.24 + Math.sin(input.elapsed * 10) * 0.08 : rapidActive ? 1.14 : 1,
    recoilZ: kick * 0.08,
    recoilPitch
  };
}
