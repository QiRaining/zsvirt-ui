import { useAuth } from "@zstack/zsphere-components";
import React, { useEffect, useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useLocation } from "react-router";

import NoPermissionPage from "./index";

const fullSizeFlexContainerStyle: React.CSSProperties = {
  height: "100%",
  width: "100%",
  display: "flex",
};

interface AuthCheckProps {
  resourceTypes: string[];
  currentIdentity?: string;
  children: React.ReactNode;
}

export const AuthCheck: React.FC<AuthCheckProps> = ({
  resourceTypes,
  currentIdentity,
  children,
}) => {
  const { hasAuth } = useAuth();

  const hasAnyAuth = resourceTypes.some((resourceType) => {
    const authParams = {
      resource: resourceType,
      type: "view" as const,
      authKey: "list",
    };
    return hasAuth(authParams);
  });

  if (!hasAnyAuth && currentIdentity !== "Admin") {
    return (
      <div style={fullSizeFlexContainerStyle}>
        <NoPermissionPage />
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => {
        if (error?.name !== "UnauthorizedResourceError") {
          // 这里仅处理权限问题，不捕获其他未知的白屏错误
          throw error;
        }
        return <UnauthorizedFallback reset={resetErrorBoundary} />;
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

interface IUnauthorizedFallbackProps {
  reset: () => void;
}

function UnauthorizedFallback({ reset }: IUnauthorizedFallbackProps) {
  const location = useLocation();
  const errorLocation = useRef(location);
  useEffect(() => {
    if (
      location.pathname !== errorLocation.current.pathname ||
      location.search !== errorLocation.current.search
    ) {
      reset();
    }
  }, [location]);
  return <NoPermissionPage />;
}
