import type { LevelConfig, Vec2 } from './types';

const ROOM_HALF_WIDTH = 18;
const ROOM_HALF_DEPTH = 24;

export function validateLevel(level: LevelConfig): string[] {
  const failures: string[] = [];

  validatePoint(level, 'playerStart', level.playerStart, failures);
  validatePoint(level, 'exit', level.exit, failures);
  level.targets?.forEach((item, index) => validatePoint(level, `targets[${index}]`, item.position, failures));
  level.enemies?.forEach((item, index) => validatePoint(level, `enemies[${index}]`, item.position, failures));
  level.collectibles?.forEach((item, index) => validatePoint(level, `collectibles[${index}]`, item.position, failures));
  level.buttons?.forEach((item, index) => validatePoint(level, `buttons[${index}]`, item.position, failures));
  level.doors?.forEach((item, index) => validatePoint(level, `doors[${index}]`, item.position, failures));
  level.lasers?.forEach((item, index) => validatePoint(level, `lasers[${index}]`, item.position, failures));
  level.powerUps?.forEach((item, index) => validatePoint(level, `powerUps[${index}]`, item.position, failures));

  level.obstacles?.forEach((item, index) => {
    validatePoint(level, `obstacles[${index}]`, item.position, failures);
    if (item.size.width <= 0 || item.size.depth <= 0) {
      failures.push(`Level ${level.id} obstacle ${index} has invalid size.`);
    }
    if (Math.abs(item.position.x) + item.size.width * 0.5 > ROOM_HALF_WIDTH) {
      failures.push(`Level ${level.id} obstacle ${index} exceeds room width.`);
    }
    if (Math.abs(item.position.z) + item.size.depth * 0.5 > ROOM_HALF_DEPTH) {
      failures.push(`Level ${level.id} obstacle ${index} exceeds room depth.`);
    }
  });

  const doorIds = new Set((level.doors ?? []).map((door) => door.id));
  level.buttons?.forEach((button, index) => {
    const referencedDoorIds = new Set([button.opensDoorId, ...(button.opensDoorIds ?? [])]);
    referencedDoorIds.forEach((doorId) => {
      if (!doorIds.has(doorId)) {
        failures.push(`Level ${level.id} button ${index} references missing door ${doorId}.`);
      }
    });
  });

  return failures;
}

function validatePoint(level: LevelConfig, label: string, point: Vec2, failures: string[]): void {
  if (Math.abs(point.x) > ROOM_HALF_WIDTH || Math.abs(point.z) > ROOM_HALF_DEPTH) {
    failures.push(`Level ${level.id} ${label} is outside the arena.`);
  }
}
