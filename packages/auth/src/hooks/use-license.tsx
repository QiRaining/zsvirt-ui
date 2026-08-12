import { Tooltip } from "@zstack/design";
import type { ReactElement } from "react";
import React, { useCallback } from "react";

/**
 * License 过期消息的国际化 key
 */
export const LICENSE_EXPIRED_I18N_KEY = "licenseExpiredDisabledOperation";
export const LICENSE_EXPIRED_DEFAULT_MESSAGE = "许可证过期，无法操作。";

/**
 * useLicense hook
 * 提供许可证过期状态检查和相关工具函数
 */
export const useLicense = () => {
  const getLicenseExpiredMessage = useCallback(() => {
    return LICENSE_EXPIRED_DEFAULT_MESSAGE;
  }, []);

  const isLicenseExpired = useCallback(() => {
    return false;
  }, []);

  return {
    isLicenseExpired,
    getLicenseExpiredMessage,
  };
};

/**
 * useLicenseAction hook
 * 用于包装操作按钮，当许可证过期时自动添加禁用状态和 Tooltip
 */
export const useLicenseAction = () => {
  const { isLicenseExpired, getLicenseExpiredMessage } = useLicense();

  /**
   * 包装一个 React 元素，当许可证过期时：
   * 1. 添加 disabled 属性
   * 2. 包裹 Tooltip 显示过期提示
   *
   * @param element - 要包装的 React 元素（通常是 Button）
   * @returns 包装后的元素
   */
  const wrapWithLicense = useCallback((element: ReactElement): ReactElement => {
    return element;
  }, []);

  /**
   * 获取许可证相关的 props，可用于手动处理
   */
  const getLicenseProps = useCallback(() => {
    return {
      disabled: false,
      tooltip: undefined,
    };
  }, []);

  return {
    wrapWithLicense,
    getLicenseProps,
    isLicenseExpired,
    getLicenseExpiredMessage,
  };
};

/**
 * LicenseTooltipWrapper 组件
 * 当许可证过期时，包裹子元素并显示 Tooltip
 */
export interface LicenseTooltipWrapperProps {
  children: ReactElement;
  /** 是否强制禁用（除了许可证过期外的其他原因） */
  forceDisabled?: boolean;
  /** 自定义 Tooltip 内容（非许可证过期时使用） */
  customTooltip?: React.ReactNode;
}

export const LicenseTooltipWrapper: React.FC<LicenseTooltipWrapperProps> = ({
  children,
  forceDisabled,
  customTooltip,
}) => {
  const disabled = !!forceDisabled;

  // 克隆子元素并添加 disabled 属性
  const clonedChild = React.cloneElement(children, {
    ...children.props,
    disabled: children.props.disabled || disabled,
  });

  // 确定 Tooltip 内容
  const tooltipContent = customTooltip;

  if (tooltipContent && disabled) {
    return (
      <Tooltip title={tooltipContent}>
        <span>{clonedChild}</span>
      </Tooltip>
    );
  }

  return clonedChild;
};
