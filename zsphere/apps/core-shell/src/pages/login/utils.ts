import type { ApolloError } from "@apollo/client";
import type { GetTwoFactorAuthenticationStateResp } from "@zstack/zsphere-types/graphql";
import { bus } from "@zstack/zsphere-utils";

export enum LoginAlertMessageId {
  LoginError = "login.loginError",
  AuthCodeError = "login.authCodeError",
  LockLogin = "login.lockLogin",
  AccountDisabledError = "login.accountDisabledError",
  CaptchaError = "login.captchaError",
  DenyAccessError = "login.denyAccessError",
  MaxSession = "login.maxSession",
  CannotConnectToServer = "login.cannotConnectToServer",
  CasCodeError = "login.casCodeError",
}

// 将静态数组提升到模块级别，避免在函数内重复创建 (js-hoist-regexp)
const CAS_ERROR_CODES = [
  "DONGHAI.1001",
  "DONGHAI.1002",
  "DONGHAI.1003",
  "DONGHAI.1004",
  "DONGHAI.1005",
  "DONGHAI.1006",
  "DONGHAI.1007",
  "DONGHAI.1008",
  "DONGHAI.1009",
] as const;

export interface AlertMessageDescriptor {
  id: LoginAlertMessageId;
  values?: Record<string, any>;
}

interface HandleErrorMessageParams {
  error: ApolloError;
  twoFactorState?: GetTwoFactorAuthenticationStateResp["state"];
  setAlertMessage: (
    descriptor: AlertMessageDescriptor | string | undefined,
  ) => void;
}

export const handleErrorMessage = ({
  error,
  twoFactorState,
  setAlertMessage,
}: HandleErrorMessageParams) => {
  const lang = window.navigator.language.substr(0, 2);
  try {
    const {
      messages: errorMessages,
      details = "",
      code,
    } = JSON.parse(error.message) || {};

    switch (code) {
      case "ID.1000":
      case "SYS.1006":
        setAlertMessage({
          id:
            twoFactorState === "Enable" && details === "附加认证失败"
              ? LoginAlertMessageId.AuthCodeError
              : LoginAlertMessageId.LoginError,
        });
        break;
      case "LOGIN_CONTROL.1002": {
        const [, timeStr] = details.split(":");
        const [timeValue] = timeStr.trim().split(" ");
        const minutes = Math.max(1, Math.ceil(Number(timeValue) / 60));
        setAlertMessage({
          id: LoginAlertMessageId.LockLogin,
          values: { time: minutes },
        });
        break;
      }
      case "ID.1007":
        setAlertMessage({ id: LoginAlertMessageId.AccountDisabledError });
        break;
      case "LOGIN_CONTROL.1003":
        setAlertMessage({ id: LoginAlertMessageId.CaptchaError });
        break;
      case "LOGIN_CONTROL.1004":
        setAlertMessage({ id: LoginAlertMessageId.DenyAccessError });
        break;
      case "ID.1005":
        bus.emit("PasswordExpired", "ID.1005");
        break;
      case "ID.1006":
        setAlertMessage({ id: LoginAlertMessageId.MaxSession });
        break;
      case "ID.2002":
        setAlertMessage({ id: LoginAlertMessageId.AuthCodeError });
        break;
      case "ID.2001":
        setAlertMessage({ id: LoginAlertMessageId.AuthCodeError });
        break;
      default:
        if (error.networkError) {
          setAlertMessage({ id: LoginAlertMessageId.CannotConnectToServer });
        } else if (
          CAS_ERROR_CODES.includes(code as (typeof CAS_ERROR_CODES)[number])
        ) {
          setAlertMessage({ id: LoginAlertMessageId.CasCodeError });
        } else {
          setAlertMessage(
            lang === "zh"
              ? errorMessages?.message_cn
              : errorMessages?.message_en || details,
          );
        }
    }
  } catch (err) {
    console.error("Error parsing error message:", err);
  }
};
