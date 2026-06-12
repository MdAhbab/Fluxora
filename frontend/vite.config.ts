import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const backendPort = process.env.BACKEND_PORT || 8000;

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Proxy API + media to the Django dev server so token auth and uploads work same-origin.
  server: {
    proxy: {
      '/api': `http://127.0.0.1:${backendPort}`,
      '/media': `http://127.0.0.1:${backendPort}`,
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    rollupOptions: {
      output: {
        // Split the rarely-changing framework code into a long-cached vendor
        // chunk, separate from the animation runtime, so app edits don't bust them.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/.test(id)) return 'react-vendor';
          if (id.includes('motion') || id.includes('framer')) return 'motion';
        },
      },
    },
  },
})
