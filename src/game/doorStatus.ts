export type DoorVisualStatus = {
  targetY: number;
  opacity: number;
  emissiveIntensity: number;
  isPassable: boolean;
};

export function describeDoorVisualStatus(open: boolean): DoorVisualStatus {
  return open
    ? { targetY: 3.2, opacity: 0.34, emissiveIntensity: 0.55, isPassable: true }
    : { targetY: 0, opacity: 0.78, emissiveIntensity: 1.1, isPassable: false };
}
