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
} from "@zstack/zsphere-mf-hub";

const APP_NAME = "zsv-reliability";

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
        "./index": "./src/pages/index.tsx",
        "./404": "./src/pages/404.tsx",
        "./dynamic-resource-dispatch-strategy":
          "./src/pages/dynamic-resource-dispatch-strategy/index.tsx",
        "./dynamic-resource-dispatch-strategy/list":
          "./src/pages/dynamic-resource-dispatch-strategy/list/index.tsx",
        "./ha-strategic": "./src/pages/ha-strategic/index.tsx",
        "./vm-scheduling-rule": "./src/pages/vm-scheduling-rule/index.tsx",
        "./vm-scheduling-rule/list":
          "./src/pages/vm-scheduling-rule/list/index.tsx",
        "./vm-scheduling-rule/detail":
          "./src/pages/vm-scheduling-rule/detail/index.tsx",
        "./vm-scheduling-rule/host-group/list":
          "./src/pages/vm-scheduling-rule/host-group/list/index.tsx",
        "./vm-scheduling-rule/host-group/detail":
          "./src/pages/vm-scheduling-rule/host-group/detail/index.tsx",
        "./vm-scheduling-rule/vm-group/list":
          "./src/pages/vm-scheduling-rule/vm-group/list/index.tsx",
        "./vm-scheduling-rule/vm-group/detail":
          "./src/pages/vm-scheduling-rule/vm-group/detail/index.tsx",
        "./mn-monitoring": "./src/pages/mn-monitoring/index.tsx",
        "./mn-monitoring/main": "./src/pages/mn-monitoring/main.tsx",
        "./mn-monitoring/basic-info":
          "./src/pages/mn-monitoring/basic-info.tsx",
        "./mn-monitoring/header": "./src/pages/mn-monitoring/header.tsx",
        "./mn-monitoring/hook": "./src/pages/mn-monitoring/hook.tsx",
      },
      dts: false,
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
