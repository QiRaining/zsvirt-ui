"use client";

import {
  prepareWithSegments,
  layout,
  layoutWithLines,
} from "@chenglou/pretext";
import { cn } from "@zstack/utils";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { useIntl } from "react-intl";

export interface LongTextProps {
  /** The text value to display */
  value?: string | null;
  /** Whether the field is editable (affects empty state display) */
  canModify?: boolean;
  /** Maximum number of visible lines before truncation (default: 3) */
  maxLines?: number;
  /** Custom class name */
  className?: string;
}

const LINE_HEIGHT = 20;
// Match the actual CSS font stack: 14px = Tailwind default body font-size
const FONT = '14px "PingFang SC", "Microsoft YaHei", sans-serif';

/**
 * LongText - Multi-line text display component with inline expand/collapse
 *
 * Displays text with multi-line truncation. When text overflows,
 * shows a "...更多" link inline at the end of truncated text,
 * and a "收起" link inline after full text when expanded.
 *
 * Uses @chenglou/pretext for pure-arithmetic text measurement,
 * avoiding DOM reflow entirely. `prepareWithSegments()` runs once
 * per text change; `layout()` runs on resize at ~0.09ms.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <LongText value={detail.description} />
 *
 * // With editable empty state
 * <LongText value={detail.description} canModify />
 *
 * // Custom line count
 * <LongText value={detail.description} maxLines={5} />
 * ```
 */
export const LongText: React.FC<LongTextProps> = ({
  value,
  canModify = false,
  maxLines = 3,
  className,
}) => {
  const intl = useIntl();
  const containerRef = useRef<HTMLDivElement>(null);
  const [truncatedText, setTruncatedText] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const moreText = intl.formatMessage({ id: "more", defaultMessage: "More" });
  const collapseText = intl.formatMessage({
    id: "showUp",
    defaultMessage: "Fold up.",
  });

  // Cache prepareWithSegments result — only recompute when value changes
  const prepared = useMemo(() => {
    if (!value) return null;
    return prepareWithSegments(value, FONT, { whiteSpace: "pre-wrap" });
  }, [value]);

  // Track container width via ResizeObserver (no text measurement, no reflow)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width =
          entry.contentBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
        setContainerWidth(width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Pure-arithmetic truncation: runs when prepared text, width, or maxLines change
  useEffect(() => {
    if (expanded || !prepared || !value || containerWidth <= 0) {
      return;
    }

    const { lineCount } = layout(prepared, containerWidth, LINE_HEIGHT);

    if (lineCount <= maxLines) {
      setTruncatedText(null);
      return;
    }

    // Get all lines to extract text for the first maxLines lines
    const { lines } = layoutWithLines(prepared, containerWidth, LINE_HEIGHT);

    // Concatenate text from the first maxLines lines
    let truncated = "";
    for (let i = 0; i < maxLines && i < lines.length; i++) {
      truncated += lines[i].text;
    }

    // Check if suffix fits on the last visible line
    const suffix = `... ${moreText}`;
    const suffixPrepared = prepareWithSegments(suffix, FONT);
    const { lines: suffixLines } = layoutWithLines(
      suffixPrepared,
      Infinity,
      LINE_HEIGHT,
    );
    const suffixWidth = suffixLines[0]?.width ?? 0;

    const lastLine = lines[maxLines - 1];
    if (lastLine && lastLine.width + suffixWidth > containerWidth) {
      // Last line can't fit suffix — trim characters until it fits
      while (truncated.length > 0) {
        const testText = truncated + suffix;
        const testPrepared = prepareWithSegments(testText, FONT);
        const testResult = layout(testPrepared, containerWidth, LINE_HEIGHT);
        if (testResult.lineCount <= maxLines) break;
        truncated = truncated.slice(0, -1);
      }
    }

    setTruncatedText(truncated);
  }, [prepared, value, containerWidth, maxLines, expanded, moreText]);

  // Handle empty value
  if (value === undefined || value === null || value === "") {
    const emptyText = canModify
      ? intl.formatMessage({ id: "NA", defaultMessage: "Empty" })
      : "-";
    return (
      <span
        className={cn(
          "text-neutral-500",
          canModify && "cursor-pointer",
          className,
        )}
      >
        {emptyText}
      </span>
    );
  }

  const handleToggle = () => {
    setExpanded((prev) => !prev);
  };

  const textStyle: React.CSSProperties = {
    wordBreak: "break-all",
    lineHeight: `${LINE_HEIGHT}px`,
  };

  // Not overflowing — show plain text
  if (truncatedText === null && !expanded) {
    return (
      <div
        ref={containerRef}
        className={cn("relative max-w-full min-w-0", className)}
      >
        <div style={textStyle}>{value}</div>
      </div>
    );
  }

  // Expanded state
  if (expanded) {
    return (
      <div
        ref={containerRef}
        className={cn("relative max-w-full min-w-0", className)}
      >
        <div style={textStyle}>
          {value}
          <span
            className="text-theme-600 ml-1 cursor-pointer text-xs whitespace-nowrap"
            onClick={handleToggle}
          >
            {collapseText}
          </span>
        </div>
      </div>
    );
  }

  // Collapsed + overflowing — show truncated text with inline "... 更多"
  return (
    <div
      ref={containerRef}
      className={cn("relative max-w-full min-w-0", className)}
    >
      <div style={textStyle}>
        {truncatedText}...
        <span
          className="text-theme-600 ml-1 cursor-pointer text-xs whitespace-nowrap"
          onClick={handleToggle}
        >
          {moreText}
        </span>
      </div>
    </div>
  );
};

LongText.displayName = "LongText";

export default LongText;
