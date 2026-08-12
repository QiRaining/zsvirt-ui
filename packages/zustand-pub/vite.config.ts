import * as path from "path";

import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    typescript({
      target: "es5",
      rootDir: path.resolve(__dirname, "src/"),
      declaration: true,
      declarationDir: path.resolve(__dirname, "dist"),
      exclude: [
        path.resolve(__dirname, "node_modules/**"),
        "**/__tests__",
        "**/*.test.ts",
      ],
      allowSyntheticDefaultImports: true,
    }),
  ],
  build: {
    // 打包输出的目录
    outDir: "dist",
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "zustand-pub",
      fileName: "zustand-pub",
    },
    target: "chrome66",
  },
});
