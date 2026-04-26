import { describe, expect, it } from 'vitest';
import { describeEnemyHitFeedback } from './enemyFeedback';

describe('enemy hit feedback', () => {
  it('returns neutral visuals when no hit flash is active', () => {
    expect(describeEnemyHitFeedback(0, false)).toEqual({ emissiveIntensity: 0.55, scale: 1 });
  });

  it('briefly boosts enemy glow and scale after a hit', () => {
    const feedback = describeEnemyHitFeedback(0.12, false);

    expect(feedback.emissiveIntensity).toBeGreaterThan(0.55);
    expect(feedback.scale).toBeGreaterThan(1);
  });

  it('keeps reduced-motion hit flash calmer', () => {
    expect(describeEnemyHitFeedback(0.12, true).scale).toBeLessThan(describeEnemyHitFeedback(0.12, false).scale);
  });
});
