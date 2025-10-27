import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow access from network
    port: 5173
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'recharts-vendor': ['recharts'],
          'react-icons': ['react-icons'],
          'dashboard-core': [
            './src/App.jsx',
            './src/Home.jsx',
            './src/Header.jsx',
            './src/Sidebar.jsx'
          ],
          'dashboard-data': ['./src/data/dashboardData.js']
        }
      }
    }
  }
});
