import type { CameraMode } from './camera/CameraController';

const STORAGE_KEY = 'robolab-arena-settings';

export type RoboLabSettings = {
  bestScore: number;
  highestUnlockedRoom: number;
  preferredCameraMode: CameraMode;
  reducedMotion: boolean;
  soundOn: boolean;
};

export const DEFAULT_SETTINGS: RoboLabSettings = {
  bestScore: 0,
  highestUnlockedRoom: 1,
  preferredCameraMode: 'thirdPerson',
  reducedMotion: false,
  soundOn: true
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
  return {
    bestScore: Number.isFinite(settings.bestScore) ? Math.max(0, Math.floor(settings.bestScore ?? 0)) : DEFAULT_SETTINGS.bestScore,
    highestUnlockedRoom: Number.isFinite(settings.highestUnlockedRoom)
      ? Math.max(1, Math.floor(settings.highestUnlockedRoom ?? 1))
      : DEFAULT_SETTINGS.highestUnlockedRoom,
    preferredCameraMode,
    reducedMotion: settings.reducedMotion === true,
    soundOn: settings.soundOn !== false
  };
}
