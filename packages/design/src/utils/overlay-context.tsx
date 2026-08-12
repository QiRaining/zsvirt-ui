import React, { createContext, useContext, useCallback, useRef } from "react";

interface OverlayInstance {
  id: string;
  type: "dialog" | "drawer" | "popover" | "tooltip" | "toast";
  zIndex: number;
  timestamp: number;
}

interface OverlayContextValue {
  register: (id: string, type: OverlayInstance["type"]) => number;
  unregister: (id: string) => void;
  getZIndex: (id: string) => number | null;
  getTopZIndex: () => number;
  isTop: (id: string) => boolean;
}

const OverlayContext = createContext<OverlayContextValue | null>(null);

/**
 * 基础 z-index 配置
 *
 * 设计原则：
 * 1. 所有值都必须高于 Antd 的默认 z-index（Dropdown ~1050）
 * 2. 这样使用 useOverlay 的组件（InfoPopover、SmartTip 等）在 Antd 组件内部时不会被遮挡
 * 3. 后打开的 overlay 会自动递增 z-index，确保正确的层级顺序
 *
 * Antd 默认值参考：
 * - Modal: 1000
 * - Dropdown: 1050
 * - Tooltip: 1070
 * - Message/Notification: 1010
 */
const BASE_Z_INDEX = {
  dialog: 1100, // Modal - 高于 Antd Dropdown (1050)
  drawer: 1100, // Drawer - 高于 Antd Dropdown (1050)
  popover: 1100, // Popover/InfoPopover - 高于 Antd Dropdown (1050)
  tooltip: 1100, // Tooltip - 高于 Antd Tooltip (1070)
  toast: 1100, // Message/Notification - 统一基础值
} as const;

const Z_INDEX_STEP = 10; // 每个实例递增10，为内部子元素留空间

/**
 * OverlayProvider - 全局弹窗层级管理
 *
 * 用法：
 * ```tsx
 * <OverlayProvider>
 *   <App />
 * </OverlayProvider>
 * ```
 */
export const OverlayProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // 使用 useRef 存储所有活跃的弹窗，避免不必要的重渲染
  const overlaysRef = useRef<Map<string, OverlayInstance>>(new Map());

  // 用于通知订阅者状态变化
  const listenersRef = useRef<Set<() => void>>(new Set());

  // 通知所有订阅者
  const notify = useCallback(() => {
    listenersRef.current.forEach((listener) => listener());
  }, []);

  /**
   * 注册弹窗，返回计算好的 z-index
   */
  const register = useCallback(
    (id: string, type: OverlayInstance["type"]) => {
      const overlays = overlaysRef.current;

      // 如果已经注册过，直接返回现有的 z-index
      const existing = overlays.get(id);
      if (existing) {
        return existing.zIndex;
      }

      // 全局递增策略：找到当前最大的 z-index，然后 +10
      // 这样确保后打开的弹窗总是在上层，无论类型
      let maxZIndex = BASE_Z_INDEX[type] - Z_INDEX_STEP;

      if (overlays.size > 0) {
        const allZIndexes = Array.from(overlays.values()).map(
          (item) => item.zIndex,
        );
        const currentMax = Math.max(...allZIndexes);
        // 取当前最大值和类型基础值的较大者
        maxZIndex = Math.max(currentMax, maxZIndex);
      }

      const zIndex = maxZIndex + Z_INDEX_STEP;

      const instance: OverlayInstance = {
        id,
        type,
        zIndex,
        timestamp: Date.now(),
      };

      overlays.set(id, instance);
      notify(); // 通知订阅者

      return zIndex;
    },
    [notify],
  );

  /**
   * 注销弹窗
   */
  const unregister = useCallback(
    (id: string) => {
      const overlays = overlaysRef.current;
      const deleted = overlays.delete(id);

      if (deleted) {
        notify(); // 通知订阅者
      }
    },
    [notify],
  );

  /**
   * 获取指定弹窗的 z-index
   */
  const getZIndex = useCallback((id: string) => {
    const instance = overlaysRef.current.get(id);
    return instance ? instance.zIndex : null;
  }, []);

  /**
   * 获取最顶层的 z-index
   */
  const getTopZIndex = useCallback(() => {
    const overlays = overlaysRef.current;
    if (overlays.size === 0) {
      return 0;
    }

    return Math.max(...Array.from(overlays.values()).map((o) => o.zIndex));
  }, []);

  /**
   * 判断是否是最顶层
   */
  const isTop = useCallback(
    (id: string) => {
      const overlays = overlaysRef.current;
      const instance = overlays.get(id);
      if (!instance) {
        return false;
      }

      const topZIndex = getTopZIndex();
      return instance.zIndex === topZIndex;
    },
    [getTopZIndex],
  );

  const value: OverlayContextValue = {
    register,
    unregister,
    getZIndex,
    getTopZIndex,
    isTop,
  };

  return (
    <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>
  );
};

/**
 * useOverlayContext - 获取 Overlay Context
 *
 * @throws {Error} 如果在 OverlayProvider 外部使用
 */
export const useOverlayContext = () => {
  const context = useContext(OverlayContext);
  if (!context) {
    // 如果没有 Provider，返回一个空实现（优雅降级）
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "useOverlayContext: OverlayProvider not found. Z-index management will not work. " +
          "Please wrap your app with <OverlayProvider>.",
      );
    }

    // 返回默认实现
    return {
      register: () => BASE_Z_INDEX.dialog,
      unregister: () => {},
      getZIndex: () => null,
      getTopZIndex: () => 0,
      isTop: () => false,
    };
  }
  return context;
};
