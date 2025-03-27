import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    build: {
      rollupOptions: {
        input: {
          login: resolve(__dirname, 'src/renderer/login/index.html'),
          signup: resolve(__dirname, 'src/renderer/signup/index.html')
        }
      }
    }
  }
})
