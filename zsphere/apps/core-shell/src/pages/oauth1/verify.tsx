import { gql } from "@apollo/client";
import { toast } from "@zstack/design";
import { Identity, Op } from "@zstack/zsphere-types";
import type { AccountVO } from "@zstack/zsphere-types/graphql";
import { useCallback, useEffect } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";
import { useShallow } from "zustand/react/shallow";

import Loader from "@/loader";

import { loginOAuth } from "../../gql/user.gql";
import { usePlatformStore } from "../../store";
import { useUserStore } from "../../store/use-user-store";
import apolloClient from "../../utils/apollo";
import { LOCAL_FP_KEY } from "../../utils/fingerprint-check";
import { useGetRole } from "../../utils/use-get-zsv-role";
import {
  getSafeOAuthRedirect,
  parseOAuth1VerifyParams,
  type OAuth1VerifyParseResult,
} from "./oauth1-utils";

type OAuth1VerifyParseFailureReason = Extract<
  OAuth1VerifyParseResult,
  { ok: false }
>["reason"];

const ACCOUNT_LIST = gql`
  fragment accountFields on AccountVO {
    uuid
    name
    type
  }

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
        ...accountFields
      }
      total
    }
  }
`;

const OAuth1Verify = () => {
  const navigate = useNavigate();
  const intl = useIntl();

  const { setLoginType, setSystemView, setUserType, setCurrentUser } =
    usePlatformStore(
      useShallow((state) => ({
        setLoginType: state.setLoginType,
        setSystemView: state.setSystemView,
        setUserType: state.setUserType,
        setCurrentUser: state.setCurrentUser,
      })),
    );

  const [setSessionId] = useUserStore(
    useShallow((state) => [state.setSessionId]),
  );

  const { getRole: getZsvRole } = useGetRole();

  const redirectPath = useCallback(
    (path?: string) => {
      const targetPath = path || "/dashboard";
      navigate(targetPath, { replace: true });
    },
    [navigate],
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
      zoneUuid?: string;
      projectUuid?: string;
    }) => {
      localStorage.sessionId = sessionId;
      localStorage.setItem("sessionId", sessionId);
      setSessionId(sessionId);
      localStorage.removeItem(LOCAL_FP_KEY);

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

      if (currentIdentity === Identity.Admin) {
        setSystemView("Admin");
      } else {
        setSystemView("Normal");
      }
      getZsvRole().then(() => {
        redirectPath(redirect);
      });
    },
    [
      getZsvRole,
      redirectPath,
      setCurrentUser,
      setLoginType,
      setSessionId,
      setSystemView,
      setUserType,
    ],
  );

  // OAuth1 验证逻辑
  const handleOAuth1 = useCallback(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const parsedParams = parseOAuth1VerifyParams(urlParams);

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
    const safeRedirect = getSafeOAuthRedirect(redirect, window.location.origin);

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
  }, [getVerifyErrorMessage, intl, loginSuccess, redirectPath, showErrorToast]);

  useEffect(() => {
    handleOAuth1();
  }, [handleOAuth1]);

  return <Loader loading />;
};

export default OAuth1Verify;
