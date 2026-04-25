import { describe, expect, it } from 'vitest';
import viteConfig from '../../vite.config';

describe('build chunking config', () => {
  it('splits three.js into its own cacheable chunk', () => {
    expect(viteConfig.build?.rollupOptions?.output).toMatchObject({
      manualChunks: {
        three: ['three']
      }
    });
  });
});
