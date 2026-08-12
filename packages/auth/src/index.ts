// import "./styles/tailwind.css";
export { useAuth } from "./hooks/use-auth";
export { Auth } from "./components/auth";
export { AuthProvider } from "./components/auth-provider";
export { useAuthContext } from "./hooks/use-auth-context";
export type { AuthKey } from "./types";
export { AuthDropdownAction } from "./components/auth-dropdown-action";
export type {
  AuthAction,
  CustomActionConfig,
  AuthDropdownActionProps,
  ActionDialogProps,
} from "./components/auth-dropdown-action";

// License 相关导出
export {
  useLicense,
  useLicenseAction,
  LicenseTooltipWrapper,
  LICENSE_EXPIRED_I18N_KEY,
  LICENSE_EXPIRED_DEFAULT_MESSAGE,
} from "./hooks/use-license";
export type { LicenseTooltipWrapperProps } from "./hooks/use-license";
