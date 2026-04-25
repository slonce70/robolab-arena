import { describe, expect, it } from 'vitest';
import { robotYawForDirection } from './math';

describe('robotYawForDirection', () => {
  it('faces toward the lab exit when moving forward on the screen', () => {
    expect(robotYawForDirection(0, -1)).toBeCloseTo(0);
  });

  it('turns the visible robot face toward the right side of the arena', () => {
    expect(robotYawForDirection(1, 0)).toBeCloseTo(-Math.PI / 2);
  });

  it('turns around when aiming back toward the player start', () => {
    expect(Math.abs(robotYawForDirection(0, 1))).toBeCloseTo(Math.PI);
  });
});
