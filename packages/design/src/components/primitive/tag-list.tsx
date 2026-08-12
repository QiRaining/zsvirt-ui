"use client";
/**
 * 下面这个组件弄了接近15个小时，改了7版方案
 * 是我，GPT-o1和Claude 3.5 Sonnet对React，react-compiler，HTML，CSS，JS的全部理解了
 */

import { cn } from "@zstack/utils";
import React, { useState, useRef, useCallback, useLayoutEffect } from "react";

import type { TagProps } from "./tag.tsx";
import { Tag } from "./tag.tsx";
import { Tooltip } from "./tooltip";

interface TagItem extends TagProps {
  label: string;
  id: string;
  onClick?: (e: React.MouseEvent) => void;
}

interface TagListProps {
  tags: TagItem[];
  className?: string;
  /** 容器宽度，如果不提供则自动计算 */
  containerWidth?: number;
}

// 估算宽度，如果其它的语言可能会不准确，需要适配
// 还有种做法是实际commit DOM之后再计算，但是这样会有性能问题
const calculateTextWidth = (text: string) => {
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    if (/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uff60]/.test(text[i])) {
      // 中文宽度
      width += 14;
    } else {
      // 英文宽度
      width += 7;
    }
  }
  return width;
};

/**
 * TagList 组件 - 用于在表格单元格中展示标签列表
 * 特点：
 * 1. 自动处理标签溢出显示 +n
 * 2. 支持动态列宽调整
 * 3. 适配虚拟滚动
 */
export const TagList: React.FC<TagListProps> = ({
  tags,
  className,
  containerWidth,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);
  const [overflow, setOverflow] = useState<boolean>(false);

  // 使用 useCallback 包装计算函数
  const calculateVisibleTags = useCallback(
    (availableWidth: number) => {
      if (!tags.length || availableWidth <= 0) {
        setVisibleCount(0);
        setOverflow(false);
        return;
      }

      const gap = 4;
      let count = 0;
      let totalWidth = 0;
      let isLastTagTruncated = false;

      // 计算第一个标签
      const firstTagWidth = calculateTextWidth(tags[0].label) + 16;
      totalWidth = firstTagWidth;
      count = 1;

      // 计算剩余标签
      for (let i = 1; i < tags.length; i++) {
        const tagWidth = calculateTextWidth(tags[i].label) + 16;
        const newWidth = totalWidth + gap + tagWidth;

        if (newWidth <= availableWidth) {
          totalWidth = newWidth;
          count = i + 1;
        } else {
          // 尝试添加最后一个被截断的标签
          const remainingSpace = availableWidth - totalWidth - gap;
          if (remainingSpace >= 48) {
            // 至少预留30px的空间显示截断的标签
            count = i + 1;
            isLastTagTruncated = true;
          }
          break;
        }
      }

      setVisibleCount(count);
      setOverflow(
        count < tags.length ||
          isLastTagTruncated ||
          firstTagWidth > availableWidth,
      );
      setIsReady(true);
    },
    [tags],
  );

  useLayoutEffect(() => {
    if (!containerRef.current || tags.length === 0) {
      setVisibleCount(0);
      return;
    }

    // 确保容器已经正确渲染
    const element = containerRef.current;
    if (!element.offsetParent) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (width > 0) {
        // 使用 requestAnimationFrame 拿到渲染完成的精确值
        requestAnimationFrame(() => {
          calculateVisibleTags(width);
        });
      }
    });

    resizeObserver.observe(element);

    // 使用 requestAnimationFrame 拿到渲染完成的精确值
    requestAnimationFrame(() => {
      const initialWidth = containerWidth || element.offsetWidth;
      if (initialWidth > 0) {
        calculateVisibleTags(initialWidth);
      }
    });

    return () => {
      resizeObserver.disconnect();
    };
  }, [calculateVisibleTags, containerWidth, tags, containerRef]);

  if (tags.length === 0) {
    return null;
  }

  const visibleTags = tags.slice(0, visibleCount);
  const hiddenCount = tags.length - visibleCount;

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex items-center gap-1",
        !isReady && "invisible",
        className,
      )}
      style={containerWidth ? { width: containerWidth } : undefined}
    >
      <Tooltip
        title={
          overflow ? (
            <div className="flex max-w-80 flex-wrap gap-1">
              {tags.map((tag) => (
                <Tag
                  key={tag.id}
                  theme={tag.theme}
                  level={tag.level}
                  color={tag.color}
                  className={cn("h-fit break-all whitespace-normal")}
                  autoOverflowEllipsis={false}
                  // 防止导致冒泡到表格的选择事件
                  onClick={
                    tag.onClick
                      ? (e) => {
                          e.stopPropagation();
                          tag.onClick?.(e);
                        }
                      : undefined
                  }
                >
                  {tag.label}
                </Tag>
              ))}
            </div>
          ) : null
        }
        placement="top"
        open={tooltipOpen}
        onOpenChange={setTooltipOpen}
        className="bg-neutral-0 shadow-deep max-w-80 text-neutral-700"
        arrowClassName="fill-neutral-0"
      >
        <div className="flex min-w-0 items-center gap-1">
          {visibleTags.map((tag, index) => (
            <Tag
              key={tag.id}
              theme={tag.theme}
              level={tag.level}
              color={tag.color}
              className={cn(
                "",
                index === visibleTags.length - 1 ? "truncate" : "shrink-0",
              )}
              disableTooltip
              onClick={
                tag.onClick
                  ? (e) => {
                      e.stopPropagation();
                      tag.onClick?.(e);
                    }
                  : undefined
              }
            >
              {tag.label}
            </Tag>
          ))}
          {hiddenCount > 0 && (
            <span className="shrink-0 text-sm whitespace-nowrap text-neutral-600">
              +{hiddenCount}
            </span>
          )}
        </div>
      </Tooltip>
    </div>
  );
};
