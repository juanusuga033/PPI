import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Local development runs at /; production builds keep the future Pages URL correct.
  base: command === 'serve' ? '/' : '/PPI/',
}))
