import { describe, expect, it } from 'vitest';
import { calculateRenderPixelRatio, getRendererOptions } from './renderQuality';

describe('render quality policy', () => {
  it('caps normal device pixel ratio at a performance-friendly ceiling', () => {
    expect(calculateRenderPixelRatio(1, false)).toBe(1);
    expect(calculateRenderPixelRatio(1.25, false)).toBe(1.25);
    expect(calculateRenderPixelRatio(2, false)).toBe(1.5);
    expect(calculateRenderPixelRatio(3, false)).toBe(1.5);
  });

  it('uses a lower ceiling when reduced motion is enabled', () => {
    expect(calculateRenderPixelRatio(2, true)).toBe(1.25);
    expect(calculateRenderPixelRatio(0.75, true)).toBe(1);
  });

  it('does not preserve the drawing buffer during normal gameplay', () => {
    expect(getRendererOptions()).toEqual({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false
    });
  });
});
