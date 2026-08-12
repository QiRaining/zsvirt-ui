export type OAuthLoginType = "iam1";

export type OAuthUserType = "local" | "adldap" | "cas" | "external";

export interface OAuth1VerifyParams {
  username: string;
  sessionId: string;
  userUuid: string;
  accountUuid: string;
  loginType: OAuthLoginType;
  userType?: OAuthUserType;
  redirect?: string;
}

export type OAuth1VerifyParseResult =
  | { ok: true; value: OAuth1VerifyParams }
  | { ok: false; reason: "missing_required_params" | "unsupported_login_type" };

const SUPPORTED_LOGIN_TYPES = new Set<string>(["iam1"]);
const SUPPORTED_USER_TYPES = new Set<string>([
  "local",
  "adldap",
  "cas",
  "external",
]);

const requiredParamKeys = [
  "username",
  "sessionId",
  "userUuid",
  "accountUuid",
  "loginType",
] as const;

const normalizeOptionalValue = (value: string | null) => {
  if (!value || value === "undefined") {
    return undefined;
  }
  return value;
};

const normalizeUserType = (value: string | null): OAuthUserType | undefined => {
  const normalized = normalizeOptionalValue(value);
  if (!normalized) {
    return undefined;
  }
  if (normalized === "null") {
    return "external";
  }
  if (SUPPORTED_USER_TYPES.has(normalized)) {
    return normalized as OAuthUserType;
  }
  return undefined;
};

export const parseOAuth1VerifyParams = (
  params: URLSearchParams,
): OAuth1VerifyParseResult => {
  const values = Object.fromEntries(params);
  const hasMissingRequiredParam = requiredParamKeys.some((key) => {
    return !values[key]?.trim();
  });

  if (hasMissingRequiredParam) {
    return { ok: false, reason: "missing_required_params" };
  }

  if (!SUPPORTED_LOGIN_TYPES.has(values.loginType)) {
    return { ok: false, reason: "unsupported_login_type" };
  }

  return {
    ok: true,
    value: {
      username: values.username,
      sessionId: values.sessionId,
      userUuid: values.userUuid,
      accountUuid: values.accountUuid,
      loginType: values.loginType as OAuthLoginType,
      userType: normalizeUserType(params.get("userType")),
      redirect: normalizeOptionalValue(params.get("redirect")),
    },
  };
};

export const getSafeOAuthRedirect = (
  redirect: string | null | undefined,
  origin: string,
  defaultPath = "/virtualization-dashboard",
) => {
  if (!redirect) {
    return defaultPath;
  }

  if (redirect.startsWith("/") && !redirect.startsWith("//")) {
    return redirect;
  }

  try {
    const url = new URL(redirect);
    if (url.origin === origin) {
      return `${url.pathname}${url.search}${url.hash}` || defaultPath;
    }
  } catch {
    return defaultPath;
  }

  return defaultPath;
};
