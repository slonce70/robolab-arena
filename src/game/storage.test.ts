import { describe, expect, it, vi } from 'vitest';
import { loadSettings, saveSettings } from './storage';

describe('RoboLab storage', () => {
  it('falls back to defaults when saved JSON is broken', () => {
    const storage = {
      getItem: vi.fn(() => '{broken'),
      setItem: vi.fn()
    } as unknown as Storage;

    expect(loadSettings(storage)).toEqual({
      bestScore: 0,
      highestUnlockedRoom: 1,
      preferredCameraMode: 'thirdPerson',
      reducedMotion: false,
      soundOn: true
    });
  });

  it('persists a partial update while keeping defaults', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => values.set(key, value))
    } as unknown as Storage;

    saveSettings({ bestScore: 900, soundOn: false }, storage);

    expect(loadSettings(storage)).toMatchObject({ bestScore: 900, soundOn: false, highestUnlockedRoom: 1 });
  });
});
