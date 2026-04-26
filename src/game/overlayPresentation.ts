export type OverlayIntent = 'standard' | 'victory';
export type OverlayState = 'menu' | 'playing' | 'levelComplete' | 'finished' | 'paused';

export function getOverlayPanelClass(intent: OverlayIntent): string {
  return intent === 'victory' ? 'panel victory-panel' : 'panel';
}

export function getOverlayState(intent: OverlayIntent, currentState: OverlayState): OverlayState {
  return intent === 'victory' ? 'finished' : currentState;
}
