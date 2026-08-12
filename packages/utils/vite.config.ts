import * as path from "path";

import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";
import { defineConfig } from "vite";
// import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    copy({
      targets: [
        {
          src: "src/assets",
          dest: "dist",
        },
        {
          src: "src/color/light",
          dest: "dist",
        },
        {
          src: "src/color/dark",
          dest: "dist",
        },
        {
          src: "src/menu",
          dest: "dist",
        },
        {
          src: "src/style",
          dest: "dist",
        },
      ],
      hook: "writeBundle",
    }),
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
    // visualizer({
    //   gzipSize: true,
    //   brotliSize: true,
    //   emitFile: false,
    //   filename: "bundle-visualization.html", //分析图生成的文件名
    //   open: false, //如果存在本地服务端口，将在打包后自动展示
    // }),
  ],
  build: {
    // 打包输出的目录
    outDir: "dist",
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "utils",
      fileName: (format) => `utils.${format}.js`,
      formats: ["es"],
    },
    target: "chrome66",
    rollupOptions: {
      external: ["lodash-es", "crypto-js", "@apollo/client", "moment"],
      output: {
        preserveModules: true,
        format: "esm",
      },
    },
  },
  test: {
    environment: "jsdom",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        "dist/**",
        "**/*.d.ts",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/__tests__/**",
      ],
    },
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist"],
    testTimeout: 10000,
  },
});
