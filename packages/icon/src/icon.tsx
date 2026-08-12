import type { Color } from "@zstack/utils";
import { cn, getSemanticColor, getNeutralColor } from "@zstack/utils";
import * as React from "react";

import { Icons } from "./icons-mapping.ts";

export const getColor = (
  color: Color.ISemantic | "neutral",
  number?: Color.INeutralNumber | Color.ISemanticNumber,
  mode?: "light" | "dark",
) => {
  if (color === "neutral") {
    // @ts-expect-error 参数类型不匹配，待重构类型定义
    // todo: 规约颜色
    return getNeutralColor(mode, number);
  }
  return getSemanticColor(color, mode, number as Color.ISemanticNumber);
};

export type IconName = keyof typeof Icons;

export { Icons };

interface IconProps extends React.SVGProps<SVGSVGElement> {
  type: IconName;
  color?: Color.ISemantic | "neutral";
  colorNumber?: Color.INeutralNumber;
  size?: number | string;
}

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ type, className, color, colorNumber, size, ...props }, ref) => {
    const IconComponent = Icons[type];
    if (!IconComponent) {
      return null;
    }
    const fill = color ? getColor(color, colorNumber, "light") : "";
    const { style, ...restProps } = props;
    return (
      <IconComponent
        ref={ref}
        size={size}
        className={cn("h-[16px] w-[16px] fill-current", className)}
        style={{ fill: fill, color: fill, ...style }}
        {...restProps}
      />
    );
  },
);

Icon.displayName = "Icon";
