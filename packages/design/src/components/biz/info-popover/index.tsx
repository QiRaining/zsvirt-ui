"use client";

import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";

import { useOverlay } from "../../../utils/use-overlay";
import { Button } from "../../primitive/button";

// ============================================================================
// Types
// ============================================================================

export interface InfoPopoverProps {
  /** 内容，支持 ReactNode */
  content: React.ReactNode;
  /** 标题（可选，显示标题栏） */
  title?: string;
  /** 触发元素，默认为 info 图标按钮 */
  trigger?: React.ReactNode;
  /** 最大宽度，默认 400px */
  maxWidth?: number;
  /** 最大高度，默认 400px */
  maxHeight?: number;
  /** 弹出位置 */
  side?: "top" | "right" | "bottom" | "left";
  /** 对齐方式 */
  align?: "start" | "center" | "end";
  /** 自定义类名 */
  className?: string;
  /** 自定义内容区域类名 */
  contentClassName?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 受控模式：打开状态 */
  open?: boolean;
  /** 受控模式：打开状态变化回调 */
  onOpenChange?: (open: boolean) => void;
  /** 自定义 z-index */
  zIndex?: number;
  /** 是否显示关闭按钮，默认 true（有标题时显示） */
  showCloseButton?: boolean;
  /** 触发器 aria-label */
  triggerAriaLabel?: string;
  /**
   * 触发模式
   * - "click": 点击触发
   * - "hover": 悬停触发（默认），支持鼠标移动到内容上（符合 WCAG 1.4.13）
   */
  triggerMode?: "click" | "hover";
  /** hover 模式下，鼠标离开后延迟关闭的时间（毫秒），默认 300ms */
  hoverCloseDelay?: number;
  /** hover 模式下，鼠标进入后延迟打开的时间（毫秒），默认 150ms */
  hoverOpenDelay?: number;
  /** 是否显示箭头，默认 true */
  showArrow?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const InfoPopover: React.FC<InfoPopoverProps> = ({
  content,
  title,
  trigger,
  maxWidth = 400,
  maxHeight = 400,
  side = "top",
  align = "start",
  className,
  contentClassName,
  disabled = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  zIndex: customZIndex,
  showCloseButton = true,
  triggerAriaLabel = "查看详情",
  triggerMode = "hover",
  hoverCloseDelay = 300,
  hoverOpenDelay = 150,
  showArrow = true,
}) => {
  // 内部状态
  const [internalOpen, setInternalOpen] = React.useState(false);

  // 判断是受控还是非受控
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled
    ? (controlledOnOpenChange ?? (() => {}))
    : setInternalOpen;

  // Hover 模式的状态追踪
  const isHoveringRef = React.useRef(false);
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const openTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAllTimers = React.useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  const scheduleOpen = React.useCallback(() => {
    if (disabled) {
      return;
    }
    clearAllTimers();
    isHoveringRef.current = true;
    openTimerRef.current = setTimeout(() => {
      if (isHoveringRef.current) {
        setOpen(true);
      }
    }, hoverOpenDelay);
  }, [disabled, clearAllTimers, setOpen, hoverOpenDelay]);

  const scheduleClose = React.useCallback(() => {
    clearAllTimers();
    isHoveringRef.current = false;
    closeTimerRef.current = setTimeout(() => {
      if (!isHoveringRef.current) {
        setOpen(false);
      }
    }, hoverCloseDelay);
  }, [clearAllTimers, setOpen, hoverCloseDelay]);

  const cancelClose = React.useCallback(() => {
    isHoveringRef.current = true;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  // z-index
  const { zIndex: autoZIndex } = useOverlay({
    type: "popover",
    open,
    customZIndex,
  });
  const finalZIndex = customZIndex ?? autoZIndex;

  // 内容区域高度
  const headerHeight = 52;
  const contentMaxHeight = title ? maxHeight - headerHeight : maxHeight;

  if (!content) {
    return null;
  }

  const isHoverMode = triggerMode === "hover";

  // 默认触发器
  const defaultTrigger = (
    <div className="inline-flex h-4 w-4 cursor-pointer items-center justify-center outline-none">
      <Icon type="info"
        className={cn(
          "block h-4 w-4 fill-current transition-colors duration-150",
          open ? "text-theme-600" : "hover:text-theme-600 text-neutral-400",
          disabled && "cursor-not-allowed opacity-50",
        )}
        style={{ display: "block" }}
        aria-label={triggerAriaLabel}
      />
    </div>
  );

  const triggerElement = trigger ?? defaultTrigger;

  // Popover 内容
  const popoverContent = (
    <PopoverPrimitive.Content
      side={side}
      align={align}
      sideOffset={4}
      avoidCollisions
      collisionPadding={{ top: 20, bottom: 20, left: 20, right: 20 }}
      arrowPadding={8}
      className={cn(
        // 用 filter: drop-shadow 替代 box-shadow
        // drop-shadow 会作用在整个元素的实际形状上（包括箭头），实现无缝连接
        "bg-neutral-0 rounded-md",
        "outline-none",
        className,
      )}
      style={{
        maxWidth,
        zIndex: finalZIndex,
        // drop-shadow 统一处理边框和阴影，箭头和内容完美融合
        filter:
          "drop-shadow(0 1px 2px rgba(0,0,0,0.1)) drop-shadow(0 4px 12px rgba(0,0,0,0.15))",
      }}
      role="dialog"
      aria-modal="false"
      aria-labelledby={title ? "info-popover-title" : undefined}
      onPointerDownOutside={(e) => {
        if (isHoverMode) {
          e.preventDefault();
        }
      }}
      onInteractOutside={(e) => {
        if (isHoverMode) {
          e.preventDefault();
        }
      }}
      onEscapeKeyDown={() => setOpen(false)}
      onMouseEnter={isHoverMode ? cancelClose : undefined}
      onMouseLeave={isHoverMode ? scheduleClose : undefined}
    >
      {title && (
        <div
          id="info-popover-title"
          className={cn(
            "flex items-center justify-between gap-2",
            "px-4 py-3",
            "border-b-solid border-b border-b-neutral-200 bg-neutral-100",
            "rounded-t-md",
          )}
        >
          {/* 标题区域：支持长文本截断，hover 显示完整内容 */}
          <span
            className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-900"
            title={title}
          >
            {title}
          </span>
          {showCloseButton && !isHoverMode && (
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              aria-label="关闭"
              className="h-6 w-6 flex-shrink-0 p-0"
            >
              <Icon type="close" className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      <div
        className={cn(
          "px-4 py-3",
          "overflow-x-hidden overflow-y-auto",
          "text-sm leading-relaxed text-neutral-700",
          "[&_a]:text-theme-600 [&_a:hover]:text-theme-700 [&_a]:underline",
          "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-4",
          "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-4",
          "[&_li]:my-1",
          "[&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
          "[&_h1]:my-2 [&_h1]:text-base [&_h1]:font-semibold",
          "[&_h2]:my-2 [&_h2]:text-sm [&_h2]:font-semibold",
          "[&_h3]:my-1 [&_h3]:text-sm [&_h3]:font-medium",
          "[&_code]:rounded [&_code]:bg-neutral-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs",
          "[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-neutral-100 [&_pre]:p-3",
          "[&_blockquote]:my-2 [&_blockquote]:border-l-4 [&_blockquote]:border-neutral-300 [&_blockquote]:pl-3 [&_blockquote]:text-neutral-600",
          contentClassName,
        )}
        style={{ maxHeight: contentMaxHeight }}
      >
        {content}
      </div>
      {/*
        箭头渲染说明：
        - 使用 transform: translateZ(0) 创建新的合成层，解决某些浏览器/显卡下
          父元素 filter: drop-shadow 导致 SVG 子元素渲染异常的问题
        - visibility: visible 确保箭头始终可见
      */}
      {showArrow && (
        <PopoverPrimitive.Arrow
          width={18}
          height={9}
          className="fill-neutral-0"
          style={{
            transform: "translateZ(0)", // 强制创建新的合成层
            visibility: "visible", // 确保可见性
          }}
        />
      )}
    </PopoverPrimitive.Content>
  );

  // ============================================================================
  // Hover 模式：完全自己控制，不用 Radix 的 Trigger
  // ============================================================================
  if (isHoverMode) {
    return (
      <PopoverPrimitive.Root open={open}>
        {/* 用 Anchor 定位，不用 Trigger（避免 click 冲突） */}
        <PopoverPrimitive.Anchor asChild>
          <span
            className="flex"
            onMouseEnter={scheduleOpen}
            onMouseLeave={scheduleClose}
            onFocus={scheduleOpen}
            onBlur={scheduleClose}
          >
            {triggerElement}
          </span>
        </PopoverPrimitive.Anchor>
        <PopoverPrimitive.Portal>{popoverContent}</PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  }

  // ============================================================================
  // Click 模式：使用 Radix 标准的 Trigger
  // ============================================================================
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild disabled={disabled}>
        {triggerElement}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>{popoverContent}</PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

InfoPopover.displayName = "InfoPopover";
