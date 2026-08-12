import type { ApolloError } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { Identity } from "@zstack/zsphere-types";
import type {
  GetLoginCaptchaPayload,
  GetLoginCaptchaResp,
  GetTwoFactorAuthenticationSecretPayload,
  GetTwoFactorAuthenticationStateResp,
} from "@zstack/zsphere-types/graphql";
import { Encrypt } from "@zstack/zsphere-utils";
import { usePersistFn } from "ahooks";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { useNavigate, useSearchParams } from "react-router";
import { z } from "zod";

import {
  getLoginCaptcha,
  getTwoFactorAuthenticationState,
  loginByAccount,
  logIn,
  refreshLoginCaptcha,
} from "../../gql/user.gql";
import { useGetRole } from "../../utils/use-get-zsv-role";
import {
  LoginContent,
  LoginFooter,
  LoginHeader,
  LoginRightDecoration,
  TwoFactorAuthenticationModal,
} from "./components";
import { handleLogin, validateLoginParams } from "./hooks/use-login";
import { useResponsiveDecoration } from "./hooks/use-responsive-decoration";
import type { AlertMessageDescriptor } from "./utils";
import { handleErrorMessage, LoginAlertMessageId } from "./utils";

import style from "./style.module.less";

type ILoginAPIType = "loginByAccount" | "logIn";

type IRes = {
  [key in ILoginAPIType]: {
    sessionId: string;
    accountUuid: string;
    userUuid: string;
    currentIdentity?: Identity;
  };
};

interface ICheckForCaptcha {
  resourceName: string;
}

export interface LoginFormValues {
  loginMethod: string;
  username: string;
  password: string;
  verifyCode?: string;
}

const Login: React.FC = () => {
  const intl = useIntl();
  // 分开订阅每个状态字段，避免订阅整个 store
  const themeConfig = usePlatformStore((state) => state.themeConfig);
  const setCurrentUser = usePlatformStore((state) => state.setCurrentUser);
  const setLoginType = usePlatformStore((state) => state.setLoginType);
  const setSystemView = usePlatformStore((state) => state.setSystemView);
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");
  const navigate = useNavigate();
  const { getRole } = useGetRole();

  const isDecorationVisible = useResponsiveDecoration();

  const canLoginWithLdap = true;

  const [captcha, setCaptcha] = useState<GetLoginCaptchaResp>({});

  // 创建 zod schema，依赖 intl 以支持 i18n
  const formSchema = useMemo(
    () =>
      z
        .object({
          loginMethod: z.string(),
          username: z.string().min(
            1,
            intl.formatMessage({
              id: "login.field.usename.required",
              defaultMessage: "Enter the username.",
            }),
          ),
          password: z.string().min(
            1,
            intl.formatMessage({
              id: "login.field.password.required",
              defaultMessage: "Enter the password.",
            }),
          ),
          verifyCode: z.string().optional(),
        })
        .refine(
          (data) => {
            return !(captcha?.captcha && !data.verifyCode?.trim());
          },
          {
            message: intl.formatMessage({
              id: "login.field.verifycode.required",
              defaultMessage: "Enter the authentication code.",
            }),
            path: ["verifyCode"],
          },
        ),
    [intl, captcha],
  );

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loginMethod: "account",
      username: "",
      password: "",
      verifyCode: "",
    },
  });

  const { data: twoFactorData } = useQuery<{
    getTwoFactorAuthenticationState: GetTwoFactorAuthenticationStateResp;
  }>(getTwoFactorAuthenticationState);

  const twoFactorState = useMemo(() => {
    return twoFactorData?.getTwoFactorAuthenticationState.state;
  }, [twoFactorData]);

  const handleLoginError = usePersistFn((e: ApolloError) => {
    handleErrorMessage({
      error: e,
      twoFactorState,
      setAlertMessage,
    });
  });

  const [getCaptcha] = useMutation<
    { getLoginCaptcha: GetLoginCaptchaResp },
    { input: GetLoginCaptchaPayload }
  >(getLoginCaptcha, {
    onError: handleLoginError,
  });

  const [_refreshCaptcha] = useMutation<
    { refreshCaptcha: GetLoginCaptchaResp },
    { captchaUuid: string }
  >(refreshLoginCaptcha);
  const refreshCaptcha = async (captchaUuid?: string) => {
    if (!captchaUuid) {
      return;
    }
    const { data } = await _refreshCaptcha({
      variables: {
        captchaUuid,
      },
    });
    if (data?.refreshCaptcha) {
      setCaptcha(data?.refreshCaptcha);
    }
  };

  const checkForCaptcha: (
    param: ICheckForCaptcha,
  ) => Promise<GetLoginCaptchaResp | null | undefined> = async ({
    resourceName,
  }) => {
    const loginMethod = form.getValues("loginMethod");
    const isLdap = loginMethod === "adldap";
    const typeName = isLdap
      ? "ldap"
      : twoFactorState === "Enable"
        ? "twoFactorAccount"
        : "account";
    const { data } = await getCaptcha({
      variables: {
        input: {
          resourceName,
          loginType: typeName,
          captchaUuid: captcha?.captchaUuid || undefined,
        },
      },
    });
    if (data?.getLoginCaptcha) {
      setCaptcha(data.getLoginCaptcha);
    }
    return data?.getLoginCaptcha;
  };

  const updateIdentity = (currentIdentity?: Identity) => {
    const loginMethod = form.getValues("loginMethod");
    // 根据登录时的用户名和返回的身份判断
    if (loginMethod === "account") {
      setLoginType("IAM1");
      if (currentIdentity === Identity.Admin) {
        setSystemView("Admin");
      } else {
        setSystemView("Normal");
      }
    }
  };

  const [loginLoading, setLoginLoading] = useState(false);

  const loginSuccess = (res: IRes) => {
    sessionStorage.clear();
    setLoginLoading(false);
    const [loginInfo] = Object.values(res);

    localStorage.setItem("sessionId", loginInfo.sessionId);
    // 添加标志位，第一次登录
    localStorage.setItem("first-login", "true");
    // VIP 提示标志
    localStorage.setItem("first-login-vip", "true");
    setCurrentUser((v) => {
      return {
        ...v,
        sessionId: loginInfo.sessionId,
        accountUuid: loginInfo.accountUuid,
        userUuid: loginInfo.userUuid,
        currentIdentity: loginInfo?.currentIdentity,
      };
    });
    // 更新身份信息
    updateIdentity(loginInfo?.currentIdentity);

    switch (form.getValues("loginMethod")) {
      case "account":
        getRole().then(() => {
          navigate(redirect || "/virtualization-dashboard");
        });
        localStorage.setItem("firstLogin", "1");
        break;
      case "adldap":
        getRole().then(() => {
          navigate(redirect || "/virtualization-dashboard");
        });
        localStorage.setItem("firstLogin", "1");
        break;
    }
  };

  const [alertMessage, setAlertMessage] = useState<
    AlertMessageDescriptor | string | undefined
  >();
  const [activeTab, setActiveTab] = useState("account");

  const displayAlertMessage = useMemo(() => {
    if (!alertMessage) {
      return;
    }
    if (typeof alertMessage === "string") {
      return alertMessage;
    }

    const formatMessageById = (
      id: LoginAlertMessageId,
      values?: Record<string, any>,
    ) => {
      switch (id) {
        case LoginAlertMessageId.LoginError:
          return intl.formatMessage(
            {
              id: "login.loginError",
              defaultMessage: "Wrong username or password. Try again.",
            },
            values,
          );
        case LoginAlertMessageId.AuthCodeError:
          return intl.formatMessage(
            {
              id: "login.authCodeError",
              defaultMessage: "Wrong authentication code. Try again.",
            },
            values,
          );
        case LoginAlertMessageId.LockLogin:
          return intl.formatMessage(
            {
              id: "login.lockLogin",
              defaultMessage: "Too many wrong attempts. Try again {time} minutes later.",
            },
            values,
          );
        case LoginAlertMessageId.AccountDisabledError:
          return intl.formatMessage(
            {
              id: "login.accountDisabledError",
              defaultMessage: "This user has been banned from login. Contact the administrator.",
            },
            values,
          );
        case LoginAlertMessageId.CaptchaError:
          return intl.formatMessage(
            { id: "login.captchaError", defaultMessage: "Wrong authentication code." },
            values,
          );
        case LoginAlertMessageId.DenyAccessError:
          return intl.formatMessage(
            {
              id: "login.denyAccessError",
              defaultMessage: "This IP address cannot be used for login.",
            },
            values,
          );
        case LoginAlertMessageId.MaxSession:
          return intl.formatMessage(
            { id: "login.maxSession", defaultMessage: "Maximum login sessions exceeded." },
            values,
          );
        case LoginAlertMessageId.CannotConnectToServer:
          return intl.formatMessage(
            {
              id: "login.cannotConnectToServer",
              defaultMessage: "Could not connect the server. Contact the administrator.",
            },
            values,
          );
        case LoginAlertMessageId.CasCodeError:
          return intl.formatMessage(
            {
              id: "login.casCodeError",
              defaultMessage: "Wrong username or password. Try again.",
            },
            values,
          );
        default:
          return id;
      }
    };

    return formatMessageById(alertMessage.id, alertMessage.values);
  }, [alertMessage, intl]);

  const loginFailed = (e: ApolloError) => {
    setLoginLoading(false);
    const { username } = form.getValues();
    checkForCaptcha({ resourceName: username });
    handleLoginError(e);
  };

  const [_loginByAccount] = useMutation(loginByAccount, {
    onCompleted: loginSuccess,
    onError: loginFailed,
  });

  const [_logIn] = useMutation(logIn, {
    onCompleted: loginSuccess,
    onError: loginFailed,
  });

  const validateCaptcha = async ({ username }: { username: string }) => {
    const resp = await checkForCaptcha({ resourceName: username });
    if (resp?.captchaUuid) {
      throw undefined;
    }
  };

  const validateTwoFactor = async ({
    authCode,
    username,
    hashPassword,
    password,
    loginMethod,
    verifyCode,
    captchaUuid,
  }: {
    authCode?: string;
    username: string;
    hashPassword: string;
    password: string;
    loginMethod: string;
    verifyCode?: string;
    captchaUuid?: string;
  }) => {
    const isLdap = loginMethod === "adldap";
    if (twoFactorState === "Enable" && !authCode) {
      setPayload({
        name: username,
        password: isLdap ? Encrypt(password) : hashPassword,
        type: isLdap ? "ldap" : "account",
        verifyCode,
        captchaUuid,
      });
      setVisible(true);
      throw undefined;
    }
    const systemTags = [];
    if (authCode) {
      systemTags.push(`twofatoken::${authCode}`);
    }
    return systemTags;
  };

  const submit = async (authCode?: string) => {
    setLoginLoading(true);
    try {
      const isValid = await form.trigger();
      if (!isValid) {
        setLoginLoading(false);
        return;
      }
      const { username, password, loginMethod, verifyCode } = form.getValues();

      setCurrentUser({ username });

      // 验证参数
      const systemTags = await validateLoginParams(
        {
          username,
          password,
          loginMethod,
          verifyCode,
          captcha,
          twoFactorState,
        },
        {
          validateCaptcha,
          validateTwoFactor: (params) =>
            validateTwoFactor({ ...params, authCode }),
        },
      );

      // 处理登录
      handleLogin(
        {
          username,
          password,
          loginMethod,
          verifyCode,
          captchaUuid: captcha?.captchaUuid,
          systemTags,
        },
        {
          loginByAccount: _loginByAccount,
          loginByLdap: _logIn,
        },
      );
    } catch {
      setLoginLoading(false);
    }
  };

  const [visible, setVisible] = useState<boolean>(false);
  const [payload, setPayload] =
    useState<GetTwoFactorAuthenticationSecretPayload>();

  const tabs: Array<{ key: string; label: string }> = [
    {
      key: "account",
      label: intl.formatMessage({
        id: "local.login.user",
        defaultMessage: "Local User",
      }),
    },
  ];

  if (canLoginWithLdap) {
    tabs.push({
      key: "adldap",
      label: intl.formatMessage({
        id: "ldap.server.login",
        defaultMessage: "AD/LDAP User",
      }),
    });
  }

  return (
    <div className={style.outContainer}>
      <div className={style.container}>
        <LoginHeader loginLogo={themeConfig?.loginLogo} />
        <LoginContent
          form={form}
          loginLoading={loginLoading}
          captcha={captcha}
          alertMessage={displayAlertMessage as string | undefined}
          tabs={tabs}
          activeTab={activeTab}
          themeConfig={themeConfig}
          onSubmit={form.handleSubmit(() => submit())}
          onTabChange={(activeKey) => {
            setActiveTab(activeKey);
            form.setValue("loginMethod", activeKey);
            form.setValue("username", "");
            form.setValue("password", "");
            form.setValue("verifyCode", "");
            form.clearErrors();
            setCaptcha({});
            setAlertMessage(undefined);
          }}
          onRefreshCaptcha={refreshCaptcha}
        />
        <LoginFooter />
      </div>

      {isDecorationVisible && <LoginRightDecoration />}

      {visible && (
        <TwoFactorAuthenticationModal
          visible={visible}
          setVisible={setVisible}
          onError={(e) => {
            setVisible(false);
            loginFailed(e);
          }}
          payload={payload!}
          onOk={submit}
        />
      )}
    </div>
  );
};

export default Login;
