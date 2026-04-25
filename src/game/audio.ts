import { getSoundProfile, type SoundName, type SoundTone } from './audioProfiles';

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
    for (const tone of getSoundProfile(name)) {
      this.playTone(tone, now);
    }
  }

  private playTone(tone: SoundTone, now: number): void {
    if (!this.context) return;
    const start = now + tone.delay;
    const end = start + tone.duration;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = tone.type;
    oscillator.frequency.setValueAtTime(tone.frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, tone.endFrequency), end);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(tone.peakGain, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
