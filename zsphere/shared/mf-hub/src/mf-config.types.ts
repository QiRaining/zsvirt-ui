/**
 * 微前端配置类型定义
 */

/**
 * 全局共享依赖配置
 */
export interface GlobalSharedDependency {
  /** 是否为单例模式 */
  singleton?: boolean;
  /** 是否立即加载 */
  eager?: boolean;
  /** 所需版本号，false表示不限制版本 */
  requiredVersion?: string | false;
  /** 是否严格版本检查，false表示允许版本不匹配时的 fallback */
  strictVersion?: boolean;
}

/**
 * 全局共享依赖集合
 */
export interface GlobalShared {
  [dependencyName: string]: GlobalSharedDependency;
}

/**
 * 微前端应用配置
 */
export interface MfApp {
  /** 应用名称 */
  name: string;
  /** 微前端模块名称 */
  mfName: string;
  /** 端口号 */
  port: number;
  /** 资源前缀 */
  assetPrefix: string;
  /** 远程依赖的应用列表 */
  remotes?: string[];
}

/**
 * 微前端应用集合
 */
export interface MfApps {
  [appName: string]: MfApp;
}

/**
 * 微前端配置根接口
 */
export interface MfConfig {
  /** 开发环境微前端回退服务器地址 */
  devMfFallbackServer: string;
  /** GraphQL代理地址 */
  graphqlProxy: string;
  /** 全局共享依赖配置 */
  globalShared: GlobalShared;
  /** 微前端应用配置 */
  apps: MfApps;
}

/**
 * 应用名称枚举
 */
export enum AppName {
  DASHBOARD = "dashboard",
  SETTINGS = "settings",
  CORE_SHELL = "core-shell",
  HARDWARE = "hardware",
  MONITOR = "monitor",
  CRYPTO_COMPLIANCE = "crypto-compliance",
  ACCESS_CONTROL = "access-control",
  INSPECTION = "inspection",
  AI_STORE = "ai-store",
  NOVNC = "novnc",
  WIZARD = "wizard",
  ALIYUN = "aliyun",
  NETWORK_TOPOLOGY = "network-topology",
  MARKETPLACE = "marketplace",
  LICENSE = "license",
  WEB_SSH = "web-ssh",
  TENANT_MANAGEMENT = "tenant-management",
  TAG_MANAGEMENT = "tag-management",
  HARDWARE_ORCHESTRATION = "hardware-orchestration",
  AUDITING = "auditing",
  SHARED = "shared",
  BACKUP_MANAGEMENT = "backup-management",
  CLOUD_MONITORING = "cloud-monitoring",
  CLOUD_FORMATION = "cloud-formation",
  MESSAGE_LOG = "message-log",
  NETWORK_RESOURCE = "network-resource",
  NETWORK_SERVICE = "network-service",
  RESOURCE_POOL = "resource-pool",
  TAG = "tag",
}

/**
 * 常用共享依赖名称枚举
 */
export enum SharedDependency {
  REACT = "react",
  REACT_DOM = "react-dom",
  REACT_ROUTER = "react-router",
  REACT_INTL = "react-intl",
  ANTD = "antd",
  REACT_JSON_VIEW = "react-json-view",
}
