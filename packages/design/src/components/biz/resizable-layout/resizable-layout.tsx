"use client";

import { cn } from "@zstack/utils";
import React, { useState, useCallback, useRef, useEffect } from "react";

/** 尺寸类型，兼容 re-resizable 的 NumberSize */
export interface NumberSize {
  width?: number;
  height?: number;
}

/** 尺寸增量类型 */
export interface ResizeDelta {
  width: number;
  height: number;
}

/** 旧版 onResize 回调类型（兼容 re-resizable） */
export type LegacyResizeCallback = (
  e: MouseEvent | TouchEvent,
  direction: string,
  refToElement: HTMLElement,
  delta: ResizeDelta,
) => void;

/** 旧版 onResizeStop 回调类型（兼容 re-resizable） */
export type LegacyResizeStopCallback = (
  e: MouseEvent | TouchEvent,
  direction: string,
  refToElement: HTMLElement,
  delta: ResizeDelta,
) => void;

/** 新版 onResize 回调类型 */
export type SimpleResizeCallback = (size: number) => void;

/** 新版 onResizeStop 回调类型 */
export type SimpleResizeStopCallback = (size: number) => void | false;

export interface ResizableLayoutProps {
  /** 存储尺寸的 key，用于 localStorage（可选，如果不提供则不自动保存） */
  storageKey?: string;
  /** 默认尺寸（宽度或高度） */
  defaultSize: number | (() => number);
  /** 最小尺寸 */
  minSize: number | string;
  /** 最大尺寸 */
  maxSize: number | string;
  /** 调整方向：'horizontal' 为水平调整（宽度），'vertical' 为垂直调整（高度） */
  direction: "horizontal" | "vertical";
  /** 调整边：'left' | 'right' | 'top' | 'bottom' */
  resizeEdge: "left" | "right" | "top" | "bottom";
  /** 子元素 */
  children: React.ReactNode;
  /** 拖拽手柄的 className（可选，不传则使用内置样式） */
  handleClassName?: string;
  /** 拖拽手柄激活状态的 className（可选，不传则使用内置样式） */
  handleActiveClassName?: string;
  /** 容器 className */
  className?: string;
  /** 容器 style */
  style?: React.CSSProperties;
  /** 调整结束时的回调（支持新版和旧版签名） */
  onResizeStop?: SimpleResizeStopCallback | LegacyResizeStopCallback;
  /** 调整过程中的回调（支持新版和旧版签名） */
  onResize?: SimpleResizeCallback | LegacyResizeCallback;
  /** 调整状态变化时的回调 */
  onResizingChange?: (resizing: boolean) => void;
  /** 是否显示调整中的状态 */
  showResizingState?: boolean;
  /** 受控模式：指定尺寸（支持 number 或 NumberSize） */
  size?: number | NumberSize;
  /** 是否禁用自动保存到 localStorage */
  disableAutoSave?: boolean;
  /** 是否隐藏内置手柄样式（当使用自定义 handleClassName 时可设为 true） */
  hideDefaultHandle?: boolean;
}

/**
 * ResizableLayout 可调整尺寸布局组件
 *
 * 支持水平和垂直方向的尺寸调整，并自动保存到 localStorage
 *
 * @example
 * ```tsx
 * // 使用内置样式
 * <ResizableLayout
 *   storageKey="sidebar-width"
 *   defaultSize={240}
 *   minSize={180}
 *   maxSize={400}
 *   direction="horizontal"
 *   resizeEdge="right"
 * >
 *   <Sidebar />
 * </ResizableLayout>
 *
 * // 使用自定义样式
 * <ResizableLayout
 *   defaultSize={240}
 *   minSize={180}
 *   maxSize={400}
 *   direction="horizontal"
 *   resizeEdge="right"
 *   handleClassName={styles.customHandle}
 *   handleActiveClassName={styles.customHandleActive}
 *   hideDefaultHandle
 * >
 *   <Sidebar />
 * </ResizableLayout>
 * ```
 */
export const ResizableLayout: React.FC<ResizableLayoutProps> = ({
  storageKey,
  defaultSize,
  minSize,
  maxSize,
  direction,
  resizeEdge,
  children,
  handleClassName,
  handleActiveClassName,
  className,
  style,
  onResizeStop,
  onResize,
  onResizingChange,
  showResizingState = true,
  size: controlledSize,
  disableAutoSave = false,
  hideDefaultHandle = false,
}) => {
  const [resizing, setResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startSizeRef = useRef<number>(0);
  const startPosRef = useRef<number>(0);

  // 计算默认尺寸
  const getDefaultSizeValue = useCallback(() => {
    return typeof defaultSize === "function" ? defaultSize() : defaultSize;
  }, [defaultSize]);

  const [internalSize, setInternalSize] = useState<number>(() => {
    // 尝试从 localStorage 读取
    if (storageKey && !disableAutoSave && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("resizableSize");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed[storageKey] !== undefined) {
            return parsed[storageKey];
          }
        }
      } catch {
        // ignore
      }
    }
    return getDefaultSizeValue();
  });

  const isHorizontal = direction === "horizontal";

  // 处理受控尺寸，支持 number 和 NumberSize 两种格式
  const getControlledSizeValue = useCallback((): number | undefined => {
    if (controlledSize === undefined) return undefined;
    if (typeof controlledSize === "number") return controlledSize;
    // NumberSize 格式
    return isHorizontal ? controlledSize.width : controlledSize.height;
  }, [controlledSize, isHorizontal]);

  // 实际显示的尺寸：优先使用受控尺寸，否则使用内部状态
  const actualSize = getControlledSizeValue() ?? internalSize;

  // 检测回调是否为旧版格式（接收多个参数）
  const isLegacyResizeCallback = useCallback(
    (
      fn: SimpleResizeCallback | LegacyResizeCallback | undefined,
    ): fn is LegacyResizeCallback => {
      if (!fn) return false;
      return fn.length >= 2 || fn.length === 0;
    },
    [],
  );

  const isLegacyResizeStopCallback = useCallback(
    (
      fn: SimpleResizeStopCallback | LegacyResizeStopCallback | undefined,
    ): fn is LegacyResizeStopCallback => {
      if (!fn) return false;
      return fn.length >= 2 || fn.length === 0;
    },
    [],
  );

  // 解析最小/最大尺寸
  const parseSize = useCallback(
    (value: number | string): number => {
      if (typeof value === "number") return value;
      // 处理 "50vh" 等单位
      if (value.endsWith("vh")) {
        return (parseFloat(value) / 100) * window.innerHeight;
      }
      if (value.endsWith("vw")) {
        return (parseFloat(value) / 100) * window.innerWidth;
      }
      if (value.endsWith("%")) {
        const parent = containerRef.current?.parentElement;
        if (parent) {
          const parentSize = isHorizontal
            ? parent.clientWidth
            : parent.clientHeight;
          return (parseFloat(value) / 100) * parentSize;
        }
      }
      return parseInt(value, 10) || 0;
    },
    [isHorizontal],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setResizing(true);
      onResizingChange?.(true);

      startPosRef.current = isHorizontal ? e.clientX : e.clientY;
      startSizeRef.current = actualSize;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        moveEvent.preventDefault();

        const currentPos = isHorizontal ? moveEvent.clientX : moveEvent.clientY;
        let delta = currentPos - startPosRef.current;

        // 根据调整边的方向调整 delta
        if (resizeEdge === "left" || resizeEdge === "top") {
          delta = -delta;
        }

        let newSize = startSizeRef.current + delta;

        // 应用最小/最大限制
        const min = parseSize(minSize);
        const max = parseSize(maxSize);
        newSize = Math.max(min, Math.min(max, newSize));

        // 更新内部状态（无论是否受控，都更新内部状态以实现平滑拖拽）
        setInternalSize(newSize);

        // 调用 onResize 回调
        if (onResize) {
          if (isLegacyResizeCallback(onResize)) {
            const resizeDelta: ResizeDelta = isHorizontal
              ? { width: newSize - startSizeRef.current, height: 0 }
              : { width: 0, height: newSize - startSizeRef.current };
            onResize(moveEvent, resizeEdge, containerRef.current!, resizeDelta);
          } else {
            onResize(newSize);
          }
        }
      };

      const handleMouseUp = (upEvent: MouseEvent) => {
        setResizing(false);
        onResizingChange?.(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);

        // 计算最终尺寸和增量
        const finalSize = internalSize;
        const totalDelta = finalSize - startSizeRef.current;
        const resizeDelta: ResizeDelta = isHorizontal
          ? { width: totalDelta, height: 0 }
          : { width: 0, height: totalDelta };

        // 调用 onResizeStop 回调
        let shouldSave = true;
        if (onResizeStop) {
          if (isLegacyResizeStopCallback(onResizeStop)) {
            onResizeStop(
              upEvent,
              resizeEdge,
              containerRef.current!,
              resizeDelta,
            );
          } else {
            shouldSave = onResizeStop(finalSize) !== false;
          }
        }

        if (
          shouldSave &&
          storageKey &&
          !disableAutoSave &&
          typeof window !== "undefined"
        ) {
          try {
            const stored = localStorage.getItem("resizableSize");
            const parsed = stored ? JSON.parse(stored) : {};
            parsed[storageKey] = finalSize;
            localStorage.setItem("resizableSize", JSON.stringify(parsed));
          } catch {
            // ignore
          }
        }
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [
      isHorizontal,
      actualSize,
      resizeEdge,
      minSize,
      maxSize,
      storageKey,
      disableAutoSave,
      onResize,
      onResizeStop,
      onResizingChange,
      isLegacyResizeCallback,
      isLegacyResizeStopCallback,
      parseSize,
      internalSize,
    ],
  );

  // 当受控尺寸变化时，同步到内部状态
  useEffect(() => {
    const controlledValue = getControlledSizeValue();
    if (controlledValue !== undefined) {
      setInternalSize(controlledValue);
    }
  }, [getControlledSizeValue]);

  // 计算实际显示的尺寸（拖拽时使用内部状态，否则使用受控尺寸或内部状态）
  const displaySize = resizing ? internalSize : actualSize;

  const containerStyle: React.CSSProperties = {
    ...style,
    position: "relative",
    ...(isHorizontal
      ? { width: displaySize, height: "100%" }
      : { height: displaySize, width: "100%" }),
  };

  // 拖拽区域样式 - 覆盖整个边缘，用于捕获鼠标事件
  const handleWrapperStyle: React.CSSProperties = {
    position: "absolute",
    zIndex: 10,
    ...(resizeEdge === "right" && {
      right: 0,
      top: 0,
      bottom: 0,
      width: 10,
      cursor: "col-resize",
    }),
    ...(resizeEdge === "left" && {
      left: 0,
      top: 0,
      bottom: 0,
      width: 10,
      cursor: "col-resize",
    }),
    ...(resizeEdge === "bottom" && {
      bottom: 0,
      left: 0,
      right: 0,
      height: 10,
      cursor: "row-resize",
    }),
    ...(resizeEdge === "top" && {
      top: 0,
      left: 0,
      right: 0,
      height: 10,
      cursor: "row-resize",
    }),
  };

  // 判断是否使用内置样式
  const useDefaultHandle = !hideDefaultHandle && !handleClassName;

  // 内置手柄容器样式 - 三点式 Grip Handle
  const defaultHandleContainerStyle: React.CSSProperties = {
    position: "absolute",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "opacity 0.2s",
    opacity: resizing ? 1 : 0.6,
    ...(isHorizontal
      ? {
          // 水平方向：垂直排列的点
          flexDirection: "column",
          gap: 3,
          top: "50%",
          transform: "translateY(-50%)",
          padding: "8px 4px",
          ...(resizeEdge === "right" ? { right: 0 } : { left: 0 }),
        }
      : {
          // 垂直方向：水平排列的点
          flexDirection: "row",
          gap: 3,
          left: "50%",
          transform: "translateX(-50%)",
          padding: "4px 8px",
          ...(resizeEdge === "bottom" ? { bottom: 0 } : { top: 0 }),
        }),
  };

  // 单个点的样式（尺寸 + 动画用 inline，颜色用 Tailwind 类名以对齐 design token）
  const dotStyle: React.CSSProperties = {
    width: 4,
    height: 4,
    borderRadius: "50%",
    transition: "background-color 0.2s, transform 0.15s",
    transform: resizing ? "scale(1.2)" : "scale(1)",
  };

  // 单个点的颜色类名：默认中性灰，拖拽中用主题色
  const dotColorClass =
    resizing && showResizingState ? "bg-theme-500" : "bg-neutral-400";

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      style={containerStyle}
    >
      {children}
      {/* 拖拽区域 */}
      <div
        style={handleWrapperStyle}
        onMouseDown={handleMouseDown}
        className="group"
      >
        {/* 可视化手柄 */}
        {useDefaultHandle ? (
          // 使用内置样式 - 三点式 Grip Handle
          <div
            style={defaultHandleContainerStyle}
            className="group-hover:opacity-100"
          >
            <span className={dotColorClass} style={dotStyle} />
            <span className={dotColorClass} style={dotStyle} />
            <span className={dotColorClass} style={dotStyle} />
          </div>
        ) : (
          // 使用自定义样式
          <div
            className={cn(
              handleClassName,
              resizing && showResizingState && handleActiveClassName,
            )}
          />
        )}
      </div>
    </div>
  );
};

ResizableLayout.displayName = "ResizableLayout";

export default ResizableLayout;
