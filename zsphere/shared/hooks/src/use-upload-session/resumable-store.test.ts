import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createResumableUploadSessionStore,
  type ResumableUploadSessionStore,
} from "./resumable-store";

const waitingSession = {
  uploadType: "image" as const,
  hash: "hash-1",
  longJobUuid: "job-1",
  offset: 0,
  status: "WAITING_FOR_FILE" as const,
  resumable: true,
};

describe("resumable upload session store", () => {
  let store: ResumableUploadSessionStore | undefined;

  afterEach(() => {
    store?.destroy();
    store = undefined;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("does not keep polling after an empty startup refresh", async () => {
    vi.useFakeTimers();
    const fetchSessions = vi.fn(async () => []);
    store = createResumableUploadSessionStore({
      fetchSessions,
      pollingInterval: 30_000,
    });

    await store.refresh();
    await vi.advanceTimersByTimeAsync(90_000);

    expect(fetchSessions).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot().sessions).toEqual([]);
  });

  it("polls while continuable sessions exist and stops after repeated empty results", async () => {
    vi.useFakeTimers();
    const fetchSessions = vi
      .fn()
      .mockResolvedValueOnce([waitingSession])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    store = createResumableUploadSessionStore({
      fetchSessions,
      pollingInterval: 30_000,
      emptyRefreshStopThreshold: 2,
    });

    await store.refresh();
    expect(store.getSnapshot().sessions).toEqual([waitingSession]);

    await vi.advanceTimersByTimeAsync(30_000);
    expect(store.getSnapshot().sessions).toEqual([]);

    await vi.advanceTimersByTimeAsync(30_000);
    await vi.advanceTimersByTimeAsync(30_000);

    expect(fetchSessions).toHaveBeenCalledTimes(3);
  });

  it("polls while automatic retry sessions are waiting for BFF work", async () => {
    vi.useFakeTimers();
    const retryWaitingSession = {
      ...waitingSession,
      status: "RETRY_WAITING" as const,
    };
    const fetchSessions = vi
      .fn()
      .mockResolvedValueOnce([retryWaitingSession])
      .mockResolvedValueOnce([retryWaitingSession]);
    store = createResumableUploadSessionStore({
      fetchSessions,
      pollingInterval: 30_000,
    });

    await store.refresh();
    await vi.advanceTimersByTimeAsync(30_000);

    expect(fetchSessions).toHaveBeenCalledTimes(2);
    expect(store.getSnapshot().sessions).toEqual([retryWaitingSession]);
  });

  it("deduplicates overlapping refresh requests", async () => {
    let resolveFetch: (sessions: (typeof waitingSession)[]) => void = () => {};
    const fetchSessions = vi.fn(
      () =>
        new Promise<(typeof waitingSession)[]>((resolve) => {
          resolveFetch = resolve;
        }),
    );
    store = createResumableUploadSessionStore({ fetchSessions });

    const firstRefresh = store.refresh();
    const secondRefresh = store.refresh();
    resolveFetch([waitingSession]);
    await Promise.all([firstRefresh, secondRefresh]);

    expect(fetchSessions).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot().sessions).toEqual([waitingSession]);
  });

  it("skips repeated empty refreshes within the empty refresh cooldown unless forced", async () => {
    vi.useFakeTimers();
    const fetchSessions = vi.fn(async () => []);
    store = createResumableUploadSessionStore({
      fetchSessions,
      emptyRefreshCooldown: 60_000,
    });

    await store.refresh();
    await store.refresh();

    expect(fetchSessions).toHaveBeenCalledTimes(1);

    await store.refresh({ force: true });

    expect(fetchSessions).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(60_000);
    await store.refresh();

    expect(fetchSessions).toHaveBeenCalledTimes(3);
  });
});
