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

const APP_NAME = "zsv-shared";

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
        "./src/gql/fuzzy-query.gql": "./src/gql/fuzzy-query.gql",
        "./email-server/base-list": "./src/pages/email-server/list/index.tsx",
        "./snmp-trap/base-list": "./src/pages/snmp-trap/list/index.tsx",
        "./alarm-message/list": "./src/pages/alarm-message/list/index.tsx",
        "./alarm-message/detail-modal":
          "./src/pages/alarm-message/detail/detail-modal.tsx",
        "./auditing/list": "./src/pages/auditing/list/index.tsx",
        "./operation-log/history": "./src/pages/operation-log/list/history.tsx",
        "./operation-log/list/wrapper":
          "./src/pages/operation-log/list/wrapper.tsx",
        "./operation-log/detail": "./src/pages/operation-log/detail/index.tsx",
        "./zwatch-endpoint/base-list":
          "./src/pages/zwatch-endpoint/list/index.tsx",
        "./zwatch-alarm/resource/list":
          "./src/pages/zwatch-alarm/resource/list/index.tsx",
        "./zwatch-alarm/resource/action/add-zwatch-endpoint-modal":
          "./src/pages/zwatch-alarm/resource/action/add-zwatch-endpoint-modal.tsx",
        "./zwatch-alarm/resource/action/header":
          "./src/pages/zwatch-alarm/resource/config/header.tsx",
        "./zwatch-alarm/resource/action/modify":
          "./src/pages/zwatch-alarm/resource/modify/index.tsx",
        "./zwatch-alarm/alarm-tab":
          "./src/pages/zwatch-alarm/alarm-tab/index.tsx",
        "./free-disk/list": "./src/pages/free-disk/list/index.tsx",
        "./migration-activity/list": "./src/pages/migration-activity/index.tsx",
        "./migration-activity/toolbar":
          "./src/pages/migration-activity/toolbar.tsx",
        "./hooks/useSystemParameterValidator":
          "./src/hooks/useSystemParameterValidator.ts",
        "./hooks/useSystemParameterTranslateValue":
          "./src/hooks/useSystemParameterTranslateValue.ts",
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
