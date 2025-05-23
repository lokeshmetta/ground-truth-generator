
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: ["75ec9b7d-166c-4bfc-9c9d-e5b6d36c9b8b.lovableproject.com"],
  },
  base: './',
  build: {
    minify: 'esbuild', // Use esbuild for faster minification
    target: 'esnext', // Target modern browsers
    sourcemap: false, // Disable sourcemaps for production
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
