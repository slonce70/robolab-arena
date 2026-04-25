export function robotYawForDirection(x: number, z: number): number {
  if (x * x + z * z < 0.0001) {
    return 0;
  }

  return Math.atan2(-x, -z);
}
