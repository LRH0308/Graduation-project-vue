import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3007,
    hmr: true,
    proxy: {
      "/teacher": {
        target: "http://localhost:9091",
        changeOrigin: true,
      },
    },
  },
});
