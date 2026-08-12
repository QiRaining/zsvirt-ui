import { PanicFallback } from "@zstack/error-boundary";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";

export const SubAppLayoutErrorBoundary: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    // @ts-ignore
    <ErrorBoundary
      fallbackRender={() => {
        return <PanicFallback />;
      }}
      onError={(error, errorInfo) => {
        // 错误日志记录
        console.error("Sub App Layout Error:", error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
