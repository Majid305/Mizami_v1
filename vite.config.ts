import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Chargement des variables d'environnement
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    // 'base: "./"' est essentiel pour GitHub Pages car il rend tous les chemins relatifs.
    // Cela permet à l'application de fonctionner que vous soyez sur username.github.io/ ou username.github.io/repo/
    base: './',
    define: {
      // Remplacement sécurisé de la clé API pour l'environnement client
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY || "")
    },
    build: {
      target: 'esnext',
      outDir: 'dist',
      assetsDir: 'assets',
      // On s'assure que le dossier 'dist' est vidé avant chaque build
      emptyOutDir: true,
      sourcemap: false,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          // Organisation des fichiers de sortie pour éviter les conflits
          manualChunks: {
            vendor: ['react', 'react-dom', 'lucide-react', 'recharts'],
            utils: ['xlsx', 'jspdf', 'html2canvas', 'pdf-lib']
          }
        }
      }
    },
    server: {
      port: 3000,
      host: true
    }
  }
})