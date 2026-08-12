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

const APP_NAME = "zsv-data-protection";

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
        "./src/pages/index": "./src/pages/index.tsx",
        "./src/pages/snapshot/index": "./src/pages/snapshot/index.tsx",
        "./src/pages/snapshot/strategy/index":
          "./src/pages/snapshot/strategy/index.tsx",
        "./src/pages/snapshot/detail/index":
          "./src/pages/snapshot/detail/index.tsx",
        "./src/pages/snapshot-strategy/list/index":
          "./src/pages/snapshot-strategy/list/index.tsx",
        "./src/pages/snapshot-strategy/detail/index":
          "./src/pages/snapshot-strategy/detail/index.tsx",
        "./src/pages/backup-management/index":
          "./src/pages/backup-management/index.tsx",
        "./src/pages/backup-management/protected-resource/index":
          "./src/pages/backup-management/protected-resource/index.tsx",
        "./src/pages/backup-management/backup-policy/index":
          "./src/pages/backup-management/backup-policy/index.tsx",
        "./src/pages/backup-management/backup-policy/list/index":
          "./src/pages/backup-management/backup-policy/list/index.tsx",
        "./src/pages/backup-management/backup-policy/detail/index":
          "./src/pages/backup-management/backup-policy/detail/index.tsx",
        "./src/pages/backup-management/disaster-recovery-storage/index":
          "./src/pages/backup-management/disaster-recovery-storage/index.tsx",
        "./src/pages/backup-management/disaster-recovery-storage/list/index":
          "./src/pages/backup-management/disaster-recovery-storage/list/index.tsx",
        "./src/pages/backup-management/disaster-recovery-storage/detail/index":
          "./src/pages/backup-management/disaster-recovery-storage/detail/index.tsx",
        "./src/pages/disaster-recovery-service/index":
          "./src/pages/disaster-recovery-service/index.tsx",
        "./backup-management/protected-resource/action/platform-database/overwrite-revert-database":
          "./src/pages/backup-management/protected-resource/action/platform-database/overwrite-revert-database",
        "./backup-management/protected-resource/platformDatabase/components/db-backup-data/list":
          "./src/pages/backup-management/protected-resource/platformDatabase/components/db-backup-data/list",
        "./src/pages/scheduler-job-history/list":
          "./src/pages/scheduler-job-history/list.tsx",
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
  source: getSourceConfig(),
  tools: {
    rspack: (config) => {
      const inspectorConfig = getCodeInspectorConfig();
      config.plugins = [...(config.plugins ?? []), ...inspectorConfig.plugins];
      if (!config.module) {
        config.module = {};
      }
      if (!config.module.rules) {
        config.module.rules = [];
      }
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
