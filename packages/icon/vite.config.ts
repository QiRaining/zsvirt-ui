import path from "path";

import react from "@vitejs/plugin-react-swc";
import copy from "rollup-plugin-copy";
import preserveDirectives from "rollup-preserve-directives";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    copy({
      targets: [
        {
          src: "src/assets",
          dest: "dist",
        },
      ],
      hook: "writeBundle",
    }),
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
    svgr({
      svgrOptions: {
        ref: true,
      },
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
      name: "icon",
      // 文件名称, 打包结果举例: my-packages.umd.cjs
      fileName: (format) => `icon.${format}.js`,
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
        "@zstack/utils",
      ],
      output: {
        preserveModules: true,
        format: "esm",
      },
    },
  },
});
