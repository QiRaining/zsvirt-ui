import { createRequire } from "module";
import path from "path";

import { DEV_MF, PUBLIC_MF_FALLBACK_SERVER } from "./env";
import { MF_CONFIG } from "./mf-config";
import { MfConfig } from "./mf-config.types";

// 类型安全的配置对象
const typedMfConfig = MF_CONFIG as MfConfig;

export const getRemote = (appName: string, nodeEnv?: string): string => {
  const app = typedMfConfig.apps[appName];
  const mfName = app.mfName;
  const devServerIP = getDevServerIP();
  const port = getServerPort(appName);
  return nodeEnv === "development"
    ? `${mfName}@http://${devServerIP}:${port}/mf-manifest.json`
    : DEV_MF
      ? `${mfName}@${PUBLIC_MF_FALLBACK_SERVER}/${appName}/mf-manifest.json`
      : `${mfName}@/${appName}/mf-manifest.json`;
};

export const getRemotes = (
  appName: string,
  nodeEnv?: string,
): Record<string, string> | undefined => {
  const app = typedMfConfig.apps[appName];
  const remotes = app?.remotes;
  if (remotes) {
    return remotes.reduce((acc: Record<string, string>, item: string) => {
      const remoteApp = typedMfConfig.apps[item];
      acc[remoteApp?.mfName || item] = getRemote(item, nodeEnv);
      return acc;
    }, {});
  }
  return undefined;
};

export const getMfConfig = (appName: string, nodeEnv?: string) => {
  return {
    name: typedMfConfig.apps[appName].mfName,
    dts: false,
    shared: typedMfConfig.globalShared,
    manifest: {
      disableAssetsAnalyze: true,
    },
    remotes: getRemotes(appName, nodeEnv),
    runtimePlugins: [
      "@zstack/zsphere-mf-runtime-plugin/shared-strategy",
      "@zstack/zsphere-mf-runtime-plugin/fallback",
      "@zstack/zsphere-mf-runtime-plugin/retry",
    ],
    getPublicPath: DEV_MF
      ? `return "${PUBLIC_MF_FALLBACK_SERVER}/${appName}/";`
      : undefined,
  };
};

export const getOutput = (appName: string) => {
  return {
    assetPrefix: `/${appName}/`,
    distPath: {
      js: "./",
      jsAsync: "./",
      css: "./",
      cssAsync: "./",
      svg: "./static",
      font: "./",
      image: "./static",
      media: "./static",
    },
    polyfill: "entry" as const,
  };
};

export const isZsvEnglishOnlyBuild = () => {
  return (
    process.env.ENGLISH_ONLY === "true" ||
    process.env.I18N_ENGLISH === "true" ||
    process.env.ZSV_ENGLISH_ONLY === "true"
  );
};

export const getI18nCopyConfig = () => {
  if (isZsvEnglishOnlyBuild()) {
    return [
      {
        from: "node_modules/@zstack/i18n/src/zstack/zsv/locale/en-US.json",
        to: "i18n/zstack/zsv/locale/en-US.json",
      },
    ];
  }

  return [
    {
      from: "node_modules/@zstack/i18n/src",
      to: "i18n",
    },
  ];
};

export const getServerPort = (appName: string) => {
  const app = typedMfConfig.apps[appName];
  const offset = Number(process.env.ZSV_PORT_OFFSET);
  const normalizedOffset = Number.isInteger(offset) ? offset : 0;
  const port = app.port + normalizedOffset;

  return port > 0 && port < 65536 ? port : app.port;
};

export const isSSHRemoteDev = (): boolean => {
  if (typeof process === "undefined") {
    return false;
  }

  return !!(
    process.env.SSH_CONNECTION ||
    process.env.SSH_CLIENT ||
    process.env.SSH_TTY
  );
};

export const getDevServerIP = (): string => {
  if (isSSHRemoteDev()) {
    const sshConnection = process.env.SSH_CONNECTION;
    if (sshConnection) {
      const parts = sshConnection.split(" ");
      if (parts.length >= 3) {
        return parts[2];
      }
    }
  }

  return "localhost";
};

export const getSourceConfig = () => {
  return {
    include: [],
    define: {
      __ZSV_ENGLISH_ONLY__: JSON.stringify(isZsvEnglishOnlyBuild()),
    },
  };
};

const getCodeInspectorPortBase = () => {
  const portBase = Number(process.env.ZSV_CODE_INSPECTOR_PORT_BASE);
  return Number.isInteger(portBase) && portBase > 0 ? portBase : 30000;
};

const getCurrentZsvAppName = () => {
  const appDir = path.basename(process.cwd());
  const appName = `zsv-${appDir}`;

  return appName in typedMfConfig.apps ? appName : undefined;
};

const getDefaultCodeInspectorPort = () => {
  const appName = getCurrentZsvAppName();
  if (!appName) {
    return undefined;
  }

  const appIndex = Object.keys(typedMfConfig.apps).indexOf(appName);
  if (appIndex < 0) {
    return undefined;
  }

  return getCodeInspectorPortBase() + appIndex * 100;
};

/**
 * 获取 code-inspector-plugin 的 rspack 配置。
 *
 * 背景：code-inspector-plugin 在 plugin.apply() 中通过
 * compiler.options.module.rules.push() 动态注入 loader，
 * 但 rspack 的 Rust 编译管线不会执行在 apply() 中动态添加的 loader rules。
 * 因此需要在 rsbuild 配置中通过 tools.rspack 静态添加这些 rules。
 *
 * 用法：在 rsbuild.config.ts 中：
 * ```ts
 * import { getCodeInspectorConfig } from "@zstack/zsphere-mf-hub";
 * export default defineConfig({
 *   tools: {
 *     rspack: (config) => {
 *       const inspectorConfig = getCodeInspectorConfig();
 *       config.plugins?.push(...inspectorConfig.plugins);
 *       config.module?.rules?.push(...inspectorConfig.rules);
 *     },
 *   },
 * });
 * ```
 */
export const getCodeInspectorConfig = (options?: {
  ip?: string;
  port?: number;
}) => {
  // 仅在开发模式下启用
  const isDev = process.env.NODE_ENV === "development";

  // 在 ESM 模块中，用 createRequire(import.meta.url) 代替 require
  const req = createRequire(import.meta.url);

  // 解析 code-inspector-plugin 的内部 loader 路径
  const pluginPath = req.resolve("code-inspector-plugin");
  const reqFromPlugin = createRequire(pluginPath);
  const webpackEntry = reqFromPlugin.resolve("@code-inspector/webpack");
  const distDir = path.dirname(webpackEntry);
  const loaderPath = path.join(distDir, "loader.js");
  const injectLoaderPath = path.join(distDir, "inject-loader.js");

  const { codeInspectorPlugin } = req("code-inspector-plugin") as {
    codeInspectorPlugin: (opts: Record<string, unknown>) => unknown;
  };

  const pluginOptions = {
    bundler: "rspack" as const,
    showSwitch: true,
    ip: options?.ip ?? getDevServerIP(),
    port: options?.port ?? getDefaultCodeInspectorPort(),
  };

  // 插件本身仍然需要注册（用于启动 HTTP server、hooks.emit HTML 注入等）
  const plugin = codeInspectorPlugin(pluginOptions);

  // 静态声明 code-inspector 的 loader rules，绕过 apply() 中的动态注入
  const outputDir = path.dirname(pluginPath);

  // record 对象模拟插件在 apply() 中动态创建的 record
  // inject-loader 调用 getCodeWithWebComponent({ record: this.query.record })
  // 如果缺少 record，xf(record) 会因 record 为 undefined 而抛出
  // TypeError: Cannot read properties of undefined (reading 'output')
  const record = {
    port: 0,
    entry: "",
    output: outputDir,
  };

  const loaderOptions = {
    ...pluginOptions,
    close: false,
    output: outputDir,
    record,
  };

  const rules = isDev
    ? [
        {
          test: /\.(vue|jsx|tsx|js|ts|mjs|mts|svelte)$/,
          use: [{ loader: loaderPath, options: loaderOptions }],
          enforce: "pre" as const,
        },
        {
          test: /\.(jsx|tsx|js|ts|mjs|mts)$/,
          exclude: /node_modules/,
          use: [{ loader: injectLoaderPath, options: loaderOptions }],
          enforce: "post" as const,
        },
      ]
    : [];

  return {
    plugins: [plugin],
    rules,
  };
};
