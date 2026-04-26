import { describe, expect, it } from 'vitest';
import { getOverlayPanelClass, getOverlayState } from './overlayPresentation';

describe('overlay presentation', () => {
  it('gives the victory overlay a distinct celebration panel class', () => {
    expect(getOverlayPanelClass('victory')).toBe('panel victory-panel');
    expect(getOverlayPanelClass('standard')).toBe('panel');
  });

  it('uses explicit overlay intent instead of title text for finished state', () => {
    expect(getOverlayState('victory', 'playing')).toBe('finished');
    expect(getOverlayState('standard', 'playing')).toBe('playing');
  });
});
