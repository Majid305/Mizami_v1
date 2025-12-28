import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    // 'base: "./"' est essentiel pour GitHub Pages pour que les assets soient chargés relativement au dossier du dépôt
    base: './',
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY || "")
    },
    build: {
      target: 'esnext',
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: false,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'lucide-react', 'recharts'],
            utils: ['xlsx', 'jspdf', 'html2canvas', 'pdf-lib']
          }
        }
      }
    }
  }
})