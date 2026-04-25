import type { PowerUpKind } from './types';

export type EffectTheme = {
  color: number;
  emissiveIntensity: number;
  pulseScale: number;
};

const POWER_EFFECT_THEMES: Record<PowerUpKind, EffectTheme> = {
  repair: { color: 0x7cf27c, emissiveIntensity: 1.7, pulseScale: 1.15 },
  rapid: { color: 0xffd166, emissiveIntensity: 1.85, pulseScale: 1.25 },
  shield: { color: 0x54f1ff, emissiveIntensity: 1.95, pulseScale: 1.35 },
  overcharge: { color: 0xff9f43, emissiveIntensity: 2.15, pulseScale: 1.45 }
};

export function getPowerEffectTheme(kind: PowerUpKind): EffectTheme {
  return POWER_EFFECT_THEMES[kind];
}
