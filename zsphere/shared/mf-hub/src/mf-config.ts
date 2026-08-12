import type { MfConfig } from "./mf-config.types";

export const MF_CONFIG = {
  devMfFallbackServer: "http://localhost:3000",
  graphqlProxy: "http://127.0.0.1:3100",
  globalShared: {
    react: {
      singleton: true,
      eager: false,
      requiredVersion: "18.3.1",
    },
    "react-dom": {
      singleton: true,
      eager: false,
      requiredVersion: "18.3.1",
    },
    "react-router": {
      eager: false,
      singleton: true,
      requiredVersion: "7.18.0",
    },
    "react-intl": {
      eager: false,
      singleton: true,
      requiredVersion: "6.7.0",
    },
    "react-hook-form": {
      eager: false,
      singleton: true,
      requiredVersion: false,
    },
    zod: {
      eager: false,
      singleton: true,
      requiredVersion: false,
    },
    "@hookform/resolvers": {
      eager: false,
      singleton: true,
      requiredVersion: false,
    },
    antd: {
      singleton: true,
      eager: false,
      requiredVersion: "4.24.16",
    },
    "@zstack/design": {
      eager: false,
      singleton: true,
      requiredVersion: false,
    },
    "@zstack/form": {
      eager: false,
      singleton: true,
      requiredVersion: false,
    },
    "@zstack/zsphere-components": {
      eager: false,
      singleton: true,
      requiredVersion: false,
    },
    "@zstack/zsphere-design-biz": {
      eager: false,
      singleton: true,
      requiredVersion: false,
    },
    "@zstack/zsphere-platform-store": {
      eager: false,
      singleton: true,
      requiredVersion: false,
      strictVersion: false,
    },
    "@zstack/zsphere-types": {
      eager: false,
      singleton: true,
      requiredVersion: false,
      strictVersion: false,
    },
    "@zstack/zsphere-utils": {
      eager: false,
      singleton: true,
      requiredVersion: false,
    },
    "@zstack/zsphere-hooks": {
      eager: false,
      singleton: true,
      requiredVersion: false,
      strictVersion: false,
    },
    "@zstack/hooks": {
      eager: false,
      singleton: true,
      requiredVersion: false,
    },
    "@zstack/auth": {
      eager: false,
      singleton: true,
      requiredVersion: false,
    },
    alova: {
      eager: false,
      singleton: true,
      requiredVersion: "3.3.4",
    },
    "alova/fetch": {
      eager: false,
      singleton: true,
      requiredVersion: "3.3.4",
    },
    "alova/react": {
      eager: false,
      singleton: true,
      requiredVersion: "3.3.4",
    },
  },
  apps: {
    "zsv-core-shell": {
      name: "zsv-core-shell",
      mfName: "zsv_core_shell",
      port: 3000,
      assetPrefix: "zsv-core-shell",
      remotes: [
        "zsv-dashboard",
        "zsv-resource",
        "zsv-baremetal",
        "zsv-reliability",
        "zsv-monitoring-om",
        "zsv-administration",
        "zsv-data-protection",
        "zsv-wizard",
        "zsv-shared",
        "zsv-novnc",
        "zsv-web-ssh",
      ],
    },
    "zsv-dashboard": {
      name: "zsv-dashboard",
      mfName: "zsv_dashboard",
      port: 7001,
      assetPrefix: "zsv-dashboard",
      remotes: [
        "zsv-shared",
        "zsv-resource",
        "zsv-monitoring-om",
        "zsv-wizard",
      ],
    },
    "zsv-resource": {
      name: "zsv-resource",
      mfName: "zsv_resource",
      port: 7002,
      assetPrefix: "zsv-resource",
      remotes: [
        "zsv-auditing",
        "zsv-shared",
        "zsv-web-ssh",
        "zsv-novnc",
        "zsv-baremetal",
        "zsv-resource-shared",
        "zsv-data-protection-shared",
        "zsv-reliability-shared",
        "zsv-administration-shared",
      ],
    },
    "zsv-reliability": {
      name: "zsv-reliability",
      mfName: "zsv_reliability",
      port: 7003,
      assetPrefix: "zsv-reliability",
      remotes: [
        "zsv-resource",
        "zsv-auditing",
        "zsv-reliability-shared",
        "zsv-shared",
      ],
    },
    "zsv-monitoring-om": {
      name: "zsv-monitoring-om",
      mfName: "zsv_monitoring_om",
      port: 7004,
      assetPrefix: "zsv-monitoring-om",
      remotes: ["zsv-resource", "zsv-shared", "zsv-auditing"],
    },
    "zsv-administration": {
      name: "zsv-administration",
      mfName: "zsv_administration",
      port: 7005,
      assetPrefix: "zsv-administration",
      remotes: [
        "zsv-auditing",
        "zsv-shared",
        "zsv-resource",
        "zsv-administration-shared",
      ],
    },
    "zsv-data-protection": {
      name: "zsv-data-protection",
      mfName: "zsv_data_protection",
      port: 7006,
      assetPrefix: "zsv-data-protection",
      remotes: [
        "zsv-auditing",
        "zsv-shared",
        "zsv-resource",
        "zsv-resource-shared",
        "zsv-data-protection-shared",
        "zsv-administration-shared",
      ],
    },
    "zsv-wizard": {
      name: "zsv-wizard",
      mfName: "zsv_wizard",
      port: 7007,
      assetPrefix: "zsv-wizard",
      remotes: [
        "zsv-shared",
        "zsv-auditing",
        "zsv-resource",
        "zsv-administration",
        "zsv-data-protection",
      ],
    },
    "zsv-shared": {
      name: "zsv-shared",
      mfName: "zsv_shared",
      port: 7009,
      assetPrefix: "zsv-shared",
      // remotes: ["zsv-resource", "zsv-auditing"]
    },
    "zsv-novnc": {
      name: "zsv-novnc",
      mfName: "zsv_novnc",
      port: 7010,
      assetPrefix: "zsv-novnc",
      remotes: ["zsv-resource"],
    },
    "zsv-web-ssh": {
      name: "zsv-web-ssh",
      mfName: "zsv_web_ssh",
      port: 7011,
      assetPrefix: "zsv-web-ssh",
    },
    "zsv-auditing": {
      name: "zsv-auditing",
      mfName: "zsv_auditing",
      port: 7201,
      assetPrefix: "zsv-auditing",
    },
    "zsv-zwatch": {
      name: "zsv-zwatch",
      mfName: "zsv_zwatch",
      port: 7202,
      assetPrefix: "zsv-zwatch",
    },
    "zsv-baremetal": {
      name: "zsv-baremetal",
      mfName: "zsv_baremetal",
      port: 7203,
      assetPrefix: "zsv-baremetal",
      remotes: ["zsv-resource", "zsv-auditing", "zsv-shared"],
    },
    "zsv-resource-shared": {
      name: "zsv-resource-shared",
      mfName: "zsv_resource_shared",
      port: 7036,
      assetPrefix: "zsv-resource-shared",
    },
    "zsv-reliability-shared": {
      name: "zsv-reliability-shared",
      mfName: "zsv_reliability_shared",
      port: 7037,
      assetPrefix: "zsv-reliability-shared",
    },
    "zsv-data-protection-shared": {
      name: "zsv-data-protection-shared",
      mfName: "zsv_data_protection_shared",
      port: 7038,
      assetPrefix: "zsv-data-protection-shared",
      remotes: ["zsv-auditing", "zsv-resource-shared"],
    },
    "zsv-administration-shared": {
      name: "zsv-administration-shared",
      mfName: "zsv_administration_shared",
      port: 7039,
      assetPrefix: "zsv-administration-shared",
    },
  },
} as MfConfig;

/**
 * 从 MF_CONFIG 自动生成 retry 插件所需的远程模块映射表。
 * 消除 retry.ts 中的硬编码重复数据源。
 */
export function getRemoteModuleConfig() {
  return Object.values(MF_CONFIG.apps)
    .filter((app) => app.name !== "zsv-core-shell") // host 自身不需要 retry
    .map((app) => ({
      port: String(app.port),
      appName: app.mfName,
      path: `/${app.name}`,
    }));
}
