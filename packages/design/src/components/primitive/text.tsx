import { cn } from "@zstack/utils";
import React, { useRef, useState } from "react";

import { Tooltip } from "./tooltip";

export interface TextProps extends React.HTMLAttributes<HTMLDivElement> {
  disableTooltip?: boolean;
}

/**
 * 从 React children 中提取纯文本内容，用于 tooltip 显示。
 * 避免将交互式元素（如 <a> 标签）直接传入 tooltip title。
 */
function extractTextContent(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractTextContent).join("");
  }
  if (React.isValidElement(node) && node.props.children) {
    return extractTextContent(node.props.children);
  }
  return "";
}

export const Text = ({
  className,
  children,
  disableTooltip = false,
  ...props
}: TextProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldShowTooltip, setShouldShowTooltip] = useState<boolean | null>(
    null,
  );
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);

  const checkOverflow = () => {
    const element = ref.current;
    if (!element) {
      return false;
    }
    return (
      element.scrollHeight > element.clientHeight ||
      element.offsetWidth < element.scrollWidth
    );
  };

  const content = (
    <div
      className={cn("max-w-fit min-w-0 truncate break-all", className)}
      ref={ref}
      onMouseEnter={() => {
        if (!disableTooltip) {
          const needsTooltip = checkOverflow();
          setShouldShowTooltip(needsTooltip);
          setTooltipOpen(needsTooltip);
        }
      }}
      {...props}
    >
      {children}
    </div>
  );

  if (
    disableTooltip ||
    shouldShowTooltip === null ||
    shouldShowTooltip === false
  ) {
    return content;
  }

  // 提取纯文本作为 tooltip 内容，避免渲染交互式元素
  const tooltipTitle = extractTextContent(children) || children;

  return (
    <Tooltip
      title={tooltipTitle}
      open={tooltipOpen}
      onOpenChange={setTooltipOpen}
    >
      {content}
    </Tooltip>
  );
};

Text.displayName = "Text";
