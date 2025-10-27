import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    target: ["es2015"], // 👈 compatibile anche con iPad iOS 12
  },
  server: {
    port: 5173,
    host: true,
  },
});
