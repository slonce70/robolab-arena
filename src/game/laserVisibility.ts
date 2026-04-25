export type LaserVisibilityState = {
  groupVisible: boolean;
  beamVisible: boolean;
  postVisible: boolean;
  warningOpacity: number;
};

export function describeLaserVisibility(active: boolean): LaserVisibilityState {
  return {
    groupVisible: true,
    beamVisible: active,
    postVisible: active,
    warningOpacity: active ? 0.32 : 0.16
  };
}
