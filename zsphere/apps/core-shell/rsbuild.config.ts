import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";
import { defineConfig, RsbuildConfig } from "@rsbuild/core";
import { pluginCssMinimizer } from "@rsbuild/plugin-css-minimizer";
import { pluginLess } from "@rsbuild/plugin-less";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginSvgr } from "@rsbuild/plugin-svgr";
import { pluginTypeCheck } from "@rsbuild/plugin-type-check";
import {
  getCodeInspectorConfig,
  getDevServerIP,
  getI18nCopyConfig,
  getMfConfig,
  getServerPort,
  getSourceConfig,
} from "@zstack/zsphere-mf-hub";

import { getLocalZsvBffServer } from "./config/bff-server";

const APP_NAME = "zsv-core-shell";

// 获取MN服务器地址
const getMnServer = () => {
  if (!process.env.mn) {
    return getLocalZsvBffServer();
  }

  const mn = process.env.mn;
  if (mn.includes(":5443")) {
    return `https://${mn}`;
  }
  return `http://${mn}:5000`;
};

const mnServer = getMnServer();

console.log("core-shell");

export default defineConfig(async () => {
  return {
    plugins: [
      pluginReact(),
      pluginLess(),
      pluginSvgr(),
      pluginCssMinimizer(),
      pluginTypeCheck({
        // enable: process.env.NODE_ENV === "development",
        enable: false,
      }),
      pluginModuleFederation({
        ...getMfConfig(APP_NAME, process.env.NODE_ENV),
        // host 端将 react/react-dom 设为 eager，确保同步初始化
        // 解决 Module Federation 下 React DevTools render highlight 不工作的问题
        shared: {
          ...getMfConfig(APP_NAME, process.env.NODE_ENV).shared,
          react: {
            singleton: true,
            eager: true,
            requiredVersion: "18.3.1",
          },
          "react-dom": {
            singleton: true,
            eager: true,
            requiredVersion: "18.3.1",
          },
        },
      }),
      // 在生产构建时移除 intl.formatMessage 的 defaultMessage
      // pluginRemoveDefaultMessage(),
    ],
    server: {
      port: getServerPort(APP_NAME),
      cors: {
        origin: "*",
        credentials: true,
      },
      proxy: {
        // 与原来的webpack配置差不多，反向代理至ui-server
        "/graphql": {
          target: mnServer ?? "http://localhost:3100",
          ws: true,
          logLevel: "debug",
          secure: false,
        },
        "/api": {
          target: mnServer ?? "http://localhost:3100",
          logLevel: "debug",
          ws: true,
          secure: false,
        },
        "/public": {
          target: mnServer ?? "http://localhost:3100",
          logLevel: "debug",
          ws: true,
          secure: false,
        },
        // Zmigrate BFF 代理（GraphQL + REST）
        "/zmigrate-api": {
          target: "http://127.0.0.1:15100",
          logLevel: "debug",
          secure: false,
          pathRewrite: { "^/zmigrate-api": "" },
        },
        // Zmigrate 微应用代理 (本地开发替代 nginx 转发)
        // zmigrate-core-shell 的 dev server 端口为 15300（见 zmigrate mf-config.ts）
        "/zmigrate-ui": {
          target: "http://127.0.0.1:15300",
          logLevel: "debug",
          secure: false,
          pathRewrite: { "^/zmigrate-ui": "" },
        },
      },
    },
    resolve: {
      aliasStrategy: "prefer-tsconfig",
      // 确保能正确解析 workspace 包
      conditionNames: ["import", "require", "default"],
    },
    performance: {
      chunkSplit: {
        override: {
          cacheGroups: {
            // 将 codemirror 相关的大依赖单独拆分，避免与 Radix UI 等混在一个巨型 chunk 中
            codemirror: {
              test: /[\\/]node_modules[\\/](@codemirror|@lezer|@uiw[\\/](react-codemirror|codemirror-extensions-langs)|@replit[\\/]codemirror|@nextjournal)/,
              name: "vendors-codemirror",
              chunks: "all",
              priority: 20,
              enforce: true,
            },
          },
        },
      },
    },
    tools: {
      rspack: (config, { env }) => {
        const inspectorConfig = getCodeInspectorConfig({
          ip: getDevServerIP(),
        });
        config.plugins = [
          ...(config.plugins ?? []),
          ...inspectorConfig.plugins,
        ];
        if (!config.module) config.module = {};
        if (!config.module.rules) config.module.rules = [];
        config.module.rules.push(...inspectorConfig.rules);
      },
      bundlerChain: (chain) => {
        chain.module
          .rule("graphql")
          .test(/\.(gql|graphql)$/)
          .use("graphql")
          .loader("graphql-tag/loader");

        // 排除 react-dom/server 中的 Node.js 模块
        chain.resolve.alias.set("react-dom/server", false);
      },
      // 兼容:gloabl的写法
      lightningcssLoader: false,
    },
    output: {
      distPath: {
        js: "./",
        jsAsync: "./",
        css: "./",
        cssAsync: "./",
        svg: "./static",
        font: "./",
        image: "./static",
        media: "./static",
      },
      polyfill: "entry",
      copy: getI18nCopyConfig(),
    },
    dev: {
      lazyCompilation: false,
    },
    html: {
      title: "",
    },
    source: getSourceConfig(),
  } as RsbuildConfig;
});
