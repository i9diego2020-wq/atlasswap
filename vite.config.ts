import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    optimizeDeps: {
      // Force these to be bundled with the rest of the app to respect our global patches
      exclude: ['liquidjs-lib', 'typeforce', 'bip32', 'tiny-secp256k1', 'slip77']
    },
    plugins: [
      react(),
      wasm(),
      topLevelAwait(),
      nodePolyfills({
        include: ['process', 'util', 'stream', 'events'],
        globals: {
          Buffer: false,
          global: true,
          process: true,
        },
      }),
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'global': 'globalThis',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'buffer': path.resolve(__dirname, 'node_modules/buffer/index.js'),
      }
    }
  };
});
