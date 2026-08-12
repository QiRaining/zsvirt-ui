import path from "path";

import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";
import preserveDirectives from "rollup-preserve-directives";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({}),
    svgr(),
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
      name: "design",
      // 文件名称, 打包结果举例: my-packages.umd.cjs
      fileName: (format) => `design.${format}.js`,
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
        "@radix-ui/react-checkbox",
        "@radix-ui/react-dialog",
        "@radix-ui/react-dropdown-menu",
        "@radix-ui/react-label",
        "@radix-ui/react-popover",
        "@radix-ui/react-progress",
        "@radix-ui/react-radio-group",
        "@radix-ui/react-select",
        "@radix-ui/react-slider",
        "@radix-ui/react-slot",
        "@radix-ui/react-switch",
        "@radix-ui/react-tabs",
        "@radix-ui/react-toast",
        "@radix-ui/react-tooltip",
        "class-variance-authority",
        "@zstack/hooks",
        "@zstack/utils",
        "@zstack/icon",
        "single-spa",
        "react-intl",
        "react-router",
        "react-router-dom",
        "zod",
        "react-hook-form",
        "@tanstack/react-table",
        "@uiw/react-codemirror",
        "@uiw/codemirror-extensions-langs",
        "remark-gfm",
        "immer",
        "zustand",
        "lodash-es",
        "rehype-raw",
        "github-markdown-css",
        "react-resizable-panels",
        "react-arborist",
      ],
      output: {
        preserveModules: true,
        format: "esm",
      },
    },
  },
});
