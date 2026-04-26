import type { CameraMode } from './camera/CameraController';
import { LEVELS } from './levels';

const STORAGE_KEY = 'robolab-arena-settings';
const MAX_UNLOCKED_ROOM = LEVELS.length;

export type Difficulty = 'easy' | 'normal' | 'hard';

export type RoboLabSettings = {
  bestScore: number;
  highestUnlockedRoom: number;
  mouseSensitivity: number;
  preferredCameraMode: CameraMode;
  reducedMotion: boolean;
  soundOn: boolean;
  difficulty: Difficulty;
};

export const DEFAULT_SETTINGS: RoboLabSettings = {
  bestScore: 0,
  highestUnlockedRoom: 1,
  mouseSensitivity: 1,
  preferredCameraMode: 'thirdPerson',
  reducedMotion: false,
  soundOn: true,
  difficulty: 'normal'
};

export function loadSettings(storage: Storage = window.localStorage): RoboLabSettings {
  try {
    const saved = storage.getItem(STORAGE_KEY);
    if (!saved) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(saved) as Partial<RoboLabSettings>;
    return sanitizeSettings(parsed);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Partial<RoboLabSettings>, storage: Storage = window.localStorage): RoboLabSettings {
  const next = sanitizeSettings({ ...loadSettings(storage), ...settings });
  storage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

function sanitizeSettings(settings: Partial<RoboLabSettings>): RoboLabSettings {
  const preferredCameraMode = settings.preferredCameraMode === 'firstPerson' ? 'firstPerson' : 'thirdPerson';
  const difficulty = settings.difficulty === 'easy' || settings.difficulty === 'hard' ? settings.difficulty : 'normal';
  return {
    bestScore: Number.isFinite(settings.bestScore) ? Math.max(0, Math.floor(settings.bestScore ?? 0)) : DEFAULT_SETTINGS.bestScore,
    highestUnlockedRoom: Number.isFinite(settings.highestUnlockedRoom)
      ? Math.min(MAX_UNLOCKED_ROOM, Math.max(1, Math.floor(settings.highestUnlockedRoom ?? 1)))
      : DEFAULT_SETTINGS.highestUnlockedRoom,
    mouseSensitivity: Number.isFinite(settings.mouseSensitivity)
      ? Math.min(2, Math.max(0.6, Number(settings.mouseSensitivity)))
      : DEFAULT_SETTINGS.mouseSensitivity,
    preferredCameraMode,
    reducedMotion: settings.reducedMotion === true,
    soundOn: settings.soundOn !== false,
    difficulty
  };
}
