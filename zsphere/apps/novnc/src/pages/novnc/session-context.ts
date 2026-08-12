export type AuthList = Array<[string, unknown]>;

interface SessionContextEvent {
  origin: string;
  data?: unknown;
}

interface SessionContext {
  sessionId?: string;
  authList: AuthList;
}

export const getSessionContext = (
  event: SessionContextEvent,
  referer: string,
): SessionContext | undefined => {
  if (event.origin !== referer || typeof event.data !== "object") {
    return undefined;
  }

  const data = event.data as Record<string, unknown>;
  const { authList, sessionId, type } = data;

  if (
    type !== "novnc-set-session-context" ||
    !Array.isArray(authList) ||
    !authList.every(
      (item): item is [string, unknown] =>
        Array.isArray(item) && typeof item[0] === "string",
    ) ||
    (sessionId !== undefined && typeof sessionId !== "string")
  ) {
    return undefined;
  }

  return { sessionId, authList };
};
