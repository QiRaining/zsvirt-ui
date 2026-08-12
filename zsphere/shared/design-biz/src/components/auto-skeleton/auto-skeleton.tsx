import { snapshotBones } from "boneyard-js";
import { configureBoneyard, Skeleton } from "boneyard-js/react";
import type { ReactNode } from "react";
import React, { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_PREFIX = "boneyard:";

// 使用 sessionStorage 替代 localStorage，关闭标签页自动清空，避免长期累积
const storage = sessionStorage;

// 从 CSS token 中读取实际颜色值，保持与设计系统同步
function resolveToken(token: string, fallbackHex: string): string {
  if (typeof document === "undefined") return fallbackHex;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  return value || fallbackHex;
}

// 确保 boneyard 全局配置只执行一次
let configured = false;
function ensureConfigured() {
  if (configured) return;
  configured = true;
  configureBoneyard({
    animate: "shimmer",
    transition: 200,
    color: resolveToken("--neutral-200", "#f0f2f5"),
  });
}

function loadCachedBones(name: string) {
  try {
    const raw = storage.getItem(`${STORAGE_PREFIX}${name}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveBones(name: string, bones: unknown) {
  try {
    storage.setItem(`${STORAGE_PREFIX}${name}`, JSON.stringify(bones));
  } catch {
    // storage 可能已满，静默忽略
  }
}

export interface AutoSkeletonProps {
  /** 骨架屏唯一名称，用于缓存和识别 */
  name: string;
  /** 是否处于加载状态 */
  loading: boolean;
  /** 子元素（真实内容） */
  children: ReactNode;
  /** 无缓存骨架时的 fallback（首次加载），不传则使用默认脉冲占位块 */
  fallback?: ReactNode;
  /** 容器额外 className */
  className?: string;
}

const DEFAULT_FALLBACK = (
  <div
    style={{
      width: "100%",
      height: "100%",
      minHeight: 48,
      borderRadius: 4,
      background: "var(--neutral-200, #f0f2f5)",
      animation: "pulse 1.5s ease-in-out infinite",
    }}
  />
);

/**
 * AutoSkeleton — 基于 boneyard-js 的自动骨架屏组件
 *
 * 工作原理：
 * 1. 首次访问：loading=true 时显示 fallback（无骨架缓存）
 * 2. 数据加载完成：loading=false，渲染真实内容
 * 3. 自动快照：对真实 DOM 调用 snapshotBones()，缓存至 sessionStorage
 * 4. 同一会话内后续加载：loading=true 时直接展示像素级精确的骨架屏
 *
 * 使用 sessionStorage 而非 localStorage，关闭标签页自动清空，避免长期累积
 */
export const AutoSkeleton: React.FC<AutoSkeletonProps> = ({
  name,
  loading,
  children,
  fallback,
  className,
}) => {
  ensureConfigured();

  const contentRef = useRef<HTMLDivElement>(null);
  const hasSnapshotted = useRef(false);
  const [bones, setBones] = useState(() => loadCachedBones(name));
  // 记录初始是否有缓存骨架，避免快照后 setBones 触发 Skeleton 内部 transition 定时器被清除
  const hadInitialBones = useRef(!!bones);

  const captureSnapshot = useCallback(() => {
    const el = contentRef.current;
    if (!el || hasSnapshotted.current) return;

    const result = snapshotBones(el, name);
    if (result?.bones?.length > 0) {
      hasSnapshotted.current = true;
      // 始终更新 sessionStorage 以保持缓存新鲜
      saveBones(name, result);
      // 仅在首次（无缓存）时更新 state，使后续 refetch 可用骨架
      // 已有缓存时跳过 setBones，避免改变 initialBones 导致
      // Skeleton 的 transition effect 重跑、清除定时器、overlay 卡住
      if (!hadInitialBones.current) {
        setBones(result);
      }
    }
  }, [name]);

  // 当 loading 从 true → false 时，真实内容已渲染，执行快照
  useEffect(() => {
    if (!loading) {
      // 等待一帧确保 DOM 布局稳定
      const raf = requestAnimationFrame(() => {
        captureSnapshot();
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [loading, captureSnapshot]);

  return (
    <Skeleton
      name={name}
      loading={loading}
      initialBones={bones ?? undefined}
      fallback={fallback ?? DEFAULT_FALLBACK}
      className={className}
    >
      <div ref={contentRef} style={{ display: "contents" }}>
        {children}
      </div>
    </Skeleton>
  );
};
