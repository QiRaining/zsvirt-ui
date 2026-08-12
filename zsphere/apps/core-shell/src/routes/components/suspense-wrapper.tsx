import {
  SuspenseBoundary,
  type ErrorBoundaryDiagnosticsPayload,
} from "@zstack/error-boundary";
import * as React from "react";
import { useLocation } from "react-router";

import Loader from "../../loader";

type SuspenseWrapperErrorPayload = ErrorBoundaryDiagnosticsPayload & {
  source: "SuspenseWrapper";
};

/**
 * SuspenseWrapper 组件
 * 用于包裹懒加载组件，提供错误边界和加载状态
 *
 * 使用 resetKeys 来监听路由变化，当路由变化时自动重置错误状态
 * 这样可以避免在页面切换时错误状态被保留
 */
export const SuspenseWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const location = useLocation();

  return (
    <SuspenseBoundary
      loadingFallback={<Loader loading={true} />}
      suspenseFallback={null}
      // 当路由变化时，自动重置错误状态
      // 包含 search 参数，确保同一 pathname 下切换不同资源（如不同 uuid）时也能重置错误状态
      // 修复: 在资源树中切换端口组等同路径资源时，ErrorBoundary 不重置导致页面持续显示错误
      resetKeys={[location.pathname, location.search]}
      diagnosticsSource="SuspenseWrapper"
      diagnosticsGlobalKey="__ZSV_LAST_SUSPENSE_WRAPPER_ERROR__"
      onError={(error, info, diagnostics) => {
        (
          globalThis as {
            __ZSV_LAST_SUSPENSE_WRAPPER_ERROR__?: SuspenseWrapperErrorPayload;
          }
        ).__ZSV_LAST_SUSPENSE_WRAPPER_ERROR__ =
          diagnostics as SuspenseWrapperErrorPayload;

        // 打印详细错误信息
        console.error("SuspenseWrapper caught an error:", error);
        console.error("SuspenseWrapper diagnostics:", diagnostics);
        console.error("Component stack:", info.componentStack);
      }}
    >
      {children}
    </SuspenseBoundary>
  );
};
