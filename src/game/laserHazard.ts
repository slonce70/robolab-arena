import type { LaserConfig, Vec2 } from './types';

const LASER_DAMAGE_HALF_WIDTH = 0.35;
const LASER_WARNING_HALF_WIDTH = 0.36;

export type LaserHazardFootprint = {
  width: number;
  depth: number;
};

export function getLaserHazardFootprint(config: LaserConfig): LaserHazardFootprint {
  const sweepWidth = config.sweep?.distance ?? 0;
  const warningWidth = (LASER_WARNING_HALF_WIDTH + sweepWidth) * 2;

  return config.axis === 'x'
    ? { width: config.length, depth: warningWidth }
    : { width: warningWidth, depth: config.length };
}

export function getLaserDangerClearance(point: Vec2, config: LaserConfig): number {
  const sweepDistance = config.sweep?.distance ?? 0;
  const halfWidth = config.axis === 'x'
    ? config.length * 0.5
    : LASER_DAMAGE_HALF_WIDTH + sweepDistance;
  const halfDepth = config.axis === 'x'
    ? LASER_DAMAGE_HALF_WIDTH + sweepDistance
    : config.length * 0.5;
  const clearanceX = Math.abs(point.x - config.position.x) - halfWidth;
  const clearanceZ = Math.abs(point.z - config.position.z) - halfDepth;

  if (clearanceX <= 0 && clearanceZ <= 0) {
    return Math.max(clearanceX, clearanceZ);
  }

  return Math.hypot(Math.max(clearanceX, 0), Math.max(clearanceZ, 0));
}

export function isPointInLaserDamage(point: Vec2, laserPosition: Vec2, config: LaserConfig): boolean {
  const localX = point.x - laserPosition.x;
  const localZ = point.z - laserPosition.z;

  return config.axis === 'x'
    ? Math.abs(localZ) < LASER_DAMAGE_HALF_WIDTH && Math.abs(localX) < config.length * 0.5
    : Math.abs(localX) < LASER_DAMAGE_HALF_WIDTH && Math.abs(localZ) < config.length * 0.5;
}
