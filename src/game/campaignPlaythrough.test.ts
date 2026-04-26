import { describe, expect, it } from 'vitest';
import { DOOR_SOLID_HALF_DEPTH, DOOR_SOLID_HALF_WIDTH, pointHitsBox } from './collision';
import { LEVELS } from './levels';
import type { LevelConfig, Vec2 } from './types';

const ROOM_HALF_WIDTH = 18;
const ROOM_HALF_DEPTH = 24;
const PLAYER_RADIUS = 0.55;
const STEP = 0.5;

type PlaySolid = {
  position: Vec2;
  halfWidth: number;
  halfDepth: number;
};

describe('campaign manual-play path safety', () => {
  it('keeps every room completable from start to objective to exit', () => {
    const failures = LEVELS.flatMap(validateLevelRoute);

    expect(failures).toEqual([]);
  }, 15000);
});

function validateLevelRoute(level: LevelConfig): string[] {
  const closedSolids = levelSolids(level, true);
  const openSolids = levelSolids(level, false);
  const closedReachable = reachableCells(level.playerStart, closedSolids);
  const openReachable = reachableCells(level.playerStart, openSolids);
  const failures: string[] = [];

  for (const point of requiredClosedDoorInteractions(level)) {
    if (!hasReachableStandingPoint(point, closedReachable, closedSolids)) {
      failures.push(`Level ${level.id} required interaction at (${point.x}, ${point.z}) cannot be reached before doors open.`);
    }
  }

  for (const point of requiredOpenDoorInteractions(level)) {
    if (!hasReachableStandingPoint(point, openReachable, openSolids)) {
      failures.push(`Level ${level.id} required interaction at (${point.x}, ${point.z}) cannot be reached after doors open.`);
    }
  }

  for (const enemy of requiredEnemyEngagements(level)) {
    const engagementPoints = getEnemyEngagementPoints(enemy.position);
    const reachableEngagement = engagementPoints.some((point) => hasReachableStandingPoint(point, openReachable, openSolids) && hasLineOfFire(point, enemy.position, openSolids));
    if (!reachableEngagement) {
      failures.push(`Level ${level.id} enemy at (${enemy.position.x}, ${enemy.position.z}) has no reachable engagement point after doors open.`);
    }
  }

  for (const point of optionalSupportPickups(level)) {
    if (!hasReachableStandingPoint(point, closedReachable, closedSolids)) {
      failures.push(`Level ${level.id} support pickup at (${point.x}, ${point.z}) cannot be reached before doors open.`);
    }
  }

  if (!hasReachableStandingPoint(level.exit, openReachable, openSolids)) {
    failures.push(`Level ${level.id} exit cannot be reached after objective completion.`);
  }

  return failures;
}

function optionalSupportPickups(level: LevelConfig): Vec2[] {
  return [
    ...(level.collectibles ?? []).map((collectible) => collectible.position),
    ...(level.powerUps ?? []).map((powerUp) => powerUp.position)
  ];
}

function requiredClosedDoorInteractions(level: LevelConfig): Vec2[] {
  if (level.objective === 'buttons') return (level.buttons ?? []).map((button) => button.position);
  return [];
}

function requiredOpenDoorInteractions(level: LevelConfig): Vec2[] {
  if (level.objective === 'targets') return (level.targets ?? []).map((target) => target.position);
  return [];
}

function requiredEnemyEngagements(level: LevelConfig): { position: Vec2 }[] {
  if (level.objective === 'enemies' || level.objective === 'boss') return level.enemies ?? [];
  return [];
}

function getEnemyEngagementPoints(position: Vec2): Vec2[] {
  return [
    { x: position.x + 2.2, z: position.z },
    { x: position.x - 2.2, z: position.z },
    { x: position.x, z: position.z + 2.2 },
    { x: position.x, z: position.z - 2.2 }
  ];
}

function levelSolids(level: LevelConfig, includeClosedDoors: boolean): PlaySolid[] {
  const obstacles = (level.obstacles ?? []).map((obstacle) => ({
    position: obstacle.position,
    halfWidth: obstacle.size.width * 0.5,
    halfDepth: obstacle.size.depth * 0.5
  }));

  if (!includeClosedDoors) return obstacles;

  const doors = (level.doors ?? []).map((door) => ({
    position: door.position,
    halfWidth: DOOR_SOLID_HALF_WIDTH,
    halfDepth: DOOR_SOLID_HALF_DEPTH
  }));

  return [...obstacles, ...doors];
}

function reachableCells(start: Vec2, solids: PlaySolid[]): Set<string> {
  const queue = [toCell(start)];
  const seen = new Set<string>([cellKey(queue[0])]);

  while (queue.length > 0) {
    const cell = queue.shift();
    if (!cell) break;

    for (const next of neighbors(cell)) {
      const key = cellKey(next);
      if (seen.has(key)) continue;
      const point = fromCell(next);
      if (!isWalkable(point, solids)) continue;
      seen.add(key);
      queue.push(next);
    }
  }

  return seen;
}

function hasReachableStandingPoint(point: Vec2, reachable: Set<string>, solids: PlaySolid[]): boolean {
  const candidateRadius = 1.15;
  for (let dx = -candidateRadius; dx <= candidateRadius; dx += STEP) {
    for (let dz = -candidateRadius; dz <= candidateRadius; dz += STEP) {
      const candidate = { x: point.x + dx, z: point.z + dz };
      if (distance(candidate, point) > candidateRadius) continue;
      if (!isWalkable(candidate, solids)) continue;
      if (reachable.has(cellKey(toCell(candidate)))) return true;
    }
  }
  return false;
}

function hasLineOfFire(from: Vec2, to: Vec2, solids: PlaySolid[]): boolean {
  const distanceToTarget = distance(from, to);
  const samples = Math.max(1, Math.ceil(distanceToTarget / 0.25));
  for (let step = 1; step < samples; step += 1) {
    const progress = step / samples;
    const point = {
      x: from.x + (to.x - from.x) * progress,
      z: from.z + (to.z - from.z) * progress
    };
    if (!isWalkable(point, solids)) return false;
  }
  return true;
}

function isWalkable(point: Vec2, solids: PlaySolid[]): boolean {
  if (Math.abs(point.x) > ROOM_HALF_WIDTH - PLAYER_RADIUS || Math.abs(point.z) > ROOM_HALF_DEPTH - PLAYER_RADIUS) return false;
  return solids.every((solid) => !pointHitsBox(point, solid, PLAYER_RADIUS));
}

function neighbors(cell: Vec2): Vec2[] {
  return [
    { x: cell.x + 1, z: cell.z },
    { x: cell.x - 1, z: cell.z },
    { x: cell.x, z: cell.z + 1 },
    { x: cell.x, z: cell.z - 1 }
  ];
}

function toCell(point: Vec2): Vec2 {
  return {
    x: Math.round(point.x / STEP),
    z: Math.round(point.z / STEP)
  };
}

function fromCell(cell: Vec2): Vec2 {
  return {
    x: cell.x * STEP,
    z: cell.z * STEP
  };
}

function cellKey(cell: Vec2): string {
  return `${cell.x},${cell.z}`;
}

function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}
