"use client";

import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import * as React from "react";

import type { TreeNodeRendererProps } from "./types";

export interface DefaultTreeNodeProps<
  T = unknown,
> extends TreeNodeRendererProps<T> {
  showToggle?: boolean;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
}

export function DefaultTreeNode<T = unknown>({
  node,
  style,
  dragHandle,
  onDoubleClickExpand,
  showToggle = true,
  icon,
  extra,
}: DefaultTreeNodeProps<T>) {
  const isSelected = node.isSelected;
  const isDisabled = node.data.disabled;

  return (
    <div
      style={style}
      ref={dragHandle}
      className={cn(
        "group flex cursor-pointer items-center gap-1 rounded-xs py-0.5 pr-2 transition-colors",
        "hover:bg-neutral-100",
        isSelected && "bg-theme-100 hover:bg-theme-100",
        node.state.isDragging && "opacity-40",
        node.state.willReceiveDrop &&
          "bg-theme-50 ring-theme-400 ring-2 ring-inset",
        isDisabled && "cursor-not-allowed opacity-50",
      )}
      onClick={(e) => {
        if (isDisabled) {
          return;
        }
        e.stopPropagation();
        node.select();
      }}
      onDoubleClick={onDoubleClickExpand}
    >
      {/* 展开/折叠按钮 */}
      {showToggle && (
        <button
          type="button"
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-xs p-0 hover:bg-neutral-200",
            !node.isInternal && "invisible",
          )}
          onClick={(e) => {
            e.stopPropagation();
            node.toggle();
          }}
        >
          {node.isOpen ? (
            <Icon type="arrow-ios-down" className="h-4 w-4 text-neutral-500" />
          ) : (
            <Icon type="arrow-ios-right" className="h-4 w-4 text-neutral-500" />
          )}
        </button>
      )}

      {/* 自定义图标 */}
      {icon && <span className="shrink-0">{icon}</span>}

      {/* 节点名称 */}
      <span
        className={cn(
          "flex-1 truncate text-sm",
          isSelected ? "text-theme-700 font-medium" : "text-neutral-700",
        )}
      >
        {node.data.name}
      </span>

      {/* 额外内容 */}
      {extra && <span className="shrink-0">{extra}</span>}
    </div>
  );
}

export default DefaultTreeNode;
