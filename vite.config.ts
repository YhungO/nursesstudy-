import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      allowedHosts: true as true,
      // HMR is disabled in AI Studio
      // Do not modify file watching
      hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      // Disable file watching when DISABLE_HMR is set
      watch: process.env.DISABLE_HMR === 'true' ? null : undefined,
    },
    preview: {
      allowedHosts: true as true,
    },
  }
})
