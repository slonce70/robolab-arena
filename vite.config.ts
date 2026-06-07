import { defineConfig } from 'vite';

export default defineConfig({
  base: '/robolab-arena/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three']
        }
      }
    }
  }
});
