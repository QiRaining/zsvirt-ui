import { useCallback } from "react";

import type { AuthKey } from "../types.ts";
import { useAuthContext } from "./use-auth-context.ts";

export const useAuth = () => {
  const { authMap } = useAuthContext();
  const hasAuth = useCallback(
    (_authKey?: AuthKey) => {
      if (!_authKey) {
        return false;
      }
      const { type, authKey, resource } = _authKey;
      return authMap.has(`${resource}||${type}||${authKey}`);
    },
    [authMap],
  );

  const hasLicenseExpired = useCallback(() => {
    return false;
  }, []);

  return {
    hasAuth,
    hasLicenseExpired,
  };
};
