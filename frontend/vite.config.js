import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  
  root: ".", // index.html aynı klasördeyse bu tamam
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000", // backend URL'in
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
