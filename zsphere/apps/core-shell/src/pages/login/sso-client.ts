export interface SsoClient {
  loginMNUrl?: string | null;
}

export const fetchSsoClients = async (): Promise<SsoClient[]> => {
  const response = await fetch("/api/plugin/sso/client", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    return [];
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.filter((item): item is SsoClient => {
    if (typeof item !== "object" || item === null || !("loginMNUrl" in item)) {
      return false;
    }

    const { loginMNUrl } = item as { loginMNUrl: unknown };
    return (
      typeof loginMNUrl === "string" ||
      loginMNUrl === null ||
      loginMNUrl === undefined
    );
  });
};

export const getPrimarySsoLoginUrl = (
  clients: SsoClient[] | undefined,
): string | undefined => {
  return clients
    ?.map((client) => client.loginMNUrl?.trim())
    .find((loginMNUrl): loginMNUrl is string => Boolean(loginMNUrl));
};
