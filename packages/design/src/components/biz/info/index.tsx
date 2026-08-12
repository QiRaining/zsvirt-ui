"use client";
import React from "react";

import type { InfoPopoverProps } from "../info-popover";
import { InfoPopover } from "../info-popover";

/**
 * 支持的弹出位置类型，与 Tooltip 组件保持一致
 *
 * 基本方向：top, bottom, left, right
 * 扩展方向：topLeft, topRight, leftTop, leftBottom, rightTop, rightBottom, bottomLeft, bottomRight
 */
export type InfoPlacement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "topLeft"
  | "topRight"
  | "leftTop"
  | "leftBottom"
  | "rightTop"
  | "rightBottom"
  | "bottomLeft"
  | "bottomRight";

export interface InfoProps {
  /** 提示内容 */
  info: React.ReactNode;
  /** 弹出位置，支持 12 种方向 */
  placement?: InfoPlacement;
  /** 自定义图标类名 */
  className?: string;
  /** 标题（可选） */
  title?: string;
  /** 最大宽度 */
  maxWidth?: number;
  /** 最大高度 */
  maxHeight?: number;
  /**
   * 触发模式
   * - "hover": 悬停触发（默认）
   * - "click": 点击触发
   */
  triggerMode?: InfoPopoverProps["triggerMode"];
}

/**
 * 将 12 种 placement 映射为 InfoPopover 的 side + align
 *
 * @param placement - 弹出位置
 * @returns { side, align } - 侧边方向和对齐方式
 */
function mapPlacementToSideAlign(placement: InfoPlacement = "top"): {
  side: InfoPopoverProps["side"];
  align: InfoPopoverProps["align"];
} {
  switch (placement) {
    case "topLeft":
      return { side: "top", align: "end" };
    case "top":
      return { side: "top", align: "center" };
    case "topRight":
      return { side: "top", align: "start" };
    case "leftTop":
      return { side: "left", align: "end" };
    case "left":
      return { side: "left", align: "center" };
    case "leftBottom":
      return { side: "left", align: "start" };
    case "rightTop":
      return { side: "right", align: "end" };
    case "right":
      return { side: "right", align: "center" };
    case "rightBottom":
      return { side: "right", align: "start" };
    case "bottomLeft":
      return { side: "bottom", align: "end" };
    case "bottom":
      return { side: "bottom", align: "center" };
    case "bottomRight":
      return { side: "bottom", align: "start" };
    default:
      return { side: "top", align: "center" };
  }
}

/**
 * Info - 信息提示组件
 *
 * 升级后的 Info 组件，底层使用 InfoPopover 实现，支持：
 * - 长内容自动滚动
 * - Hover 或 Click 触发
 * - 符合 WCAG 2.1 标准
 * - 12 种弹出位置，与 Tooltip 组件保持一致
 *
 * @example
 * ```tsx
 * // 简单用法
 * <Info info="这是一段提示信息" />
 *
 * // 带标题
 * <Info info="详细说明..." title="操作说明" />
 *
 * // 自定义位置
 * <Info info="提示内容" placement="bottomRight" />
 *
 * // Markdown 内容
 * <Info info={<ReactMarkdown>{markdownContent}</ReactMarkdown>} title="帮助" />
 * ```
 */
const Info = ({
  info,
  placement = "top",
  className,
  title,
  maxWidth = 400,
  maxHeight = 400,
  triggerMode = "hover",
}: InfoProps) => {
  const { side, align } = mapPlacementToSideAlign(placement);

  return (
    <InfoPopover
      content={info}
      title={title}
      side={side}
      align={align}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      triggerMode={triggerMode}
      className={className}
    />
  );
};

export { Info };
