import type { Vec2 } from './types';

export type SolidBox = {
  position: Vec2;
  halfWidth: number;
  halfDepth: number;
};

export type DoorSolidBox = SolidBox & {
  open: boolean;
};

export function pointHitsSolid(point: Vec2, obstacles: SolidBox[], doors: DoorSolidBox[], radius = 0.18): boolean {
  return obstacles.some((obstacle) => pointHitsBox(point, obstacle, radius)) || doors.some((door) => !door.open && pointHitsBox(point, door, radius));
}

function pointHitsBox(point: Vec2, box: SolidBox, radius: number): boolean {
  return Math.abs(point.x - box.position.x) < box.halfWidth + radius && Math.abs(point.z - box.position.z) < box.halfDepth + radius;
}
