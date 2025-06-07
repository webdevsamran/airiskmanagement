// vite.config.ts
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/finsense-ai',
  server: {
    port: 4200,
    // host: 'localhost',
    host: '0.0.0.0',
  },
  preview: {
    port: 4300,
    host: 'localhost',
    // host: '0.0.0.0',
  },

  plugins: [react(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],

  build: {
    outDir: '../../dist/apps/finsense-ai',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      // Let Vite transform any CommonJS it encounters under node_modules
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },

  optimizeDeps: {
    // You no longer need to force‐include 'apollo-upload-client' here,
    // since you're pointing at its explicit ESM file.
    include: ['@chakra-ui/react'],
  },

  test: {
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/finsense-ai',
      provider: 'v8' as const,
    },
  },
}));
