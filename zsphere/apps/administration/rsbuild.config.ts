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

const APP_NAME = "zsv-administration";

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
        "./src/pages/role/utils": "./src/pages/role/utils.ts",
        "./src/pages/access-control-rule":
          "./src/pages/access-control-rule/index.tsx",
        "./src/pages/access-control-rule/list":
          "./src/pages/access-control-rule/list/index.tsx",
        "./src/pages/accesskey-management":
          "./src/pages/accesskey-management/index.tsx",
        "./src/pages/accesskey-management/list":
          "./src/pages/accesskey-management/list/index.tsx",
        "./src/pages/account-information":
          "./src/pages/account-information/index.tsx",
        "./src/pages/account-information/user/detail":
          "./src/pages/account-information/user/detail/index.tsx",
        "./src/pages/account-information/user-group/detail":
          "./src/pages/account-information/user-group/detail/index.tsx",
        "./src/pages/account-third-party-auth":
          "./src/pages/account-third-party-auth/index.tsx",
        "./src/pages/account-third-party-auth/detail":
          "./src/pages/account-third-party-auth/detail/index.tsx",
        "./src/pages/certificate-management":
          "./src/pages/certificate-management/index.tsx",
        "./src/pages/certificate-management/detail":
          "./src/pages/certificate-management/detail/index.tsx",
        "./src/pages/console-proxy": "./src/pages/console-proxy/index.tsx",
        "./src/pages/email-server": "./src/pages/email-server/index.tsx",
        "./src/pages/email-server/list":
          "./src/pages/email-server/list/index.tsx",
        "./src/pages/email-server/detail":
          "./src/pages/email-server/detail/index.tsx",
        "./src/pages/license-management":
          "./src/pages/license-management/index.tsx",
        "./src/pages/log-server": "./src/pages/log-server/index.tsx",
        "./src/pages/log-server/list": "./src/pages/log-server/list/index.tsx",
        "./src/pages/log-server/detail":
          "./src/pages/log-server/detail/index.tsx",
        "./src/pages/login-policy": "./src/pages/login-policy/index.tsx",
        "./src/pages/role": "./src/pages/role/index.tsx",
        "./src/pages/role/list": "./src/pages/role/list/index.tsx",
        "./src/pages/role/create": "./src/pages/role/create/index.tsx",
        "./src/pages/role/detail": "./src/pages/role/detail/index.tsx",
        "./src/pages/snmp-management": "./src/pages/snmp-management/index.tsx",
        "./src/pages/snmp-management/detail":
          "./src/pages/snmp-management/detail/index.tsx",
        "./src/pages/snmp-trap/list": "./src/pages/snmp-trap/list/index.tsx",
        "./src/pages/system-parameter":
          "./src/pages/system-parameter/index.tsx",
        "./src/pages/time-server": "./src/pages/time-server/index.tsx",
        "./src/pages/telemetry": "./src/pages/telemetry/index.tsx",
        "./src/features/telemetry/consent-gate":
          "./src/features/telemetry/consent-gate.tsx",
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
