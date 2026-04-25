export function getDevLevelTarget(code: string, currentLevel: number, totalLevels: number): number | undefined {
  if (code === 'BracketRight') return clampRoom(currentLevel + 1, totalLevels);
  if (code === 'BracketLeft') return clampRoom(currentLevel - 1, totalLevels);
  if (code === 'KeyM') return clampRoom(Math.ceil(totalLevels / 2), totalLevels);
  if (code === 'KeyB') return totalLevels;
  return undefined;
}

function clampRoom(level: number, totalLevels: number): number {
  return Math.min(Math.max(1, level), totalLevels);
}
