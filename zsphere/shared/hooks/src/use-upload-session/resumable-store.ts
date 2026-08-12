import { useEffect, useSyncExternalStore } from "react";

export type ResumableStoreUploadSessionStatus =
  | "UPLOADING"
  | "WAITING_FOR_FILE_CHECK"
  | "RETRY_WAITING"
  | "RETRYING"
  | "RETRY_READY"
  | "WAITING_FOR_FILE"
  | "PAUSED"
  | "COMPLETED"
  | "FAILED"
  | "CANCELED"
  | "RETRY_EXHAUSTED"
  | "EXPIRED";

export interface ResumableStoreUploadSession {
  longJobUuid?: string;
  resumable: boolean;
  status: ResumableStoreUploadSessionStatus;
}

export interface ResumableUploadSessionSnapshot<
  TSession extends ResumableStoreUploadSession,
> {
  sessions: TSession[];
  loading: boolean;
  lastRefreshAt: number;
}

export interface ResumableUploadSessionStoreOptions<
  TSession extends ResumableStoreUploadSession,
> {
  fetchSessions: () => Promise<TSession[]>;
  pollingInterval?: number;
  visibleRefreshCooldown?: number;
  emptyRefreshCooldown?: number;
  emptyRefreshStopThreshold?: number;
}

export interface ResumableUploadSessionRefreshOptions {
  force?: boolean;
}

export interface ResumableUploadSessionStore<
  TSession extends ResumableStoreUploadSession = ResumableStoreUploadSession,
> {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => ResumableUploadSessionSnapshot<TSession>;
  refresh: (options?: ResumableUploadSessionRefreshOptions) => Promise<void>;
  removeSession: (longJobUuid?: string) => void;
  mount: () => () => void;
  destroy: () => void;
}

const DEFAULT_POLLING_INTERVAL = 30 * 1000;
const DEFAULT_VISIBLE_REFRESH_COOLDOWN = 60 * 1000;
const DEFAULT_EMPTY_REFRESH_COOLDOWN = 60 * 1000;
const DEFAULT_EMPTY_REFRESH_STOP_THRESHOLD = 2;
const CONTINUABLE_UPLOAD_SESSION_STATUSES: ResumableStoreUploadSessionStatus[] =
  [
    "WAITING_FOR_FILE_CHECK",
    "RETRY_WAITING",
    "RETRYING",
    "RETRY_READY",
    "WAITING_FOR_FILE",
    "PAUSED",
  ];

const isDocumentVisible = () =>
  typeof document === "undefined" || document.visibilityState === "visible";

const hasContinuableSessions = <TSession extends ResumableStoreUploadSession>(
  sessions: TSession[],
) =>
  sessions.some(
    (session) =>
      session.resumable &&
      CONTINUABLE_UPLOAD_SESSION_STATUSES.includes(session.status),
  );

export function createResumableUploadSessionStore<
  TSession extends ResumableStoreUploadSession,
>({
  fetchSessions,
  pollingInterval = DEFAULT_POLLING_INTERVAL,
  visibleRefreshCooldown = DEFAULT_VISIBLE_REFRESH_COOLDOWN,
  emptyRefreshCooldown = DEFAULT_EMPTY_REFRESH_COOLDOWN,
  emptyRefreshStopThreshold = DEFAULT_EMPTY_REFRESH_STOP_THRESHOLD,
}: ResumableUploadSessionStoreOptions<TSession>): ResumableUploadSessionStore<TSession> {
  const listeners = new Set<() => void>();
  let snapshot: ResumableUploadSessionSnapshot<TSession> = {
    sessions: [],
    loading: false,
    lastRefreshAt: 0,
  };
  let inFlight: Promise<void> | undefined;
  let pollTimer: number | undefined;
  let pollingActive = false;
  let emptyRefreshCount = 0;
  let mountCount = 0;

  const emit = () => {
    listeners.forEach((listener) => listener());
  };

  const setSnapshot = (
    nextSnapshot: Partial<ResumableUploadSessionSnapshot<TSession>>,
  ) => {
    snapshot = { ...snapshot, ...nextSnapshot };
    emit();
  };

  const clearPollTimer = () => {
    if (pollTimer) {
      if (typeof window !== "undefined") {
        window.clearTimeout(pollTimer);
      }
      pollTimer = undefined;
    }
  };

  const schedulePoll = () => {
    clearPollTimer();
    if (
      typeof window === "undefined" ||
      !pollingActive ||
      !isDocumentVisible()
    ) {
      return;
    }
    pollTimer = window.setTimeout(() => {
      void refresh();
    }, pollingInterval);
  };

  const applySessions = (sessions: TSession[]) => {
    setSnapshot({
      sessions,
      loading: false,
      lastRefreshAt: Date.now(),
    });

    if (hasContinuableSessions(sessions)) {
      pollingActive = true;
      emptyRefreshCount = 0;
      schedulePoll();
      return;
    }

    if (pollingActive) {
      emptyRefreshCount += 1;
      pollingActive = emptyRefreshCount < emptyRefreshStopThreshold;
    }

    if (pollingActive) {
      schedulePoll();
    } else {
      clearPollTimer();
    }
  };

  const shouldSkipEmptyRefresh = (
    options?: ResumableUploadSessionRefreshOptions,
  ) => {
    if (
      options?.force ||
      pollingActive ||
      snapshot.sessions.length > 0 ||
      snapshot.lastRefreshAt === 0
    ) {
      return false;
    }

    return Date.now() - snapshot.lastRefreshAt < emptyRefreshCooldown;
  };

  const refresh = async (options?: ResumableUploadSessionRefreshOptions) => {
    if (inFlight) {
      return inFlight;
    }

    if (shouldSkipEmptyRefresh(options)) {
      return;
    }

    setSnapshot({ loading: true });
    inFlight = fetchSessions()
      .then((sessions) => {
        applySessions(Array.isArray(sessions) ? sessions : []);
      })
      .catch(() => {
        setSnapshot({
          sessions: [],
          loading: false,
          lastRefreshAt: Date.now(),
        });
        if (!pollingActive) {
          clearPollTimer();
        }
      })
      .finally(() => {
        inFlight = undefined;
      });
    return inFlight;
  };

  const refreshWhenVisible = () => {
    if (!isDocumentVisible()) {
      clearPollTimer();
      return;
    }
    const now = Date.now();
    if (now - snapshot.lastRefreshAt >= visibleRefreshCooldown) {
      void refresh();
      return;
    }
    schedulePoll();
  };

  const addBrowserListeners = () => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return () => {};
    }
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  };

  let removeBrowserListeners: (() => void) | undefined;

  const store: ResumableUploadSessionStore<TSession> = {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => snapshot,
    refresh,
    removeSession: (longJobUuid) => {
      if (!longJobUuid) {
        return;
      }
      applySessions(
        snapshot.sessions.filter(
          (session) => session.longJobUuid !== longJobUuid,
        ),
      );
    },
    mount: () => {
      mountCount += 1;
      if (mountCount === 1) {
        removeBrowserListeners = addBrowserListeners();
        void refresh();
      }
      return () => {
        mountCount = Math.max(0, mountCount - 1);
        if (mountCount === 0) {
          removeBrowserListeners?.();
          removeBrowserListeners = undefined;
          clearPollTimer();
        }
      };
    },
    destroy: () => {
      mountCount = 0;
      removeBrowserListeners?.();
      removeBrowserListeners = undefined;
      clearPollTimer();
      listeners.clear();
      inFlight = undefined;
      pollingActive = false;
      emptyRefreshCount = 0;
      snapshot = { sessions: [], loading: false, lastRefreshAt: 0 };
    },
  };

  return store;
}

export function useResumableUploadSessionStore<
  TSession extends ResumableStoreUploadSession,
>(store: ResumableUploadSessionStore<TSession>) {
  useEffect(() => store.mount(), [store]);

  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );

  return {
    ...snapshot,
    refreshUploadSessions: store.refresh,
    removeUploadSession: store.removeSession,
  };
}
