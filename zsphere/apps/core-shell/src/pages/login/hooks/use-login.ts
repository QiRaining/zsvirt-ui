import type { GetLoginCaptchaResp } from "@zstack/zsphere-types/graphql";
import { Encrypt } from "@zstack/zsphere-utils";
import hash from "hash.js";

interface LoginParams {
  username: string;
  password: string;
  loginMethod: string;
  verifyCode?: string;
  captchaUuid?: string;
  authCode?: string;
  systemTags?: string[];
}

interface LoginHandlers {
  loginByAccount: (variables: any) => void;
  loginByLdap: (variables: any) => void;
}

export const handleLogin = (params: LoginParams, handlers: LoginHandlers) => {
  const {
    username,
    password,
    loginMethod,
    verifyCode,
    captchaUuid,
    systemTags,
  } = params;
  const hashPassword = hash.sha512().update(password).digest("hex");

  switch (loginMethod) {
    case "account":
      return handlers.loginByAccount({
        variables: {
          input: {
            accountName: username,
            password: hashPassword,
            verifyCode,
            captchaUuid,
            systemTags,
          },
        },
      });
    case "adldap":
      return handlers.loginByLdap({
        variables: {
          input: {
            username,
            password: Encrypt(password),
            loginType: "ldap",
            verifyCode,
            captchaUuid,
            systemTags,
          },
        },
      });
    default:
      return handlers.loginByAccount({
        variables: {
          input: {
            accountName: username,
            password: hashPassword,
            verifyCode,
            captchaUuid,
            systemTags,
          },
        },
      });
  }
};

interface ValidateParams {
  username: string;
  password: string;
  loginMethod: string;
  verifyCode?: string;
  captcha?: GetLoginCaptchaResp;
  twoFactorState?: string;
}

interface ValidateHandlers {
  validateCaptcha: (params: { username: string }) => Promise<void>;
  validateTwoFactor: (params: {
    username: string;
    hashPassword: string;
    password: string;
    loginMethod: string;
    verifyCode?: string;
    captchaUuid?: string;
    authCode?: string;
  }) => Promise<string[]>;
}

export const validateLoginParams = async (
  params: ValidateParams,
  handlers: ValidateHandlers,
): Promise<string[]> => {
  const { username, password, loginMethod, verifyCode, captcha } = params;
  const hashPassword = hash.sha512().update(password).digest("hex");

  // 校验验证码
  if (!captcha?.captchaUuid) {
    await handlers.validateCaptcha({ username });
  }

  // 校验双因子
  return handlers.validateTwoFactor({
    username,
    hashPassword,
    password,
    loginMethod,
    verifyCode,
    captchaUuid: captcha?.captchaUuid,
  });
};
