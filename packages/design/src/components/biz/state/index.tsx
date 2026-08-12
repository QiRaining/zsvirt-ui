"use client";
import { Icon, type IconName } from "@zstack/icon";
import type { Color } from "@zstack/utils";
import { cn, getNeutralColor, getSemanticColor } from "@zstack/utils";
import React, { useMemo } from "react";

import { Loader } from "../../primitive/loader";
import { Text } from "../../primitive/text";

export type IType =
  | "queue"
  | "progress"
  | "success"
  | "error"
  | "warning"
  | "disabled"
  | "unknown"
  | "stopped"
  | "paused"
  | "maintenance"
  | "running";

export type IStateMap = {
  [key in IType]: {
    color: Color.ISemantic;
    icon: IconName;
  };
};
export interface IStateProps {
  name: string;
  color?: {
    color: Color.ISemantic | "neutral";
    number?: Color.INeutralNumber | Color.ISemanticNumber;
  };
  type?: IType;
  prefix?: "dot" | "icon";
  suffix?: "icon";
  contentType?: "text" | "tag";
  icon?: IconName;
  className?: string;
}

export const stateMap: IStateMap = {
  queue: {
    color: "pending",
    icon: "clock-fill",
  },
  progress: {
    color: "info",
    icon: "loader",
  },
  success: {
    color: "positive",
    icon: "checkmark-circle-fill",
  },
  error: {
    color: "danger",
    icon: "close-circle-fill",
  },
  warning: {
    color: "alert",
    icon: "alert-triangle-fill",
  },
  disabled: {
    color: "disabled",
    icon: "close-circle-fill",
  },
  unknown: {
    color: "disabled",
    icon: "question-mark-circle-fill",
  },
  stopped: {
    color: "danger",
    icon: "stop-circle-fill",
  },
  paused: {
    color: "alert",
    icon: "pause-circle-fill",
  },
  maintenance: {
    color: "alert",
    icon: "wrench-circle-fill",
  },
  running: {
    color: "positive",
    icon: "play-circle-fill",
  },
};

// todo theme
const mode = "light";

const getColor = (
  color: Color.ISemantic | "neutral",
  number?: Color.INeutralNumber | Color.ISemanticNumber,
) => {
  if (color === "neutral") {
    return getNeutralColor(mode, number as Color.INeutralNumber);
  }
  return getSemanticColor(color, mode, number as Color.ISemanticNumber);
};

const getFix: (params: {
  type?: IType;
  icon?: IconName;
  fixType?: "dot" | "icon";
  color?: {
    color: Color.ISemantic | "neutral";
    number?: Color.INeutralNumber | Color.ISemanticNumber;
  };
}) => React.ReactNode = ({ type = "success", icon, fixType, color }) => {
  if (!fixType) {
    return;
  }

  const targetColor = color?.color || stateMap[type].color;

  if (fixType === "dot") {
    return (
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: getColor(targetColor, color?.number) }}
      />
    );
  }
  if (fixType === "icon") {
    if ((icon || stateMap[type].icon) === "loader") {
      return <Loader />;
    }
    return (
      <Icon
        type={icon || stateMap[type].icon}
        style={{ color: getColor(targetColor, color?.number) }}
      />
    );
  }
};

export const State: React.FC<IStateProps> = ({
  className,
  color,
  type = "success",
  name,
  prefix = "icon",
  icon,
  suffix,
  contentType,
}) => {
  const renderPrefix = useMemo(
    () => getFix({ type, icon, fixType: prefix, color }),
    [color, icon, prefix, type],
  );

  const renderSuffix = useMemo(
    () => getFix({ type, icon, fixType: suffix, color }),
    [color, icon, suffix, type],
  );

  const renderFix = useMemo(() => {
    if (renderSuffix) {
      return {
        prefix: null,
        suffix: renderSuffix,
      };
    }
    return {
      prefix: renderPrefix,
      suffix: null,
    };
  }, [renderPrefix, renderSuffix]);

  const fixClassName = useMemo(() => {
    const fixType = suffix || prefix;
    const fixPosition = suffix ? "suffix" : "prefix";
    if (fixType) {
      return `has-${fixType}-${fixPosition}`;
    }
    return "";
  }, [suffix, prefix]);

  if (contentType === "text") {
    return (
      <Text className="vertical-middle inline-flex items-center">{name}</Text>
    );
  }

  return (
    <span className={cn("vertical-middle inline-flex items-center", className)}>
      {renderFix.prefix}
      <Text
        className={cn(
          "text-neutral-700",
          fixClassName && {
            "ml-1": fixClassName.includes("icon-prefix"),
            "ml-2": fixClassName.includes("dot-prefix"),
            "mr-1": fixClassName.includes("icon-suffix"),
            "mr-2": fixClassName.includes("dot-suffix"),
          },
        )}
      >
        {name}
      </Text>
      {renderFix.suffix}
    </span>
  );
};
