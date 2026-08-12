import { RetryPlugin } from "@module-federation/retry-plugin";
import { getRemoteModuleConfig } from "@zstack/zsphere-mf-hub/mf-config";

import { PUBLIC_MF_FALLBACK_SERVER, IS_PRODUCTION } from "../env";

// 从环境变量获取fallback服务器地址，默认为localhost
const getFallbackServer = () => {
  return PUBLIC_MF_FALLBACK_SERVER;
};

// 从 mf-config 自动生成远程模块映射，消除硬编码重复数据源
const REMOTE_MODULE_CONFIG = [
  ...getRemoteModuleConfig(),
  // novnc 在某些部署环境使用独立端口 7034 和 /novnc 路径
  { port: "7034", appName: "zsv_novnc", path: "/novnc" },
];

const getFallbackManifestUrl = (url: string, fallbackServer: string) => {
  for (const config of REMOTE_MODULE_CONFIG) {
    if (url.includes(config.port) || url.includes(config.appName)) {
      const fallbackUrl = `${fallbackServer}${config.path}/mf-manifest.json`;
      console.log(
        `Fallback from ${url} to ${fallbackUrl} (matched: ${config.appName}/${config.port})`,
      );
      return fallbackUrl;
    }
  }

  return `${fallbackServer}/mf-manifest.json`;
};

const fetchManifest = async (url: string, options: RequestInit) => {
  const response = await fetch(url, options);
  const responseClone = response.clone();

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`,
    );
  }

  await responseClone.json().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`JSON parse failed: ${message}, url is: ${url}`);
  });

  return response;
};

const fetchManifestWithRetry = async ({
  url,
  options,
  retryTimes,
  retryDelay,
  fallback,
}: {
  url: string;
  options: RequestInit;
  retryTimes: number;
  retryDelay: number;
  fallback?: (url: string) => string;
}): Promise<Response> => {
  try {
    return await fetchManifest(url, options);
  } catch (error) {
    if (retryTimes > 0) {
      if (retryDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
      return fetchManifestWithRetry({
        url,
        options,
        retryTimes: retryTimes - 1,
        retryDelay,
        fallback,
      });
    }

    if (fallback) {
      return fetchManifestWithRetry({
        url: fallback(url),
        options,
        retryTimes: 0,
        retryDelay: 0,
      });
    }

    throw error;
  }
};

type RuntimePluginWithFetch = {
  name: string;
  fetch?: (manifestUrl: string, options: RequestInit) => Promise<Response>;
  [key: string]: unknown;
};

const retryPlugin = (): RuntimePluginWithFetch => {
  const fallbackServer = getFallbackServer();
  const enableFallback = !IS_PRODUCTION && !!fallbackServer;

  const fetchConfig = IS_PRODUCTION
    ? { retryDelay: 300, retryTimes: 2 }
    : { retryDelay: 0, retryTimes: 0 };

  const scriptConfig = IS_PRODUCTION
    ? { retryTimes: 2, retryDelay: 300 }
    : { retryTimes: 0, retryDelay: 0 };

  return {
    ...(RetryPlugin(scriptConfig) as RuntimePluginWithFetch),
    async fetch(manifestUrl: string, options: RequestInit) {
      return fetchManifestWithRetry({
        url: manifestUrl,
        options,
        ...fetchConfig,
        fallback: enableFallback
          ? (url) => getFallbackManifestUrl(url, fallbackServer)
          : undefined,
      });
    },
  };
};

export default retryPlugin;
