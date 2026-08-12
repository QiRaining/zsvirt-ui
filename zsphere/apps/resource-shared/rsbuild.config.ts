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

const APP_NAME = "zsv-resource-shared";

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
        //vm
        "./vm/mf-index": "./src/domain/vm/mf-index",
        "./vm/disk/shared-disk-utils":
          "./src/domain/vm/components/disk/shared-disk-utils",
        //host
        "./host/mf-index": "./src/domain/host/mf-index",
        //l3-network
        "./l3-network/mf-index": "./src/domain/l3-network/mf-index",
        //l2-network
        "./l2-network/mf-index": "./src/domain/l2-network/mf-index",
        //volume
        "./volume/mf-index": "./src/domain/volume/mf-index",
        //vm-template
        "./vm-template/mf-index": "./src/domain/vm-template/mf-index",
        //image
        "./image/mf-index": "./src/domain/image/mf-index",
        "./image/utils": "./src/domain/image/utils",
        //backup-storage
        "./backup-storage/mf-index": "./src/domain/backup-storage/mf-index",
        //security-group
        "./security-group/mf-index": "./src/domain/security-group/mf-index",
        // zone
        "./zone/mf-index": "./src/domain/zone/mf-index",
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
