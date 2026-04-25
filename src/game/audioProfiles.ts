export type SoundName = 'shot' | 'hit' | 'pickup' | 'door' | 'laser' | 'dash' | 'boss' | 'victory';

export type SoundTone = {
  frequency: number;
  endFrequency: number;
  delay: number;
  duration: number;
  peakGain: number;
  type: OscillatorType;
};

const PROFILES: Record<SoundName, SoundTone[]> = {
  shot: [{ frequency: 520, endFrequency: 286, delay: 0, duration: 0.18, peakGain: 0.06, type: 'triangle' }],
  hit: [{ frequency: 180, endFrequency: 99, delay: 0, duration: 0.18, peakGain: 0.06, type: 'triangle' }],
  pickup: [{ frequency: 760, endFrequency: 1050, delay: 0, duration: 0.16, peakGain: 0.055, type: 'triangle' }],
  door: [
    { frequency: 260, endFrequency: 180, delay: 0, duration: 0.16, peakGain: 0.055, type: 'sawtooth' },
    { frequency: 390, endFrequency: 520, delay: 0.06, duration: 0.18, peakGain: 0.04, type: 'triangle' }
  ],
  laser: [{ frequency: 120, endFrequency: 68, delay: 0, duration: 0.14, peakGain: 0.045, type: 'sawtooth' }],
  dash: [{ frequency: 680, endFrequency: 374, delay: 0, duration: 0.17, peakGain: 0.06, type: 'triangle' }],
  boss: [{ frequency: 92, endFrequency: 60, delay: 0, duration: 0.26, peakGain: 0.12, type: 'sawtooth' }],
  victory: [
    { frequency: 660, endFrequency: 740, delay: 0, duration: 0.14, peakGain: 0.055, type: 'triangle' },
    { frequency: 880, endFrequency: 990, delay: 0.12, duration: 0.16, peakGain: 0.06, type: 'triangle' },
    { frequency: 1320, endFrequency: 1480, delay: 0.26, duration: 0.22, peakGain: 0.055, type: 'triangle' }
  ]
};

export function getSoundProfile(name: SoundName): SoundTone[] {
  return PROFILES[name];
}
