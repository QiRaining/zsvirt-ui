import {
  copyFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  statSync,
  readFileSync,
} from "fs";
import { resolve } from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import type { Plugin } from "vite";
import dts from "vite-plugin-dts";

// 处理 LESS 文件导入的插件，确保所有 .less 文件都被处理为 CSS Modules
// 使用虚拟 .less.js 文件来提供 JavaScript 导出，同时让 Vite 处理实际的 CSS
const lessImportPlugin = (): Plugin => {
  const cssModuleExports = new Map<string, string>();

  // 提取 LESS 文件中的类名
  function extractClassNames(filePath: string): Record<string, string> {
    if (!existsSync(filePath)) {
      return {};
    }

    try {
      const content = readFileSync(filePath, "utf-8");
      const classNames: string[] = [];
      // 匹配 .className { 格式
      const classRegex = /^\.([a-zA-Z_][a-zA-Z0-9_-]*)\s*\{/gm;
      let match;
      while ((match = classRegex.exec(content)) !== null) {
        const className = match[1];
        // 跳过全局样式
        if (
          !content.includes(`:global(.${className})`) &&
          !content.includes(`:global .${className}`)
        ) {
          classNames.push(className);
        }
      }

      // 生成导出对象（去重）
      const uniqueClassNames = Array.from(new Set(classNames));
      const exportObj: Record<string, string> = {};
      uniqueClassNames.forEach((name) => {
        // 将 kebab-case 转换为 camelCase
        const camelName = name.replace(/-([a-z])/g, (_, letter) =>
          letter.toUpperCase(),
        );
        exportObj[camelName] = name;
        exportObj[name] = name;
      });

      return exportObj;
    } catch {
      return {};
    }
  }

  return {
    name: "less-import-handler",
    enforce: "pre",
    async resolveId(id, importer, options) {
      // 处理 .less 文件导入
      if (
        id.endsWith(".less") &&
        !id.endsWith(".module.less") &&
        !id.includes("?")
      ) {
        try {
          const resolved = await this.resolve(id, importer || "", {
            ...options,
            skipSelf: true,
          });
          if (resolved) {
            const resolvedId =
              typeof resolved === "string" ? resolved : resolved.id;
            // 提取类名并存储
            const classNames = extractClassNames(resolvedId);
            const virtualJsId = `${resolvedId}.js`;
            cssModuleExports.set(virtualJsId, JSON.stringify(classNames));

            // 返回虚拟 .less.js 文件，同时让 Vite 处理实际的 CSS
            // 我们需要修改导入语句，将 .less 改为 .less.js
            return virtualJsId;
          }
        } catch {
          return null;
        }
      }
      // 处理虚拟 .less.js 文件
      if (id.endsWith(".less.js")) {
        return id;
      }
      return null;
    },
    load(id) {
      // 为虚拟 .less.js 文件提供 JavaScript 导出
      if (id.endsWith(".less.js")) {
        const classNames = cssModuleExports.get(id);
        if (classNames) {
          // 同时导入实际的 LESS 文件（使用 ?css 查询参数避免循环）
          const lessFilePath = id.replace(/\.js$/, "");
          return `import '${lessFilePath}?css'; export default ${classNames};`;
        }
        return "export default {};";
      }
      // 处理 ?css 查询参数，让 Vite 正常处理 CSS（不提供 JS 导出）
      if (id.includes("?css") && id.endsWith(".less")) {
        // 返回 null，让 Vite 正常处理 CSS
        return null;
      }
      return null;
    },
  };
};

// 后处理插件：复制 assets 和 style 目录，并重命名 CSS 文件
const copyAssetsPlugin = (): Plugin => {
  return {
    name: "copy-assets",
    writeBundle(options, bundle) {
      const distDir = resolve(__dirname, "dist");
      const srcDir = resolve(__dirname, "src");

      // 处理 CSS 文件重命名
      // Vite 会为每个格式生成 CSS 文件，我们需要重命名它们
      const bundleEntries = Object.entries(bundle);
      const cssAssets = bundleEntries.filter(
        ([name, info]) => info.type === "asset" && name.endsWith(".css"),
      );

      // 查找当前输出格式对应的 JS 文件
      const jsChunks = bundleEntries.filter(
        ([name, info]) => info.type === "chunk" && name.endsWith(".js"),
      );

      // 确定格式：如果存在 index.esm.js 就是 ESM，否则是 CJS
      const isESM = jsChunks.some(([name]) => name.includes("index.esm.js"));

      cssAssets.forEach(([fileName, _assetInfo]) => {
        const filePath = resolve(distDir, fileName);
        if (!existsSync(filePath)) return;

        const newName = isESM ? "index.esm.css" : "index.css";
        const newPath = resolve(distDir, newName);

        if (fileName !== newName) {
          copyFileSync(filePath, newPath);
          // 删除旧文件
          try {
            const fs = require("fs");
            fs.unlinkSync(filePath);
          } catch {
            // 忽略删除错误
          }
        }
      });

      // 复制 assets 目录
      const assetsSrc = resolve(srcDir, "assets");
      const assetsDest = resolve(distDir, "assets");
      const assetsDestRoot = resolve(__dirname, "assets");

      if (existsSync(assetsSrc)) {
        // 复制到 dist/assets
        copyDir(assetsSrc, assetsDest);
        // 复制到根目录 assets（保持兼容性）
        copyDir(assetsSrc, assetsDestRoot);
      }

      // 复制 style 目录
      const styleSrc = resolve(srcDir, "style");
      const styleDest = resolve(distDir, "style");

      if (existsSync(styleSrc)) {
        copyDir(styleSrc, styleDest);
      }
    },
  };
};

// 递归复制目录
function copyDir(src: string, dest: string) {
  if (!existsSync(src)) return;

  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const files = readdirSync(src);
  files.forEach((file) => {
    const srcPath = resolve(src, file);
    const destPath = resolve(dest, file);

    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  });
}

// 处理类型导入的插件，为纯类型文件提供虚拟模块
const typeImportPlugin = (): Plugin => {
  return {
    name: "type-import-handler",
    enforce: "pre",
    async resolveId(id, importer, options) {
      // 处理从 type.ts 或 types.ts 文件的导入
      // 匹配 ./type, ./types, ../type, 等相对路径
      if (
        id.includes("/type") ||
        id.endsWith("/type") ||
        id.endsWith("/types")
      ) {
        try {
          const resolved = await this.resolve(id, importer || "", {
            ...options,
            skipSelf: true,
          });
          if (resolved) {
            const resolvedId =
              typeof resolved === "string" ? resolved : resolved.id;
            // 检查文件是否只包含类型
            if (existsSync(resolvedId) && resolvedId.endsWith(".ts")) {
              const content = readFileSync(resolvedId, "utf-8");
              // 如果文件只包含类型定义（没有运行时代码），提供虚拟模块
              const hasRuntimeCode =
                /export\s+(?:const|let|var|function|class|default\s+(?:const|let|var|function|class))/.test(
                  content,
                );
              const hasTypeExport = /export\s+(?:type|interface)/.test(content);

              if (!hasRuntimeCode && hasTypeExport) {
                // 这是一个纯类型文件，返回虚拟模块
                return {
                  id: `${resolvedId}?virtual`,
                  external: false,
                };
              }
            }
          }
        } catch {
          return null;
        }
      }
    },
    load(id) {
      // 为纯类型文件提供虚拟导出
      if (id.includes("?virtual") && id.endsWith(".ts")) {
        // 提取导出的类型名称（从原始文件）
        const filePath = id.replace("?virtual", "");
        if (existsSync(filePath)) {
          try {
            const content = readFileSync(filePath, "utf-8");
            // 提取所有导出的类型
            const typeExports: string[] = [];

            // 使用更简单直接的方式：匹配 export type/interface 后面的标识符
            // 匹配模式：export type Name 或 export interface Name（Name 后面可以是 =, :, 空格或换行）
            const allTypeMatches = content.matchAll(
              /export\s+(?:type|interface)\s+(\w+)/g,
            );
            for (const match of allTypeMatches) {
              const typeName = match[1];
              if (typeName && !typeExports.includes(typeName)) {
                typeExports.push(typeName);
              }
            }

            // 匹配 export { Type1, Type2 } from ...
            const reExportRegex = /export\s*\{\s*([^}]+)\s*\}\s+from/g;
            let match;
            while ((match = reExportRegex.exec(content)) !== null) {
              const exports = match[1].split(",").map((e) =>
                e
                  .trim()
                  .split(/\s+as\s+/)[0]
                  .trim(),
              );
              exports.forEach((exp) => {
                if (exp && !typeExports.includes(exp)) {
                  typeExports.push(exp);
                }
              });
            }

            // 生成导出语句
            if (typeExports.length > 0) {
              // 为每个类型导出 undefined，让 Rollup 能识别导出
              // 类型会在 TypeScript 编译时处理，运行时这些值不会被使用
              const exports = typeExports
                .map((name) => `export const ${name} = undefined;`)
                .join("\n");
              // 添加类型导出声明（虽然运行时是 undefined，但类型系统需要）
              return exports;
            }
            // 如果还是没有找到，至少返回一个空导出避免报错
            console.warn(`No type exports found in ${filePath}`);
          } catch {
            return null;
          }
        }
        // 返回空导出，类型会在编译时被处理
        return "export {};";
      }
      return null;
    },
  };
};

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "classic", // 兼容 React 16
    }),
    typeImportPlugin(),
    lessImportPlugin(),
    dts({
      rollupTypes: true,
      outDir: "dist",
      include: ["src/**/*"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
        "src/**/*.spec.ts",
        "src/**/*.spec.tsx",
      ],
      // 确保类型文件被正确处理
      compilerOptions: {
        declaration: true,
        declarationMap: true,
      },
    }),
    copyAssetsPlugin(),
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
    modules: {
      // CSS Modules 配置
      generateScopedName: "[name]__[local]___[hash:base64:5]",
      localsConvention: "camelCase",
    },
    devSourcemap: false,
  },
  build: {
    outDir: "dist",
    cssTarget: "chrome61", // 防止 vite 将 rgba() 颜色转化为 #RGBA 十六进制
    cssCodeSplit: false, // 在库模式下，不拆分 CSS 文件
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "BusinessComponent",
      // formats 由 rollupOptions.output 数组指定，这里不需要
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react-router",
        "react-router-dom",
        "antd",
        "@ant-design/charts",
        "@ant-design/plots",
        "@apollo/client",
        "@monaco-editor/react",
        "@umijs/hooks",
        "@zstack/config",
        "@zstack/hooks",
        "@zstack/zsphere-types",
        "@zstack/zsphere-utils",
        "ahooks",
        "classnames",
        "lodash-es",
        "numeral",
        "qs",
        "react-dnd",
        "react-dnd-html5-backend",
        "react-intl",
        "react-markdown",
        "react-grid-layout",
        "react-inlinesvg",
        "re-resizable",
        "zustand",
        "immer",
        "rc-drawer",
        "rc-field-form",
        "rc-util",
        "hash.js",
        "warning",
        "@zstack/design",
      ],
      output: [
        {
          format: "es",
          entryFileNames: "index.esm.js",
        },
        {
          format: "cjs",
          entryFileNames: "index.js",
        },
      ],
    },
    target: "chrome66",
    minify: false, // 保持代码可读性，如需要可以改为 'esbuild' 或 'terser'
    sourcemap: false,
  },
});
