"use client";

import { Icon, type IconName } from "@zstack/icon";
import { cn, Color } from "@zstack/utils";
import { Illustration, IllustrationTypes } from "@zstack/zsphere-illustration";
import React from "react";

export interface IconStateProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** 资源图标类型 */
  resourceKey: IconName;
  /** 图标颜色 */
  color?: Color.ISemantic;
  /** 资源状态 */
  state: string;
  /** 图标大小 */
  size?: number;
  /** 颜色数值 */
  colorNumber?: Color.INeutralNumber;
  /** 自定义类名 */
  className?: string;
}

/**
 * 状态到图标的映射
 */
const stateToIcon: [string, string[]][] = [
  [
    "state-loader",
    [
      "starting",
      "stopping",
      "expunging",
      "migrating",
      "destroying",
      "rebooting",
      "resuming",
    ],
  ],
  ["state-deleted", ["destroyed"]],
  ["state-alert-new", ["warning"]],
  ["state-connecting", ["connecting"]],
  ["state-connected", ["connected", "enabled"]],
  ["state-pause-new", ["pause", "paused"]],
  ["state-play-new", ["running"]],
  ["state-question", ["unknow"]],
  ["state-disconnected", ["disconnected"]],
  ["state-stop-new", ["stopped", "disabled"]],
  ["state-maintenance", ["maintenance"]],
  ["state-preMaintenance", ["premaintenance"]],
];

/**
 * 状态到圆点的映射
 */
const stateToDot: [string, string[]][] = [
  ["state-connected", ["connected"]],
  ["state-disconnected", ["disconnected"]],
  ["state-connecting", ["connecting"]],
];

/**
 * 获取状态对应的颜色类名
 */
const getStateColorClass = (stateKey: string): string => {
  switch (stateKey) {
    case "state-connected":
      return "bg-zsv-positive-500";
    case "state-disconnected":
      return "bg-zsv-danger-500";
    case "state-connecting":
      return "bg-zsv-alert-500";
    default:
      return "bg-zsv-neutral-400";
  }
};

/**
 * IconState 图标状态组件
 *
 * 用于显示带状态指示的资源图标
 *
 * @example
 * ```tsx
 * <IconState
 *   resourceKey="vm"
 *   state="running"
 *   size={24}
 * />
 * ```
 */
export const IconState: React.FC<IconStateProps> = ({
  resourceKey,
  state,
  color,
  size = 16,
  colorNumber,
  className,
  ...rest
}) => {
  const normalizedState = state.toLowerCase();

  const dotKey = stateToDot.find((item) =>
    item[1].includes(normalizedState),
  )?.[0];

  const stateKey =
    stateToIcon.find((item) => item[1].includes(normalizedState))?.[0] ??
    "state-unknow";

  const stateDom = dotKey ? (
    <div
      style={{
        width: size - 7,
        height: size - 7,
        borderRadius: (size - 7) / 2,
      }}
      className={cn(
        "absolute right-0 bottom-0",
        "border border-white",
        getStateColorClass(dotKey),
      )}
    />
  ) : (
    <div className="absolute right-0 bottom-0">
      <Illustration type={stateKey as IllustrationTypes} size={size - 6} />
    </div>
  );

  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
      {...rest}
    >
      <Icon type={resourceKey} color={color} colorNumber={colorNumber} />
      {stateDom}
    </span>
  );
};

IconState.displayName = "IconState";

export default IconState;
