export function getDevLevelTarget(code: string, currentLevel: number, totalLevels: number): number | undefined {
  if (code === 'BracketRight') return clampRoom(currentLevel + 1, totalLevels);
  if (code === 'BracketLeft') return clampRoom(currentLevel - 1, totalLevels);
  if (code === 'Digit6') return clampRoom(Math.ceil(totalLevels / 2), totalLevels);
  if (code === 'KeyB') return totalLevels;
  return undefined;
}

export function getDevEffectTarget(code: string): 'all' | undefined {
  if (code === 'KeyV') return 'all';
  return undefined;
}

export function getDevCompletionTarget(code: string): 'complete-room' | undefined {
  if (code === 'KeyN') return 'complete-room';
  return undefined;
}

export function getDevBossTarget(code: string): 'phase-three' | undefined {
  if (code === 'KeyP') return 'phase-three';
  return undefined;
}

function clampRoom(level: number, totalLevels: number): number {
  return Math.min(Math.max(1, level), totalLevels);
}
