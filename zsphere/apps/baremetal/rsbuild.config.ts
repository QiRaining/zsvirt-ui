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
  getDevServerIP,
  getSourceConfig,
  getCodeInspectorConfig,
} from "@zstack/zsphere-mf-hub";

const APP_NAME = "zsv-baremetal";

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
        // BaremetalCluster
        "./baremetal-cluster/detail":
          "./src/pages/baremetal-cluster/detail/index.tsx",
        "./baremetal-cluster/list":
          "./src/pages/baremetal-cluster/list/index.tsx",
        "./baremetal-cluster/action/create-modal":
          "./src/pages/baremetal-cluster/action/base/create-modal.tsx",
        "./baremetal-cluster/action/attach-l2-network":
          "./src/pages/baremetal-cluster/action/attach-l2-network-modal.tsx",

        // BaremetalChassis
        "./baremetal-chassis/detail":
          "./src/pages/baremetal-chassis/detail/index.tsx",
        "./baremetal-chassis/list":
          "./src/pages/baremetal-chassis/list/index.tsx",

        // BaremetalInstance
        "./baremetal-instance/list":
          "./src/pages/baremetal-instance/list/index.tsx",
        "./baremetal-instance/detail":
          "./src/pages/baremetal-instance/detail/index.tsx",

        // BaremetalPreConfigTemplate
        "./baremetal-pre-config-template/detail":
          "./src/pages/baremetal-pre-config-template/detail/index.tsx",
        "./baremetal-pre-config-template/list":
          "./src/pages/baremetal-pre-config-template/list/index.tsx",

        // BaremetalPxeServer
        "./baremetal-pxe-server/detail":
          "./src/pages/baremetal-pxe-server/detail/index.tsx",

        // Config (for resource tree action configs)
        "./baremetal-chassis/config":
          "./src/pages/baremetal-chassis/config/index.ts",
        "./baremetal-cluster/config":
          "./src/pages/baremetal-cluster/config/index.ts",
        "./baremetal-instance/config":
          "./src/pages/baremetal-instance/config/index.ts",

        // Action config bridge (calls all 3 config hooks, reports via callback)
        "./action-config-bridge": "./src/components/action-config-bridge.tsx",
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
