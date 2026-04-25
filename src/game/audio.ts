type SoundName = 'shot' | 'hit' | 'pickup' | 'door' | 'laser' | 'dash' | 'boss' | 'victory';

const SOUND_FREQUENCIES: Record<SoundName, number> = {
  shot: 520,
  hit: 180,
  pickup: 760,
  door: 310,
  laser: 120,
  dash: 680,
  boss: 92,
  victory: 880
};

export class AudioManager {
  private context?: AudioContext;
  private enabled = true;
  private unlocked = false;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  async unlock(): Promise<void> {
    if (this.unlocked || typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextClass) return;
    this.context = new AudioContextClass();
    await this.context.resume();
    this.unlocked = true;
  }

  play(name: SoundName): void {
    if (!this.enabled || !this.context || !this.unlocked) return;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = name === 'laser' || name === 'boss' ? 'sawtooth' : 'triangle';
    oscillator.frequency.setValueAtTime(SOUND_FREQUENCIES[name], now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(60, SOUND_FREQUENCIES[name] * 0.55), now + 0.12);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(name === 'boss' ? 0.12 : 0.06, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.2);
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
