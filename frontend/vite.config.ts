// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true, // deschide automat analiza în browser
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  server: {
    proxy: {
      "/api": "http://localhost:8000", // backend API
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Chunking manual, mutually exclusive pentru a evita circular chunks
        manualChunks(id: string) {
          if (id.includes("node_modules/react")) return "vendor-react"; // include react + react-dom
          if (id.includes("node_modules/zustand")) return "vendor-zustand";
          if (id.includes("@tanstack/react-query")) return "vendor-query";
          if (id.includes("node_modules/bootstrap")) return "vendor-bootstrap";
          if (id.includes("node_modules/bootstrap-icons"))
            return "vendor-icons";
          if (id.includes("node_modules/react-router-dom"))
            return "vendor-router";
          if (id.includes("node_modules/axios")) return "vendor-axios";
          if (id.includes("node_modules")) return "vendor-other";
        },

        // Structura fișierelor build
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    chunkSizeWarningLimit: 1000, // ignoră warning >1MB
  },
});
