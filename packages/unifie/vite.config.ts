// @ts-ignore
import path from "path";

import typescript from "@rollup/plugin-typescript";
import react from "@vitejs/plugin-react-swc";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, PluginOption } from "vite";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts(),
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
    // 防止 vite 将 rgba() 颜色转化为 #RGBA 十六进制
    cssTarget: "chrome61",
    lib: {
      // 组件库源码的入口文件
      entry: path.resolve(__dirname, "./src/index.ts"),
      // 组件库名称
      name: "unifie",
      // 文件名称, 打包结果举例: my-packages.umd.cjs
      fileName: "unifie",
      cssFileName: "style",
      formats: ["es"],
    },
    target: "chrome66",
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: [
        "react",
        "react-dom",
        "@zstack/utils",
        "@zstack/design",
        "@zstack/auth",
        "@zstack/hooks",
        "@zstack/form",
      ],
      output: {
        preserveModules: true,
        format: "es",
      },
    },
  },
});
