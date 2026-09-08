import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // Backend (Go/gin) listens on localhost:8080 and has no CORS config.
      // Proxying keeps requests same-origin so the HttpOnly "access_token"
      // cookie set by the backend flows through the browser without issues.
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});