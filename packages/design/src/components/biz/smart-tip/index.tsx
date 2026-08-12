"use client";

import { cn } from "@zstack/utils";
import * as React from "react";

import { DocMarkdown } from "../../primitive/markdown";
import { Tooltip } from "../../primitive/tooltip";
import { InfoPopover } from "../info-popover";

// ============================================================================
// Types
// ============================================================================

/** 内容分析阈值配置 */
interface ContentThresholds {
  /** 纯文本最大字符数，超过则使用 Popover */
  maxLength: number;
  /** 最大行数，超过则使用 Popover */
  maxLines: number;
}

/** 内容分析结果 */
interface ContentAnalysis {
  /** 是否应该使用 Popover */
  shouldUsePopover: boolean;
  /** 原因说明 */
  reason: "markdown" | "length" | "lines" | "react_node" | "forced" | "short";
}

export interface SmartTipProps {
  /** 提示内容（字符串或 ReactNode） */
  content: React.ReactNode | string;
  /** 是否为 Markdown 格式（Markdown 内容强制使用 Popover） */
  markdown?: boolean;
  /** Popover 标题（仅 Popover 模式生效） */
  title?: string;
  /** 触发元素 */
  children: React.ReactNode;
  /** 强制使用 Popover（即使内容很短） */
  forcePopover?: boolean;
  /** 强制使用 Tooltip（即使内容很长，不推荐） */
  forceTooltip?: boolean;
  /** Tooltip 位置 */
  placement?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "topLeft"
    | "topRight"
    | "bottomLeft"
    | "bottomRight";
  /** Popover 位置 */
  popoverSide?: "top" | "right" | "bottom" | "left";
  /** Popover 对齐方式 */
  popoverAlign?: "start" | "center" | "end";
  /** Popover 最大宽度 */
  popoverMaxWidth?: number;
  /** Popover 最大高度 */
  popoverMaxHeight?: number;
  /** 自定义阈值配置 */
  thresholds?: Partial<ContentThresholds>;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义类名（应用于外层容器） */
  className?: string;
  /** Info 图标的显示模式 */
  infoIconMode?: "inline" | "replace";
  /**
   * InfoPopover 的触发模式
   * - "hover": 悬停触发（默认，符合用户习惯，不会导致菜单失焦）
   * - "click": 点击触发
   */
  popoverTriggerMode?: "click" | "hover";
  /**
   * 自定义 z-index
   * 在 Dropdown/Menu 等高层级容器内使用时，需要设置更高的 z-index（如 1080）
   */
  zIndex?: number;
}

// ============================================================================
// Constants
// ============================================================================

/** 默认阈值配置 */
const DEFAULT_THRESHOLDS: ContentThresholds = {
  maxLength: 80, // 纯文本最大 80 字符
  maxLines: 3, // 最大 3 行
};

// ============================================================================
// Utils
// ============================================================================

/**
 * 分析内容是否应该使用 Popover
 *
 * 规则：
 * 1. forcePopover=true → 使用 Popover
 * 2. forceTooltip=true → 使用 Tooltip
 * 3. markdown=true → 使用 Popover（Markdown 内容需要可交互）
 * 4. 字符串内容超过阈值 → 使用 Popover
 * 5. ReactNode 类型 → 保守起见使用 Popover
 * 6. 其他情况 → 使用 Tooltip
 */
function analyzeContent(
  content: React.ReactNode | string,
  options: {
    markdown?: boolean;
    forcePopover?: boolean;
    forceTooltip?: boolean;
    thresholds: ContentThresholds;
  },
): ContentAnalysis {
  const { markdown, forcePopover, forceTooltip, thresholds } = options;

  // 强制 Tooltip（不推荐，但提供逃生舱）
  if (forceTooltip) {
    return { shouldUsePopover: false, reason: "short" };
  }

  // 强制 Popover
  if (forcePopover) {
    return { shouldUsePopover: true, reason: "forced" };
  }

  // Markdown 内容强制使用 Popover
  if (markdown) {
    return { shouldUsePopover: true, reason: "markdown" };
  }

  // 字符串内容分析
  if (typeof content === "string") {
    // 检查长度
    if (content.length > thresholds.maxLength) {
      return { shouldUsePopover: true, reason: "length" };
    }

    // 检查行数
    const lineCount = content.split("\n").length;
    if (lineCount > thresholds.maxLines) {
      return { shouldUsePopover: true, reason: "lines" };
    }

    // 短内容使用 Tooltip
    return { shouldUsePopover: false, reason: "short" };
  }

  // ReactNode 类型，保守起见使用 Popover
  // 因为我们无法确定 ReactNode 的实际内容长度和复杂度
  return { shouldUsePopover: true, reason: "react_node" };
}

// ============================================================================
// Component
// ============================================================================

/**
 * SmartTip - 智能提示组件
 *
 * 根据内容长度和类型自动选择使用 Tooltip 或 InfoPopover：
 * - 短文本（≤80字符，≤3行）→ Tooltip（hover 触发）
 * - 长文本、Markdown、ReactNode → InfoPopover（click 触发）
 *
 * 符合 W3C/WCAG 2.1 规范：
 * - Tooltip 用于简短的补充信息
 * - 长内容使用可交互的 Popover
 * - 支持键盘导航和 Escape 关闭
 *
 * @example
 * ```tsx
 * // 短文本 → 自动使用 Tooltip
 * <SmartTip content="这是一个简短的提示">
 *   <Button>Hover me</Button>
 * </SmartTip>
 *
 * // 长文本 → 自动使用 InfoPopover
 * <SmartTip content="这是一段很长的文字，超过80个字符后会自动切换为 Popover 模式...">
 *   <Button>Click info icon</Button>
 * </SmartTip>
 *
 * // Markdown 内容 → 强制使用 InfoPopover
 * <SmartTip content="## 标题\n- 列表项1\n- 列表项2" markdown>
 *   <span>操作名称</span>
 * </SmartTip>
 * ```
 */
export const SmartTip: React.FC<SmartTipProps> = ({
  content,
  markdown,
  title,
  children,
  forcePopover,
  forceTooltip,
  placement = "top",
  popoverSide = "top",
  popoverAlign = "start",
  popoverMaxWidth = 400,
  popoverMaxHeight = 400,
  thresholds: customThresholds,
  disabled = false,
  className,
  infoIconMode = "inline",
  popoverTriggerMode = "hover", // 默认 hover 模式
  zIndex,
}) => {
  // 合并阈值配置
  const thresholds: ContentThresholds = {
    ...DEFAULT_THRESHOLDS,
    ...customThresholds,
  };

  // 如果没有内容或禁用，直接返回 children
  if (!content || disabled) {
    return <>{children}</>;
  }

  // 分析内容
  const analysis = analyzeContent(content, {
    markdown,
    forcePopover,
    forceTooltip,
    thresholds,
  });

  // 使用 Popover 模式
  if (analysis.shouldUsePopover) {
    // 渲染内容（支持 Markdown）
    const renderedContent = markdown ? (
      <DocMarkdown>{String(content)}</DocMarkdown>
    ) : (
      content
    );

    // inline 模式：children 后面追加 info 图标
    if (infoIconMode === "inline") {
      return (
        <span className={cn("inline-flex items-center gap-1", className)}>
          {children}
          <InfoPopover
            content={renderedContent}
            title={title}
            side={popoverSide}
            align={popoverAlign}
            maxWidth={popoverMaxWidth}
            maxHeight={popoverMaxHeight}
            triggerMode={popoverTriggerMode}
            zIndex={zIndex}
          />
        </span>
      );
    }

    // replace 模式：用 InfoPopover 包裹 children
    return (
      <InfoPopover
        content={renderedContent}
        title={title}
        side={popoverSide}
        align={popoverAlign}
        maxWidth={popoverMaxWidth}
        maxHeight={popoverMaxHeight}
        trigger={children}
        className={className}
        triggerMode={popoverTriggerMode}
        zIndex={zIndex}
      />
    );
  }

  // 使用 Tooltip 模式
  return (
    <Tooltip
      title={String(content)}
      placement={placement}
      className={className}
    >
      {children}
    </Tooltip>
  );
};

SmartTip.displayName = "SmartTip";

// ============================================================================
// Exports
// ============================================================================

export type { ContentThresholds, ContentAnalysis };
