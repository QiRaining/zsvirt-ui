import { Icon, type IconTypes } from "@zstack/icon";
import { Color, getSemanticColor, getNeutralColor } from "@zstack/utils";
import { Tag } from "antd";
import cls from "classnames";
import React, { FC, useMemo } from "react";

import { getBaseCls } from "../../_utils/common";

import "./style.less";

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
    icon: IconTypes;
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
  icon?: IconTypes;
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

const baseCls = getBaseCls("state");

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
  icon?: IconTypes;
  fixType?: "dot" | "icon";
  color?: {
    color: Color.ISemantic | "neutral";
    number?: Color.INeutralNumber | Color.ISemanticNumber;
  };
}) => React.ReactNode = ({ type = "success", icon, fixType, color }) => {
  if (!fixType) return;

  const targetColor = color?.color || stateMap[type].color;

  if (fixType === "dot") {
    return (
      <span
        className={`${baseCls}-prefix-dot`}
        style={{ backgroundColor: getColor(targetColor, color?.number) }}
      />
    );
  }
  if (fixType === "icon") {
    const targetIcon = icon || stateMap[type].icon;
    const isLoadingIcon = targetIcon === "loader";
    return (
      <Icon
        type={targetIcon}
        className={isLoadingIcon ? `${baseCls}-spin` : undefined}
        color={targetColor}
        colorNumber={
          targetColor === "neutral"
            ? (color?.number as Color.INeutralNumber)
            : undefined
        }
        fontSize={16}
      />
    );
  }
};

const State: FC<IStateProps> = ({
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

  const targetColor = color?.color || stateMap[type].color;

  const renderName = useMemo(() => {
    if (contentType === "tag") {
      return (
        <Tag
          className={`${baseCls}-tag`}
          color={getColor(targetColor, color?.number || 600)}
        >
          {name}
        </Tag>
      );
    }
    return name;
  }, [color, contentType, name, targetColor]);

  const fixClassName = useMemo(() => {
    const fixType = suffix || prefix;
    const fixPosition = suffix ? "suffix" : "prefix";
    if (fixType) {
      return `has-${fixType}-${fixPosition}`;
    }
    return "";
  }, [suffix, prefix]);

  return (
    <span className={cls(baseCls, className)}>
      {contentType ? (
        renderName
      ) : (
        <>
          {renderFix.prefix}
          <span className={`${baseCls}-name ${fixClassName}`}>
            {renderName}
          </span>
          {renderFix.suffix}
        </>
      )}
    </span>
  );
};

export default State;
