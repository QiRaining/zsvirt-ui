import path from "path";

import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";
import preserveDirectives from "rollup-preserve-directives";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({}),
    // visualizer({
    //   gzipSize: true,
    //   brotliSize: true,
    //   emitFile: false,
    //   filename: "bundle-visualization.html", //分析图生成的文件名
    //   open: false, //如果存在本地服务端口，将在打包后自动展示
    // }),
    // 目前vite对RSC的"use client"支持有问题：
    // https://github.com/vitejs/vite/issues/15012
    preserveDirectives(),
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
      name: "auth",
      // 文件名称, 打包结果举例: my-packages.umd.cjs
      fileName: (format) => `auth.${format}.js`,
      cssFileName: "style",
      formats: ["es"],
    },
    target: "chrome66",
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "react-router",
        "react-router-dom",
        "@zstack/design",
        "@zstack/hooks",
        "@zstack/utils",
        "react-intl",
      ],
      output: {
        preserveModules: true,
        format: "esm",
      },
    },
  },
});
