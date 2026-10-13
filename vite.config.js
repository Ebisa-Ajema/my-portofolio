import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/my-portofolio/',

  plugins: [
    react(),
    tailwindcss(),
  ],

  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/three/")) return "three-vendor";
          if (id.includes("/node_modules/three-stdlib/")) return "three-stdlib-vendor";
          if (id.includes("/node_modules/@react-three/fiber/")) return "fiber-vendor";
          if (id.includes("/node_modules/@react-three/drei/")) return "drei-vendor";
          if (
            id.includes("/node_modules/@react-three/postprocessing/") ||
            id.includes("/node_modules/postprocessing/")
          ) {
            return "postprocessing-vendor";
          }
        },
      },
    },
  },
})
