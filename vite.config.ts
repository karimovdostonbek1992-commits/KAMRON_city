import { defineConfig } from 'vite'
import react from '@vitejs/react'

export default defineConfig({
  plugins: [react()],
  base: './', // BU JUDA MUHIM: GitHub Pages fayllarni topishi uchun kerak
})
