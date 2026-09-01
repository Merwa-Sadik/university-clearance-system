import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy only used during local dev (npm run dev)
    proxy: command === "serve" ? {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    } : undefined,
  },
}));
