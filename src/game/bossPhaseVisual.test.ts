import { describe, expect, it } from 'vitest';
import { describeBossPhaseVisual } from './bossPhaseVisual';

describe('boss phase visual state', () => {
  it('keeps phase one readable but calmer than later phases', () => {
    const visual = describeBossPhaseVisual(1, 0, false);

    expect(visual.coreColor).toBe(0xff4b55);
    expect(visual.emissiveIntensity).toBe(1.3);
    expect(visual.crownRotationSpeed).toBe(1.6);
  });

  it('makes the final phase hotter and more urgent', () => {
    const phaseTwo = describeBossPhaseVisual(2, Math.PI / 8, false);
    const phaseThree = describeBossPhaseVisual(3, Math.PI / 8, false);

    expect(phaseThree.coreColor).toBe(0xff4fa3);
    expect(phaseThree.emissiveIntensity).toBeGreaterThan(phaseTwo.emissiveIntensity);
    expect(phaseThree.crownRotationSpeed).toBeGreaterThan(phaseTwo.crownRotationSpeed);
    expect(phaseThree.coreScale).toBeGreaterThan(phaseTwo.coreScale);
  });

  it('keeps reduced-motion boss phase changes calmer without hiding phase color', () => {
    const normal = describeBossPhaseVisual(3, 1, false);
    const reduced = describeBossPhaseVisual(3, 1, true);

    expect(reduced.coreColor).toBe(normal.coreColor);
    expect(reduced.crownRotationSpeed).toBeLessThan(normal.crownRotationSpeed);
    expect(Math.abs(reduced.coreScale - 1)).toBeLessThan(Math.abs(normal.coreScale - 1));
  });
});
