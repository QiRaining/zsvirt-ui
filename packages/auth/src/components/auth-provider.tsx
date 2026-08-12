import type { ReactNode } from "react";
import React, { useMemo } from "react";

import { AuthContext } from "../context/auth-context";

type AuthProviderProps = {
  children: ReactNode;
  map: Map<string, string>;
  license?: unknown;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  map,
}) => {
  const value = useMemo(
    () => ({
      licenseExpired: false,
      authMap: map,
    }),
    [map],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
