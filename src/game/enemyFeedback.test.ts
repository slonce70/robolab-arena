import { describe, expect, it } from 'vitest';
import { describeEnemyHitFeedback } from './enemyFeedback';

describe('enemy hit feedback', () => {
  it('returns neutral visuals when no hit flash is active', () => {
    expect(describeEnemyHitFeedback(0, false)).toEqual({ emissiveIntensity: 0.55, scale: 1 });
  });

  it('briefly boosts enemy glow and scale after a hit', () => {
    expect(describeEnemyHitFeedback(0.12, false)).toEqual({ emissiveIntensity: 1.64, scale: 1.064 });
  });

  it('clamps timers outside the flash window', () => {
    expect(describeEnemyHitFeedback(-0.1, false)).toEqual({ emissiveIntensity: 0.55, scale: 1 });
    expect(describeEnemyHitFeedback(9, false)).toEqual({ emissiveIntensity: 2, scale: 1.085 });
  });

  it('keeps reduced-motion hit flash calmer', () => {
    expect(describeEnemyHitFeedback(0.12, true).scale).toBeLessThan(describeEnemyHitFeedback(0.12, false).scale);
  });
});
