"use client";

import { Button } from "@zstack/design";
import { cn } from "@zstack/utils";
import React from "react";
import { useIntl } from "react-intl";

export interface NotFoundProps {
  /** 页面类型：main 主应用 | app 子应用 */
  type?: "main" | "app";
  /** 自定义类名 */
  className?: string;
  /** 自定义错误图片 */
  errorImage?: string;
  /** 自定义提示文本 */
  message?: string;
  /** 是否显示返回按钮 */
  showBackButton?: boolean;
  /** 自定义返回按钮点击事件 */
  onBack?: () => void;
}

/**
 * NotFound 404 页面组件
 *
 * 用于显示页面不存在的错误提示
 *
 * @example
 * ```tsx
 * <NotFound type="app" />
 * ```
 */
export const NotFound: React.FC<NotFoundProps> = ({
  type: _type = "app",
  className,
  errorImage,
  message,
  showBackButton = true,
  onBack,
}) => {
  const intl = useIntl();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  const showButton =
    showBackButton &&
    typeof window !== "undefined" &&
    window.history.length > 2;

  return (
    <div
      className={cn(
        "flex min-h-[400px] w-full items-center justify-center",
        "bg-zsv-neutral-0",
        className,
      )}
    >
      <div className="flex flex-col items-center text-center">
        {/* 错误图片 */}
        {errorImage ? (
          <img
            src={errorImage}
            alt="404"
            className="mb-4 h-48 w-48 object-contain"
          />
        ) : (
          <div className="mb-4 flex h-48 w-48 items-center justify-center">
            <svg
              viewBox="0 0 200 200"
              className="text-zsv-neutral-300 h-full w-full"
              fill="currentColor"
            >
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <text
                x="100"
                y="110"
                textAnchor="middle"
                fontSize="40"
                fill="currentColor"
              >
                404
              </text>
            </svg>
          </div>
        )}

        {/* 404 数字 */}
        <div className="text-zsv-neutral-300 mb-4 text-6xl font-bold">404</div>

        {/* 提示文本 */}
        <div className="text-zsv-neutral-600 mb-6 text-lg">
          {message ||
            intl.formatMessage({
              id: "exception.page.404.alert",
              defaultMessage: "Page not found.",
            })}
        </div>

        {/* 返回按钮 */}
        {showButton && (
          <Button variant="primary" onClick={handleBack}>
            {intl.formatMessage({
              id: "backup.prevPage",
              defaultMessage: "Go Back",
            })}
          </Button>
        )}
      </div>
    </div>
  );
};

NotFound.displayName = "NotFound";

export default NotFound;
