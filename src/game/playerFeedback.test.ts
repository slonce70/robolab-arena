import { describe, expect, it } from 'vitest';
import { describeHealthHud, describePlayerFeedback, shouldPlayLaserContactAudio } from './playerFeedback';

const baseState = {
  health: 100,
  maxHealth: 100,
  invulnerableTimer: 0,
  laserContactTimer: 0,
  shieldTimer: 0
};

describe('player feedback vignette state', () => {
  it('stays hidden when the player is safe and unshielded', () => {
    expect(describePlayerFeedback(baseState)).toEqual({
      classes: ['feedback-vignette'],
      opacity: 0,
      intensity: 0
    });
  });

  it('uses distinct classes for bullet damage, laser contact, and shield glow', () => {
    const feedback = describePlayerFeedback({
      ...baseState,
      invulnerableTimer: 0.45,
      laserContactTimer: 0.09,
      shieldTimer: 4
    });

    expect(feedback.classes).toEqual(expect.arrayContaining(['is-damaged', 'is-lasered', 'is-shielded']));
    expect(feedback.opacity).toBeGreaterThan(0.5);
  });

  it('keeps a low-health edge warning even between hits', () => {
    const feedback = describePlayerFeedback({ ...baseState, health: 24 });

    expect(feedback.classes).toContain('is-critical');
    expect(feedback.opacity).toBe(0.22);
  });

  it('marks the health chip critical and shielded without changing the readable energy text', () => {
    expect(describeHealthHud({ health: 24, maxHealth: 100, shieldTimer: 4 })).toEqual({
      text: 'Енергія 24',
      classes: ['status-chip', 'health-chip', 'is-critical', 'is-shielded']
    });
  });

  it('throttles continuous laser audio while the contact flash is still active', () => {
    expect(shouldPlayLaserContactAudio(0)).toBe(true);
    expect(shouldPlayLaserContactAudio(0.01)).toBe(false);
    expect(shouldPlayLaserContactAudio(0.18)).toBe(false);
  });
});
