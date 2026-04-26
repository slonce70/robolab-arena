import { describe, expect, it } from 'vitest';
import { getOverlayPanelClass } from './overlayPresentation';

describe('overlay presentation', () => {
  it('gives the victory overlay a distinct celebration panel class', () => {
    expect(getOverlayPanelClass('Перемога!')).toBe('panel victory-panel');
    expect(getOverlayPanelClass('Кімнату пройдено!')).toBe('panel');
  });
});
