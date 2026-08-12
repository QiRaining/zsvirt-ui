import React from "react";

import { useAuth } from "../hooks/use-auth.ts";
import type { AuthKey } from "../types.ts";

interface AuthProps {
  authKey: AuthKey;
  children: React.ReactNode;
}

export const Auth = (props: AuthProps) => {
  const { authKey, children } = props;
  const { hasAuth } = useAuth();

  if (!hasAuth(authKey)) {
    return null;
  }

  if (authKey.type === "block" || authKey.type === "field") {
    return children;
  }

  if (authKey.type === "action") {
    return children;
  }

  // 如果 authKey.type 既不是 'block' 也不是 'action'
  return null;
};
