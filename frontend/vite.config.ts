import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: false, // Set to true if you want to see the bundle map every build
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false, // Required for http://localhost
        // This helper log will show you if the proxy is working in your terminal
        configure: (proxy, _options) => {
          proxy.on("error", (err) => console.log("proxy error", err));
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            // console.log('Sending Request to the Target:', req.method, req.url);
          });
        },
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Optimized manual chunking to reduce bundle size
        manualChunks(id: string) {
          if (id.includes("node_modules/react")) return "vendor-react";
          if (id.includes("node_modules/zustand")) return "vendor-zustand";
          if (id.includes("node_modules/axios")) return "vendor-axios";
          if (id.includes("node_modules/react-router-dom"))
            return "vendor-router";
          if (id.includes("node_modules/bootstrap")) return "vendor-bootstrap";
          if (id.includes("node_modules")) return "vendor-others";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
