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
      mouseSensitivity: 1,
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

  it('persists camera, room unlocks, and reduced-motion preferences safely', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => values.set(key, value))
    } as unknown as Storage;

    saveSettings({ highestUnlockedRoom: 8.8, preferredCameraMode: 'firstPerson', reducedMotion: true }, storage);

    expect(loadSettings(storage)).toMatchObject({
      highestUnlockedRoom: 8,
      preferredCameraMode: 'firstPerson',
      reducedMotion: true
    });
  });

  it('rejects invalid saved camera modes and negative progress', () => {
    const storage = {
      getItem: vi.fn(() => JSON.stringify({ bestScore: -20, highestUnlockedRoom: -3, preferredCameraMode: 'orbit' })),
      setItem: vi.fn()
    } as unknown as Storage;

    expect(loadSettings(storage)).toMatchObject({
      bestScore: 0,
      highestUnlockedRoom: 1,
      preferredCameraMode: 'thirdPerson'
    });
  });

  it('sanitizes mouse sensitivity for pause settings', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: vi.fn((key: string) => values.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => values.set(key, value))
    } as unknown as Storage;

    saveSettings({ mouseSensitivity: 9 }, storage);
    expect(loadSettings(storage).mouseSensitivity).toBe(2);

    saveSettings({ mouseSensitivity: 0.2 }, storage);
    expect(loadSettings(storage).mouseSensitivity).toBe(0.6);
  });
});
