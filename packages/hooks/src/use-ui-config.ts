import alovaInstance from "@zstack/alova-instance";
import { useRequest } from "alova/client";

/**
 * UI 配置类型
 */
export enum UIConfigType {
  /** 表格配置 */
  TABLE = "table",
  /** 表单配置 */
  FORM = "form",
  /** 菜单配置 */
  MENU = "menu",
  /** 权限配置 */
  PERMISSION = "permission",
  /** 路由配置 */
  ROUTE = "route",
  /** 主题配置 */
  THEME = "theme",
  /** 组件配置 */
  COMPONENT = "component",
  /** 其他配置 */
  CUSTOM = "custom",
  /** 操作按钮配置 */
  ACTION = "action",
}

interface UseUIConfigOptions<T = unknown> {
  /** 配置类型 */
  configType: UIConfigType;
  /** 资源标识，例如: "vm", "host", "ai.model.evaluation" */
  resourceKey: string;
  /** 手动传入的配置，如果提供则不会从 BFF 获取 */
  manualConfig?: T;
  /** 是否立即请求，默认为 true */
  immediate?: boolean;
  /** 是否启用缓存，默认为 true，缓存在 alova 层面管理 */
  enableCache?: boolean;
  /** 缓存时间（毫秒），默认 5 分钟 */
  cacheFor?: number;
  /** 视图参数（用于 action 类型根据 view 过滤） */
  view?: string;
}

interface UIConfigResponse<T> {
  success: boolean;
  data: T;
}

interface UseUIConfigResult<T> {
  loading: boolean;
  data: T | undefined;
  error: unknown;
  refetch: () => Promise<UIConfigResponse<T>>;
  [key: string]: unknown; // 允许其他 alova 返回的属性
}

/**
 * 从 BFF 获取 UI 配置的通用 Hook
 *
 * @example
 * ```tsx
 * // 获取表格配置
 * const { data: tableConfig, loading } = useUIConfig({
 *   configType: UIConfigType.TABLE,
 *   resourceKey: "vm",
 * });
 *
 * // 获取表单配置
 * const { data: formConfig } = useUIConfig({
 *   configType: UIConfigType.FORM,
 *   resourceKey: "vm.create",
 * });
 *
 * // 手动传入配置（不请求 BFF）
 * const { data } = useUIConfig({
 *   configType: UIConfigType.TABLE,
 *   resourceKey: "vm",
 *   manualConfig: localConfig,
 * });
 *
 * // 延迟加载
 * const { loading, send, data } = useUIConfig({
 *   configType: UIConfigType.MENU,
 *   resourceKey: "main",
 *   immediate: false,
 * });
 *
 * // 手动触发加载
 * await send();
 * ```
 */
export const useUIConfig = <T = unknown>(
  options: UseUIConfigOptions<T>,
): UseUIConfigResult<T> => {
  const {
    configType,
    resourceKey,
    manualConfig,
    immediate = true,
    enableCache = true,
    // cacheFor = 5 * 60 * 1000, // 5 分钟
    cacheFor = 0,
    view,
  } = options;

  // 构建 URL，如果有 view 参数则添加
  const url =
    view && configType === UIConfigType.ACTION
      ? `/api/ui-config/${configType}/${encodeURIComponent(resourceKey)}?view=${encodeURIComponent(view)}`
      : `/api/ui-config/${configType}/${encodeURIComponent(resourceKey)}`;

  // 缓存 key 包含 view（对于 ACTION 类型）
  const cacheName =
    view && configType === UIConfigType.ACTION
      ? `ui-config-${configType}-${resourceKey}-${view}`
      : `ui-config-${configType}-${resourceKey}`;

  // 创建 alova 请求方法
  const method = alovaInstance.Get<UIConfigResponse<T>>(url, {
    // 设置缓存
    ...(enableCache && { cacheFor }),

    // 设置缓存 key，确保不同配置类型+资源的缓存独立
    name: cacheName,
  });

  // 使用 alova 的 useRequest Hook
  const result = useRequest(method, {
    immediate: immediate && !manualConfig, // 如果有手动配置，不自动请求
  });

  // 如果提供了手动配置，返回模拟的结果
  if (manualConfig) {
    const mockResponse: UIConfigResponse<T> = {
      success: true,
      data: manualConfig,
    };
    return {
      ...result,
      loading: false,
      data: manualConfig,
      error: null,
      refetch: async () => mockResponse,
    } as UseUIConfigResult<T>;
  }

  return {
    ...result,
    // 提取 data 字段，让使用更简洁
    data: result.data?.data as T | undefined,
    // 提供重新请求的方法
    refetch: result.send,
  } as UseUIConfigResult<T>;
};

/**
 * 批量获取配置的 Hook
 *
 * @example
 * ```tsx
 * const { data: configs, loading } = useBatchUIConfig({
 *   configType: UIConfigType.TABLE,
 *   resourceKeys: ["vm", "host", "volume"],
 * });
 *
 * // configs = { vm: {...}, host: {...}, volume: {...} }
 * ```
 */
export const useBatchUIConfig = <T = unknown>(options: {
  configType: UIConfigType;
  resourceKeys: string[];
  immediate?: boolean;
  enableCache?: boolean;
  cacheFor?: number;
}) => {
  const {
    configType,
    resourceKeys,
    immediate = true,
    enableCache = true,
    cacheFor = 5 * 60 * 1000,
  } = options;

  const resources = resourceKeys.join(",");

  const method = alovaInstance.Get<UIConfigResponse<Record<string, T>>>(
    `/api/ui-config/${configType}/batch?resources=${encodeURIComponent(resources)}`,
    {
      ...(enableCache && { cacheFor }),
      name: `ui-config-batch-${configType}-${resources}`,
    },
  );

  const result = useRequest(method, {
    immediate,
  });

  return {
    ...result,
    data: result.data?.data,
    refetch: result.send,
  };
};

/**
 * 清除配置缓存的方法
 *
 * @example
 * ```tsx
 * // 清除所有缓存
 * clearUIConfigCache();
 *
 * // 清除特定类型的缓存
 * clearUIConfigCache(UIConfigType.TABLE);
 *
 * // 清除特定资源的缓存
 * clearUIConfigCache(UIConfigType.TABLE, "vm");
 * ```
 */
export const clearUIConfigCache = async (
  configType?: UIConfigType,
  resourceKey?: string,
) => {
  const params = new URLSearchParams();
  if (configType) {
    params.set("type", configType);
  }
  if (resourceKey) {
    params.set("resource", resourceKey);
  }

  const queryString = params.toString();
  const url = `/api/ui-config/cache${queryString ? `?${queryString}` : ""}`;

  await alovaInstance.Delete(url).send();
};
