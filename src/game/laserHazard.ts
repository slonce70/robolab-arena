import type { LaserConfig } from './types';

export type LaserHazardFootprint = {
  width: number;
  depth: number;
};

export function getLaserHazardFootprint(config: LaserConfig): LaserHazardFootprint {
  return config.axis === 'x'
    ? { width: config.length, depth: 0.72 }
    : { width: 0.72, depth: config.length };
}
