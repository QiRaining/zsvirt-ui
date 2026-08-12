import type { Color } from "@zstack/utils";
import React from "react";

import type { Icons } from "./icons-mapping";

export type IconTypes = keyof typeof Icons;

export interface IIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  type: IconTypes;
  path?: string;
  color?: Color.ISemantic | "neutral";
  colorNumber?: Color.INeutralNumber;
  size?: number;
  mode?: "light" | "dark";
  spin?: boolean;
  state?: "enable" | "disable" | "unknown";
}
