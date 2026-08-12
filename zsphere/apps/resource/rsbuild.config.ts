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

const APP_NAME = "zsv-resource";

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
      shared: {
        ...getMfConfig(APP_NAME, process.env.NODE_ENV).shared,
        "@antv/g-base": {
          singleton: true,
          eager: false,
          requiredVersion: "0.5.16",
        },
        "@antv/g6": { singleton: true, eager: false, requiredVersion: "3.8.1" },
        "@antv/g6-react-node": {
          singleton: true,
          eager: false,
          requiredVersion: "1.4.4",
        },
      },
      exposes: {
        "./layouts": "./src/layouts/index.tsx",

        // RootNode
        "./root-node": "./src/pages/root-node/index.tsx",
        "./root-node/detail": "./src/pages/root-node/detail/index.tsx",

        // Zone
        "./zone/list": "./src/pages/zone/list/index.tsx",
        "./zone/detail": "./src/pages/zone/detail/index.tsx",
        "./zone/mf-index": "./src/pages/zone/mf-index",
        // "./zone/config": "./src/pages/zone/config/index.ts",

        // Cluster
        "./cluster/list": "./src/pages/cluster/list/index.tsx",
        "./cluster/detail": "./src/pages/cluster/detail/index.tsx",
        // "./cluster/mf-index": "./src/pages/cluster/mf-index",

        // Host
        "./host/list": "./src/pages/host/list/index.tsx",
        "./host/detail": "./src/pages/host/detail/index.tsx",
        "./host/detail/monitoring/disk-card":
          "./src/pages/host/detail/monitoring/disk-card.tsx",
        "./host/detail/monitoring/memory-card":
          "./src/pages/host/detail/monitoring/memory-card.tsx",
        "./host/detail/monitoring/network-card":
          "./src/pages/host/detail/monitoring/network-card.tsx",

        // Vm
        "./vm/index": "./src/pages/vm/index.tsx",
        "./vm/list": "./src/pages/vm/list/index.tsx",
        "./vm/detail": "./src/pages/vm/detail/index.tsx",
        "./vm/create": "./src/pages/vm/create",
        "./vm/create-by-resource/backup-data":
          "./src/pages/vm/create-vm-by-resource/backup-data/index.tsx",
        "./vm/action/tag": "./src/pages/vm/action/tag/index.tsx",
        "./vm/action/base/pause-modal":
          "./src/pages/vm/action/base/pause-modal.tsx",
        "./vm/action/base/poweroff-modal":
          "./src/pages/vm/action/base/poweroff-modal.tsx",
        "./vm/action/base/reboot-modal":
          "./src/pages/vm/action/base/reboot-modal.tsx",
        "./vm/action/base/resume-modal":
          "./src/pages/vm/action/base/resume-modal.tsx",
        "./vm/action/base/stop-vm-instance":
          "./src/pages/vm/action/base/stop-vm-instance.tsx",

        // Directory
        "./directory/detail": "./src/pages/directory/detail/index.tsx",

        // BackupStorage
        "./backup-storage/list": "./src/pages/backup-storage/list/index.tsx",
        "./backup-storage/detail":
          "./src/pages/backup-storage/detail/index.tsx",
        "./backup-storage/create/disk-config":
          "./src/pages/backup-storage/create/disk-config",

        // Image
        "./image/list": "./src/pages/image/list/index.tsx",
        "./image/detail": "./src/pages/image/detail/index.tsx",

        // VmTemplate
        "./vm-template/list": "./src/pages/vm-template/list/index.tsx",
        "./vm-template/detail": "./src/pages/vm-template/detail/index.tsx",

        // VmSpec
        "./vm-spec/detail": "./src/pages/vm-spec/detail/index.tsx",

        // PrimaryStorage
        "./primary-storage/list": "./src/pages/primary-storage/list/index.tsx",
        "./primary-storage/detail/monitoring/capacity-card":
          "./src/pages/primary-storage/detail/monitoring/capacity-card.tsx",
        "./ceph-primary-storage-pool/list":
          "./src/pages/ceph-primary-storage-pool/list/index.tsx",
        "./primary-storage/detail":
          "./src/pages/primary-storage/detail/index.tsx",
        "./primary-storage/LocalStorageFreediskInfo":
          "./src/pages/primary-storage/components/local-stroage-device-info/index.tsx",
        "./primary-storage/create":
          "./src/pages/primary-storage/create/mf-index.ts",

        // L2Network
        "./l2-network/detail": "./src/pages/l2-network/detail/index.tsx",
        "./l2-network/list": "./src/pages/l2-network/list/index.tsx",
        "./l2-network/create": "./src/pages/l2-network/create/index.tsx",
        "./l2-network/action/detach-cluster-in-sub":
          "./src/pages/l2-network/action/detach-cluster-in-sub.tsx",
        "./l2-network/create/nic-config/select-physical-modal":
          "./src/pages/l2-network/create/nic-config/select-physical-modal",

        // L3Network
        "./l3-network/list": "./src/pages/l3-network/list/index.tsx",
        "./l3-network/detail": "./src/pages/l3-network/detail/index.tsx",
        "./l3-network/create": "./src/pages/l3-network/create",
        "./l3-network/create/vlan-config":
          "./src/pages/l3-network/create/vlan-config",
        "./l3-network/create/ip-config":
          "./src/pages/l3-network/create/ip-config",

        // SecurityGroup
        "./security-group/detail":
          "./src/pages/security-group/detail/index.tsx",
        "./security-group/detail/index":
          "./src/pages/security-group/detail/index.tsx",

        // SharedBlock
        "./shared-block/detail": "./src/pages/shared-block/detail/index.tsx",

        // PhysicalNic
        "./physical-nic/detail": "./src/pages/physical-nic/detail/index.tsx",

        // HostKernelInterface
        "./host-kernel-interface/detail":
          "./src/pages/host-kernel-interface/detail/index.tsx",

        // GpuDevice
        "./gpu-device/detail": "./src/pages/gpu-device/detail/index.tsx",

        // Bond
        "./bond/detail": "./src/pages/bond/detail/index.tsx",

        // Volume
        "./volume/list": "./src/pages/volume/list/index.tsx",
      },
      // dts: true,
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
  resolve: {
    alias: {
      // 配置 @zstack/virtualization-resource 别名，指向当前应用的 src 目录
      "@zstack/virtualization-resource/src": "./src",
    },
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

      // 配置图片资源处理（排除 SVG，SVG 由 pluginSvgr 处理）
      // 支持常见的图片格式：png, jpg, jpeg, gif, webp, ico, bmp
      // 特别处理 3d-hardware 目录下的资源
      chain.module
        .rule("image")
        .test(/\.(png|jpe?g|gif|webp|ico|bmp)$/i)
        .type("asset")
        .parser({
          dataUrlCondition: {
            maxSize: 8 * 1024, // 8KB 以下的图片转为 base64，减少 HTTP 请求
          },
        })
        .generator({
          // 3d-hardware 目录下的资源保持目录结构
          filename: (pathData: { filename?: string }) => {
            const filename = pathData.filename || "";
            if (filename.includes("3d-hardware")) {
              return "assets/3d-hardware/[name].[hash:8][ext]";
            }
            return "assets/images/[name].[hash:8][ext]";
          },
        });
    },
    lightningcssLoader: false,
  },
});
