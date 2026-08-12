import { Icon } from "@zstack/icon";
import type React from "react";

export interface FlowLayout {
  svgWidth: number;
  nodeW: number;
  gap: number;
  startX: number;
  getNodeX: (index: number) => number;
}

export interface NodeConfig {
  x: number;
  y: number;
  label: string;
  bg: string;
  border: string;
  nodeW: number;
  /** Icon type from @zstack/icon */
  icon: string;
  /** Icon semantic color category */
  iconColor: Parameters<typeof Icon>[0]["color"];
  /** Icon color number (deeper shade of node bg) */
  iconColorNumber: Parameters<typeof Icon>[0]["colorNumber"];
  infoTooltip?: React.ReactNode;
}

export interface FlowProps {
  layout: FlowLayout;
}

export interface SeparatorProps {
  layout: FlowLayout;
}
