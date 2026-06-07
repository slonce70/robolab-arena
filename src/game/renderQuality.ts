import type * as THREE from 'three';

const NORMAL_PIXEL_RATIO_MAX = 1.5;
const REDUCED_MOTION_PIXEL_RATIO_MAX = 1.25;

export function calculateRenderPixelRatio(devicePixelRatio: number, reducedMotion: boolean): number {
  const safeRatio = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
  const capped = Math.min(safeRatio, reducedMotion ? REDUCED_MOTION_PIXEL_RATIO_MAX : NORMAL_PIXEL_RATIO_MAX);
  return Math.max(1, capped);
}

export function getRendererOptions(): THREE.WebGLRendererParameters {
  return {
    antialias: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false
  };
}
