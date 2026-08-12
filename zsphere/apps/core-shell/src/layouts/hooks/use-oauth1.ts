import { gql } from "@apollo/client";
import { toast } from "@zstack/design";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { Identity, Op } from "@zstack/zsphere-types";
import type { AccountVO } from "@zstack/zsphere-types/graphql";
import React, { useCallback, useEffect } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";

import { loginOAuth } from "../../gql/user.gql";
import {
  getSafeOAuthRedirect,
  parseOAuth1VerifyParams,
  type OAuth1VerifyParseResult,
} from "../../pages/oauth1/oauth1-utils";
import apolloClient from "../../utils/apollo";
import { useGetRole } from "../../utils/use-get-zsv-role";

type OAuth1VerifyParseFailureReason = Extract<
  OAuth1VerifyParseResult,
  { ok: false }
>["reason"];

const ACCOUNT_LIST = gql`
  query accountList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $start: Int
    $limit: Int
    $type: AccountQueryType
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    accountList(
      conditions: $conditions
      extraConditions: $extraConditions
      start: $start
      limit: $limit
      type: $type
      sortBy: $sortBy
      sortDirection: $sortDirection
      replyWithCount: true
    ) {
      list {
        uuid
        name
        description
        type
        state
        accountQuotaInfo {
          volumeNum
          usages {
            name
            total
            used
          }
        }
        vmNum
        volumeNum

        role {
          uuid
          name
          type
        }
        roleFromAccountGroup {
          uuid
          name
          type
        }
        createDate
        lastOpDate
      }
      total
    }
  }
`;

// TODO: 这里需要吧iam2 去掉
export function useOAuth1() {
  const navigate = useNavigate();
  const intl = useIntl();
  // 分开订阅每个方法，避免订阅整个 store 导致不必要的重渲染
  const setLoginType = usePlatformStore((state) => state.setLoginType);
  const setSystemView = usePlatformStore((state) => state.setSystemView);
  const setUserType = usePlatformStore((state) => state.setUserType);
  const setCurrentUser = usePlatformStore((state) => state.setCurrentUser);

  const { getRole } = useGetRole();

  // 使用 ref 来追踪是否已经处理过 OAuth1 验证，避免重复处理
  const hasProcessedRef = React.useRef(false);

  const redirectPath = useCallback(
    (path?: string) => {
      getRole().then(() => {
        navigate(path || "/virtualization-dashboard");
      });
    },
    [getRole, navigate],
  );

  const getVerifyErrorMessage = useCallback(
    (reason: OAuth1VerifyParseFailureReason) => {
      switch (reason) {
        case "unsupported_login_type":
          return intl.formatMessage({
            id: "oauth1.verify.unsupportedLoginType",
            defaultMessage: "Unsupported login type.",
          });
        case "missing_required_params":
        default:
          return intl.formatMessage({
            id: "oauth1.verify.missingRequiredParams",
            defaultMessage: "Required login parameters are missing.",
          });
      }
    },
    [intl],
  );

  const showErrorToast = useCallback((title: string) => {
    toast({
      title,
      indicator: "error",
    });
  }, []);

  const loginSuccess = useCallback(
    ({
      username,
      accountUuid,
      userUuid,
      sessionId,
      currentIdentity,
      userType = "local",
      redirect,
    }: {
      username: string;
      accountUuid: string;
      userUuid: string;
      sessionId: string;
      currentIdentity?: Identity;
      userType?: "local" | "adldap" | "cas" | "external";
      redirect?: string;
    }) => {
      localStorage.sessionId = sessionId;

      setCurrentUser((v) => {
        return {
          ...v,
          username,
          sessionId,
          userUuid,
          accountUuid,
          currentIdentity,
        };
      });

      if (userType === "external") {
        apolloClient
          .query({
            query: ACCOUNT_LIST,
            variables: {
              conditions: [
                {
                  key: "uuid",
                  value: accountUuid,
                  op: Op.eq,
                },
              ],
            },
          })
          .then((res) => {
            const account: AccountVO = res?.data?.accountList?.list?.[0];
            if (account?.type === "ThirdParty") {
              setUserType("external");
            } else {
              setUserType("local");
            }
          });
      }

      // iam1 登录后直接跳转到 dashboard
      setLoginType("IAM1");
      // 账户登录默认为platform

      if (currentIdentity === Identity.Admin) {
        setSystemView("Admin");
      } else {
        setSystemView("Normal");
      }
      redirectPath(redirect);
    },
    [redirectPath, setCurrentUser, setLoginType, setSystemView, setUserType],
  );

  // 使用 useEffect 只在组件挂载时检查一次 OAuth1 验证
  // 不再依赖 location，避免每次路由变化都触发重渲染
  useEffect(() => {
    // 如果已经处理过，直接返回
    if (hasProcessedRef.current) {
      return;
    }

    const pathname = window.location.pathname;
    const search = window.location.search;

    if (pathname.startsWith("/oauth1/verify")) {
      hasProcessedRef.current = true;
      const parsedParams = parseOAuth1VerifyParams(
        search ? new URLSearchParams(search) : new URLSearchParams(),
      );

      if (!parsedParams.ok) {
        redirectPath("/login");
        showErrorToast(getVerifyErrorMessage(parsedParams.reason));
        return;
      }

      const {
        username,
        sessionId,
        userUuid,
        accountUuid,
        loginType,
        userType,
        redirect,
      } = parsedParams.value;
      const safeRedirect = getSafeOAuthRedirect(
        redirect,
        window.location.origin,
      );

      apolloClient
        .mutate({
          mutation: loginOAuth,
          variables: {
            input: {
              sessionId,
              userUuid,
              accountUuid,
              loginType,
            },
          },
        })
        .then(({ data }) => {
          const { loginOAuth: loginOAuthResp } = data;
          if (loginOAuthResp.isLogined) {
            loginSuccess({
              username,
              accountUuid: loginOAuthResp.accountUuid,
              userUuid,
              sessionId: loginOAuthResp.sessionId,
              currentIdentity: loginOAuthResp.currentIdentity,
              userType,
              redirect: safeRedirect,
            });
          } else {
            redirectPath("/login");
            showErrorToast(
              intl.formatMessage({
                id: "oauth1.verify.invalidSession",
                defaultMessage: "The login session is invalid. Log in again.",
              }),
            );
          }
        })
        .catch(() => {
          redirectPath("/login");
          showErrorToast(
            intl.formatMessage({
              id: "oauth1.verify.loginFailed",
              defaultMessage: "SSO login verification failed. Log in again.",
            }),
          );
        });
    }
  }, [getVerifyErrorMessage, intl, loginSuccess, redirectPath, showErrorToast]);
}
