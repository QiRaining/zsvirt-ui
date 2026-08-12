import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";
import { defineConfig } from "@rsbuild/core";
import { pluginLess } from "@rsbuild/plugin-less";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginTypeCheck } from "@rsbuild/plugin-type-check";
import {
  getMfConfig,
  getOutput,
  getServerPort,
  getDevServerIP,
  getSourceConfig,
  getCodeInspectorConfig,
} from "@zstack/zsphere-mf-hub";

const APP_NAME = "zsv-auditing";

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginLess(),
    pluginTypeCheck({
      enable: false,
    }),
    pluginModuleFederation({
      ...getMfConfig(APP_NAME, process.env.NODE_ENV),
      exposes: {
        "./auditing-sub-list": "./src/components/auditing-sub-list.tsx",
        "./components/list-icon": "./src/components/list-icon.tsx",
        "./main-list": "./src/index.tsx",
        "./mf-index": "./src/mf-index.ts",
        "./gql/audit.gql": "./src/gql/audit.gql",
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
  },
  output: {
    ...getOutput(APP_NAME),
  },
  tools: {
    rspack: (config) => {
      const inspectorConfig = getCodeInspectorConfig({ ip: getDevServerIP() });
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
  },
  dev: {
    lazyCompilation: false,
  },
  source: getSourceConfig(),
});
