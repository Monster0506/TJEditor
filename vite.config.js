import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { extname, relative, resolve } from "path";
import { fileURLToPath } from "node:url";
import { glob } from "glob";
import { libInjectCss } from "vite-plugin-lib-inject-css";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), libInjectCss()],
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, "lib/main.jsx"),
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime"],
      output: {
        assetFileNames: "assets/[name][extname]",
        entryFileNames: "[name].js",
      },
      input: Object.fromEntries(
        glob
          .sync("lib/**/*.{js,jsx}", {
            ignore: ["lib/**/*.d.js"],
          })
          .map((file) => [
            relative("lib", file.slice(0, file.length - extname(file).length)),
            fileURLToPath(new URL(file, import.meta.url)),
          ]),
      ),
    },
  },
});
