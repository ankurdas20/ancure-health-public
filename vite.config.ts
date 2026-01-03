import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false, // Recommended to disable for production
    rollupOptions: {
      output: {
        manualChunks: {
          // Example of splitting a large dependency
          // 'react-vendor': ['react', 'react-dom'], 
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Optional: Adjust if needed
  },
}));
