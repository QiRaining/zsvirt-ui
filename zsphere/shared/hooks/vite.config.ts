import { readFileSync } from "fs";
import * as path from "path";

import alias from "@rollup/plugin-alias";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));

// 自动从 package.json 提取所有 dependencies + devDependencies 作为 external
// 匹配包名及其子路径 (e.g. "lodash-es" 匹配 "lodash-es/get")
const allDeps = new Set([
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  // react/react-dom 在 devDependencies 中，但源码有 import
  "react",
  "react-dom",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
]);
const externalDeps = [...allDeps].map(
  (dep) => new RegExp(`^${dep.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(/.*)?$`),
);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({ rollupTypes: true }),
    alias({
      entries: [
        {
          find: "@zstack/zsphere-utils",
          replacement: "@zstack/zsphere-utils/index.ts",
        },
      ],
    }),
  ],
  build: {
    // 打包输出的目录
    outDir: "dist",
    // 防止 vite 将 rgba() 颜色转化为 #RGBA 十六进制
    cssTarget: "chrome61",
    lib: {
      // 组件库源码的入口文件
      entry: path.resolve(__dirname, "./src/index.ts"),
      // 组件库名称
      name: "hooks",
      // 文件名称, 打包结果举例: my-packages.umd.cjs
      fileName: "hooks",
      formats: ["es"],
    },
    rollupOptions: {
      // 自动 external 所有 dependencies，避免打包第三方 CJS 模块
      external: externalDeps,
      output: {
        preserveModules: true,
        format: "es",
      },
    },
    target: "chrome66",
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
