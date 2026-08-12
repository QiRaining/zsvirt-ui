"use client";
import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import React, { useMemo } from "react";

import { Text } from "./text";

// 辅助函数：将 hex 颜色转换为 RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// 辅助函数：使颜色变深
const darkenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return hex;
  }

  const factor = 1 - percent / 100;
  const r = Math.round(rgb.r * factor);
  const g = Math.round(rgb.g * factor);
  const b = Math.round(rgb.b * factor);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

// 辅助函数：使颜色变浅
const lightenColor = (hex: string, percent: number): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return hex;
  }

  const factor = percent / 100;
  const r = Math.round(rgb.r + (255 - rgb.r) * factor);
  const g = Math.round(rgb.g + (255 - rgb.g) * factor);
  const b = Math.round(rgb.b + (255 - rgb.b) * factor);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const tagVariants = cva(
  "rounded-xs bg-neutral-100 text-neutral-200 " +
    "box-border flex max-w-fit items-center text-sm",
  {
    variants: {
      size: {
        large: "h-8 px-3",
        medium: "h-6 px-2",
        small: "h-5.5 px-2",
      },
      theme: {
        blue: "border-blue-100 bg-blue-100 text-blue-600",
        teal: "border-teal-100 bg-teal-100 text-teal-600",
        violet: "border-violet-100 bg-violet-100 text-violet-600",
        purple: "border-purple-100 bg-purple-100 text-purple-600",
        red: "border-red-100 bg-red-100 text-red-600",
        yellow: "border-yellow-100 bg-yellow-100 text-yellow-600",
        "yellow-green":
          "text-yellow-green-600 bg-yellow-green-100 border-yellow-green-100",
        green: "border-green-100 bg-green-100 text-green-600",
      },
      level: {
        strong: "text-neutral-0 border-neutral-700 bg-neutral-700",
        base: "border-neutral-200 bg-neutral-200 text-neutral-700",
        weak: "bg-neutral-0 border-neutral-400 text-neutral-700",
      },
    },
    compoundVariants: [
      {
        level: "strong",
        theme: "blue",
        className: "text-neutral-0 border-blue-500 bg-blue-500",
      },
      {
        level: "strong",
        theme: "teal",
        className: "text-neutral-0 border-teal-500 bg-teal-500",
      },
      {
        level: "strong",
        theme: "violet",
        className: "text-neutral-0 border-violet-500 bg-violet-500",
      },
      {
        level: "strong",
        theme: "purple",
        className: "text-neutral-0 border-purple-500 bg-purple-500",
      },
      {
        level: "strong",
        theme: "red",
        className: "text-neutral-0 border-red-500 bg-red-500",
      },
      {
        level: "strong",
        theme: "yellow",
        className: "text-neutral-0 border-yellow-500 bg-yellow-500",
      },
      {
        level: "strong",
        theme: "yellow-green",
        className: "text-neutral-0 bg-yellow-green-500 border-yellow-green-500",
      },
      {
        level: "strong",
        theme: "green",
        className: "text-neutral-0 border-green-500 bg-green-500",
      },
      {
        level: "base",
        theme: "blue",
        className: "border-blue-100 bg-blue-100 text-blue-600",
      },
      {
        level: "base",
        theme: "teal",
        className: "border-teal-100 bg-teal-100 text-teal-600",
      },
      {
        level: "base",
        theme: "violet",
        className: "border-violet-100 bg-violet-100 text-violet-600",
      },
      {
        level: "base",
        theme: "purple",
        className: "border-purple-100 bg-purple-100 text-purple-600",
      },
      {
        level: "base",
        theme: "red",
        className: "border-red-100 bg-red-100 text-red-600",
      },
      {
        level: "base",
        theme: "yellow",
        className: "border-yellow-100 bg-yellow-100 text-yellow-600",
      },
      {
        level: "base",
        theme: "yellow-green",
        className:
          "text-yellow-green-600 bg-yellow-green-100 border-yellow-green-100",
      },
      {
        level: "base",
        theme: "green",
        className: "border-green-100 bg-green-100 text-green-600",
      },
      {
        level: "weak",
        theme: "blue",
        className: "bg-neutral-0 border-blue-400 text-blue-600",
      },
      {
        level: "weak",
        theme: "teal",
        className: "bg-neutral-0 border-teal-400 text-teal-600",
      },
      {
        level: "weak",
        theme: "violet",
        className: "bg-neutral-0 border-violet-400 text-violet-600",
      },
      {
        level: "weak",
        theme: "purple",
        className: "bg-neutral-0 border-purple-400 text-purple-600",
      },
      {
        level: "weak",
        theme: "red",
        className: "bg-neutral-0 border-red-400 text-red-600",
      },
      {
        level: "weak",
        theme: "yellow",
        className: "bg-neutral-0 border-yellow-400 text-yellow-600",
      },
      {
        level: "weak",
        theme: "yellow-green",
        className: "text-yellow-green-600 bg-neutral-0 border-yellow-green-400",
      },
      {
        level: "weak",
        theme: "green",
        className: "bg-neutral-0 border-green-400 text-green-600",
      },
    ],
    defaultVariants: {
      size: "medium",
      level: "base",
    },
  },
);

export interface TagProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof tagVariants> {
  round?: boolean;
  closable?: boolean;
  color?: string;
  onClose?: (event?: React.MouseEvent<Element>) => void;
  autoOverflowEllipsis?: boolean;
  disableTooltip?: boolean;
}

export const Tag = (props: TagProps) => {
  const {
    children,
    className,
    level,
    onClose,
    closable,
    round,
    size,
    theme: _theme,
    color,
    autoOverflowEllipsis = true,
    disableTooltip = false,
    onClick,
    ...rest
  } = props;
  let theme = _theme;
  let isCustomColor = false;

  if (color) {
    // 首先检查是否是颜色名称字符串
    const colorNameMap: Record<string, typeof theme> = {
      blue: "blue",
      teal: "teal",
      violet: "violet",
      purple: "purple",
      red: "red",
      yellow: "yellow",
      "yellow-green": "yellow-green",
      green: "green",
    };

    if (colorNameMap[color.toLowerCase()]) {
      theme = colorNameMap[color.toLowerCase()];
    } else {
      // 检查是否是预置的 HEX 颜色
      switch (color) {
        case "#186EAE":
        case "#0076F7":
        case "#005BD4":
          theme = "blue";
          break;
        case "#2CA6E6":
        case "#01C8E6":
        case "#039CC4":
          theme = "teal";
          break;
        case "#7385A8":
        case "#4F57FF":
        case "#3940DB":
          theme = "violet";
          break;
        case "#8A65D4":
        case "#9A45E4":
        case "#7A35C3":
          theme = "purple";
          break;
        case "#D14B52":
        case "#FF3F46":
        case "#DB2E43":
        case "#F93940":
          theme = "red";
          break;
        case "#DF9900":
        case "#FF9000":
        case "#DB7200":
          theme = "yellow";
          break;
        case "#918A12":
        case "#ADCC00":
        case "#92B102":
        case "#A9C800":
          theme = "yellow-green";
          break;
        case "#318857":
        case "#5BD149":
        case "#3CB335":
        case "#57D344":
          theme = "green";
          break;
        default:
          // 自定义颜色
          isCustomColor = true;
          break;
      }
    }
  }

  // 计算自定义颜色的背景色和文字颜色
  const customStyles = useMemo(() => {
    if (!isCustomColor || !color) {
      return {};
    }

    // 根据 level 决定背景色和文字颜色
    if (level === "strong") {
      // strong 模式：背景色为原色，文字为白色
      return {
        backgroundColor: color,
        color: "#ffffff",
        borderColor: color,
      };
    } else if (level === "weak") {
      // weak 模式：背景色为白色，文字为深色，边框为浅色
      const textColor = darkenColor(color, 20);
      return {
        backgroundColor: "#ffffff",
        color: textColor,
        borderColor: color,
      };
    }
    // base 模式（默认）：背景色为浅色，文字为深色
    const bgColor = lightenColor(color, 80); // 背景色变浅 80%
    const textColor = darkenColor(color, 30); // 文字颜色变深 30%
    return {
      backgroundColor: bgColor,
      color: textColor,
      borderColor: bgColor,
    };
  }, [isCustomColor, color, level]);

  // 处理 onClick 事件，防止冒泡到表格选择事件
  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (onClick) {
      e.stopPropagation();
      onClick(e);
    }
  };

  return (
    <div
      className={cn(
        tagVariants({ level, size, theme }),
        className,
        round ? "rounded-xl" : "",
        onClick && "hover:text-opacity-80 cursor-pointer",
      )}
      style={isCustomColor ? customStyles : undefined}
      onClick={handleClick}
      {...rest}
    >
      {autoOverflowEllipsis ? (
        <Text disableTooltip={disableTooltip}>{children}</Text>
      ) : (
        <>{children}</>
      )}
      {closable && (
        <div className="flex cursor-pointer items-center justify-center">
          <Icon
            type="close"
            className="ml-0.5 h-4 w-4 cursor-pointer"
            onClick={onClose}
          />
        </div>
      )}
    </div>
  );
};
