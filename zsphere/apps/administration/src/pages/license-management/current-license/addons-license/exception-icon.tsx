import { Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import React from "react";

interface ExceptionIconProps {
  /**
   * 是否显示异常图标
   */
  show: boolean;
  /**
   * Tooltip提示内容
   */
  tooltipTitle: React.ReactNode;
}

/**
 * 异常状态图标组件
 */
const ExceptionIcon: React.FC<ExceptionIconProps> = ({
  show,
  tooltipTitle,
}) => {
  if (!show) {
    return null;
  }

  return (
    <Tooltip title={tooltipTitle}>
      <Icon size={16} type="alert-triangle-fill" color="alert" />
    </Tooltip>
  );
};

export default ExceptionIcon;
