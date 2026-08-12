import { createContext } from "react";

type AuthContextType = {
  licenseExpired: boolean;
  authMap: Map<string, any>;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
