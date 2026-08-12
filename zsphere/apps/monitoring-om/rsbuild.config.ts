import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";
import { defineConfig } from "@rsbuild/core";
import { pluginCssMinimizer } from "@rsbuild/plugin-css-minimizer";
import { pluginLess } from "@rsbuild/plugin-less";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginSvgr } from "@rsbuild/plugin-svgr";
import { pluginTypeCheck } from "@rsbuild/plugin-type-check";
import {
  getMfConfig,
  getOutput,
  getServerPort,
  getCodeInspectorConfig,
  getSourceConfig,
} from "@zstack/zsphere-mf-hub";

const APP_NAME = "zsv-monitoring-om";

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginLess(),
    pluginSvgr(),
    pluginCssMinimizer(),
    pluginTypeCheck({
      enable: false,
    }),
    pluginModuleFederation({
      ...getMfConfig(APP_NAME, process.env.NODE_ENV),
      exposes: {
        "./src/pages/404": "./src/pages/404.tsx",
        "./src/pages/alarm-message": "./src/pages/alarm-message/index.tsx",
        "./src/pages/alarm-message/platform-alarm":
          "./src/pages/alarm-message/platform-alarm/index.tsx",
        "./src/pages/zwatch-alarm": "./src/pages/zwatch-alarm/index.tsx",
        "./src/pages/zwatch-alarm/resource/detail":
          "./src/pages/zwatch-alarm/resource/detail/index.tsx",
        "./src/pages/zwatch-alarm/event/list":
          "./src/pages/zwatch-alarm/event/list/index.tsx",
        "./src/pages/zwatch-alarm/event/detail":
          "./src/pages/zwatch-alarm/event/detail/index.tsx",
        "./src/pages/zwatch-sns-text-template":
          "./src/pages/zwatch-sns-text-template/index.tsx",
        "./src/pages/zwatch-sns-text-template/detail":
          "./src/pages/zwatch-sns-text-template/detail/index.tsx",
        "./src/pages/zwatch-endpoint": "./src/pages/zwatch-endpoint/index.tsx",
        "./src/pages/zwatch-endpoint/detail":
          "./src/pages/zwatch-endpoint/detail/index.tsx",
        "./src/pages/zwatch-endpoint-address":
          "./src/pages/zwatch-endpoint-address/index.tsx",
        "./src/pages/zwatch-endpoint-sms-address":
          "./src/pages/zwatch-endpoint-sms-address/index.tsx",
        "./src/pages/operation-log": "./src/pages/operation-log/index.tsx",
        "./src/pages/auditing": "./src/pages/auditing/index.tsx",
        "./src/pages/log-collect": "./src/pages/log-collect/index.tsx",
        "./src/pages/tag-management": "./src/pages/tag-management/index.tsx",
        "./src/pages/tag-management/detail":
          "./src/pages/tag-management/detail/index.tsx",
        "./src/pages/resource-attribute":
          "./src/pages/resource-attribute/index.tsx",
        "./src/pages/resource-attribute/detail":
          "./src/pages/resource-attribute/detail.tsx",
        "./src/pages/migration-service":
          "./src/pages/migration-service/index.tsx",
      },
    }),
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
        target: "http://127.0.0.1:3100",
        ws: true,
        secure: false,
      },
    },
  },
  output: {
    ...getOutput(APP_NAME),
  },
  source: getSourceConfig(),
  tools: {
    rspack: (config) => {
      const inspectorConfig = getCodeInspectorConfig();
      config.plugins = [...(config.plugins ?? []), ...inspectorConfig.plugins];
      if (!config.module) config.module = {};
      if (!config.module.rules) config.module.rules = [];
      config.module.rules.push(...inspectorConfig.rules);
    },
    // 添加对GraphQL的支持
    bundlerChain: (chain) => {
      chain.module
        .rule("graphql")
        .test(/\.(gql|graphql)$/)
        .use("graphql")
        .loader("graphql-tag/loader");
    },
    lightningcssLoader: false,
  },
});
