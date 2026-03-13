import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",      // important for correct relative paths
  build: {
    outDir: "dist" // default is dist, just make sure
  }
});