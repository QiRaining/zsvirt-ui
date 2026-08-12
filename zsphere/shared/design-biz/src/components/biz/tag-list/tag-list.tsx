"use client";

import { Tag } from "@zstack/design";
import { cn } from "@zstack/utils";
import React, { useState, useRef, useEffect } from "react";
import { useIntl } from "react-intl";

/**
 * 简单的 useSize hook 实现
 * 用于监测元素尺寸变化
 */
function useSize(ref: React.RefObject<HTMLElement | null>) {
  const [size, setSize] = useState<{ width?: number; height?: number }>({});

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateSize = () => {
      setSize({
        width: element.offsetWidth,
        height: element.offsetHeight,
      });
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  return size;
}

export interface TagItem {
  /** 标签名称 */
  name?: string;
  /** 标签唯一标识 */
  uuid?: string;
  /** 标签颜色 */
  color?: string;
}

export interface TagListProps {
  /** 标签列表 */
  tags: TagItem[];
  /** 自定义类名 */
  className?: string;
}

/**
 * TagList 标签列表组件
 *
 * 用于显示一组标签，支持溢出时展开/收起
 *
 * @example
 * ```tsx
 * <TagList
 *   tags={[
 *     { name: "标签1", uuid: "1", color: "blue" },
 *     { name: "标签2", uuid: "2", color: "green" },
 *   ]}
 * />
 * ```
 */
export const TagList: React.FC<TagListProps> = ({ tags, className }) => {
  const intl = useIntl();
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const ghostListRef = useRef<HTMLDivElement>(null);
  const containerSize = useSize(containerRef);
  const ghostListSize = useSize(ghostListRef);

  const isOverflow =
    containerSize?.width &&
    ghostListSize?.width &&
    ghostListSize.width > containerSize.width;

  const renderTagList = () => (
    <>
      {tags.map((item) => (
        <Tag
          key={item.uuid || item.name}
          className={cn(
            "inline-flex items-center rounded px-2 py-0.5 text-xs",
            "bg-zsv-neutral-100 text-zsv-neutral-700",
            "border-zsv-neutral-300 border",
          )}
          style={item.color ? { backgroundColor: item.color } : undefined}
        >
          {item.name}
        </Tag>
      ))}
    </>
  );

  const renderBtn = () => (
    <button
      type="button"
      className={cn(
        "text-theme-600 hover:text-theme-500",
        "cursor-pointer text-sm",
        "ml-2 whitespace-nowrap",
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setVisible((value) => !value);
      }}
    >
      {visible
        ? intl.formatMessage({ id: "showUp", defaultMessage: "Fold up." })
        : intl.formatMessage({ id: "more", defaultMessage: "More" })}
    </button>
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden",
        !isOverflow && "overflow-visible",
        visible && "h-auto overflow-visible",
        className,
      )}
    >
      {/* 隐藏的完整列表，用于测量宽度 */}
      <div
        ref={ghostListRef}
        className="invisible absolute flex gap-1 whitespace-nowrap"
      >
        {renderTagList()}
      </div>

      {/* 实际显示的列表 */}
      {visible ? (
        <div className="flex flex-wrap items-center gap-1">
          {renderTagList()}
          {isOverflow && renderBtn()}
        </div>
      ) : (
        <div className="flex items-center">
          <div className="flex gap-1 overflow-hidden whitespace-nowrap">
            {renderTagList()}
          </div>
          {isOverflow && renderBtn()}
        </div>
      )}
    </div>
  );
};

TagList.displayName = "TagList";

export default TagList;
