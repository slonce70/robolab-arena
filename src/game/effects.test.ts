import { describe, expect, it } from 'vitest';
import { getPowerEffectTheme } from './effects';
import type { PowerUpKind } from './types';

describe('power effect themes', () => {
  it('gives shield, rapid, repair, and overcharge distinct visual identities', () => {
    const kinds: PowerUpKind[] = ['repair', 'rapid', 'shield', 'overcharge'];
    const colors = new Set(kinds.map((kind) => getPowerEffectTheme(kind).color));

    expect(colors.size).toBe(4);
    expect(getPowerEffectTheme('shield').color).toBe(0x54f1ff);
    expect(getPowerEffectTheme('rapid').color).toBe(0xffd166);
    expect(getPowerEffectTheme('overcharge').emissiveIntensity).toBeGreaterThan(getPowerEffectTheme('repair').emissiveIntensity);
  });
});
