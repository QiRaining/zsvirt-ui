"use client";

import { cn } from "@zstack/utils";
import * as React from "react";
import * as ResizablePrimitive from "react-resizable-panels";

/**
 * ResizablePanelGroup - 可调整大小的面板组容器
 * @example
 * <ResizablePanelGroup direction="horizontal">
 *   <ResizablePanel defaultSize={75}>左侧内容</ResizablePanel>
 *   <ResizableHandle />
 *   <ResizablePanel defaultSize={25}>右侧内容</ResizablePanel>
 * </ResizablePanelGroup>
 */
function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

/**
 * ResizablePanel - 可调整大小的面板
 */
function ResizablePanel({
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

export interface ResizableHandleProps extends React.ComponentProps<
  typeof ResizablePrimitive.PanelResizeHandle
> {
  /** 是否显示拖拽手柄图标 */
  withHandle?: boolean;
}

/**
 * ResizableHandle - 调整大小的拖拽条
 */
function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizableHandleProps) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        // 基础样式：细线分隔条
        "relative flex w-px items-center justify-center bg-neutral-300",
        // 可点击区域扩展（使拖拽更容易）
        "after:absolute after:inset-y-0 after:left-1/2 after:w-2 after:-translate-x-1/2",
        // hover 和 active 状态
        "hover:bg-theme-500 active:bg-theme-600 cursor-col-resize transition-colors",
        // 焦点状态（无障碍）
        "focus-visible:ring-theme-500 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-none",
        // 垂直方向时的样式
        "data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
        "data-[panel-group-direction=vertical]:cursor-row-resize",
        "data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-2",
        "data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0",
        "data-[panel-group-direction=vertical]:after:-translate-y-1/2",
        "[&[data-panel-group-direction=vertical]>div]:rotate-90",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="hover:bg-theme-500 z-10 flex h-6 w-1 items-center justify-center rounded-full bg-neutral-400 transition-colors">
          {/* 简单的拖拽指示器 - 三个点 */}
          <div className="flex flex-col gap-0.5">
            <div className="bg-neutral-0 h-0.5 w-0.5 rounded-full" />
            <div className="bg-neutral-0 h-0.5 w-0.5 rounded-full" />
            <div className="bg-neutral-0 h-0.5 w-0.5 rounded-full" />
          </div>
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
