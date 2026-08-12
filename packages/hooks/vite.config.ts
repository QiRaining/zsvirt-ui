import * as path from "path";

import alias from "@rollup/plugin-alias";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({ rollupTypes: true }),
    alias({
      entries: [
        {
          find: "@zstack/utils",
          replacement: "@zstack/utils/index.ts",
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
      fileName: (format) => `hooks.${format}.js`,
      formats: ["es"],
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@zstack/utils",
        "@zstack/alova-instance",
        "@fingerprintjs/fingerprintjs",
        "@apollo/client",
        /^crypto-js(\/.*)?$/,
        "moment",
        "moment-timezone",
        "dayjs",
        "immer",
        "zustand",
        "zustand/middleware",
        "lodash-es",
        "react-router",
        "graphql",
        "alova",
      ],
      output: {
        preserveModules: true,
        format: "esm",
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
