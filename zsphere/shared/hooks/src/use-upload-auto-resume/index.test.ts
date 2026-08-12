import { act, renderHook } from "@testing-library/react";
import { bus } from "@zstack/zsphere-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

const hookMocks = vi.hoisted(() => ({
  getUploadTargetTime: vi.fn(async () => 60),
}));

vi.mock("../use-upload-target-time", () => ({
  default: () => hookMocks.getUploadTargetTime,
}));

import {
  assertUploadLongJobMatches,
  cancelUploadAutoResume,
  getUploadAutoResumeDelay,
  isUploadAutoResumeError,
  resolveUploadAutoResumeCheck,
  resolveUploadHashCheckOffset,
  UPLOAD_OPERATION_LOG_REFETCH_EVENT,
  default as useUploadAutoResume,
} from ".";

afterEach(() => {
  cancelUploadAutoResume("image:job-1:hash-1");
  cancelUploadAutoResume("image:old-job:hash-1");
  cancelUploadAutoResume("image:new-job:hash-1");
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("useUploadAutoResume helpers", () => {
  it("uses progressive retry delays and caps at thirty minutes", () => {
    expect(getUploadAutoResumeDelay(0)).toBe(30 * 1000);
    expect(getUploadAutoResumeDelay(1)).toBe(2 * 60 * 1000);
    expect(getUploadAutoResumeDelay(2)).toBe(5 * 60 * 1000);
    expect(getUploadAutoResumeDelay(3)).toBe(15 * 60 * 1000);
    expect(getUploadAutoResumeDelay(4)).toBe(30 * 60 * 1000);
    expect(getUploadAutoResumeDelay(99)).toBe(30 * 60 * 1000);
  });

  it("only auto resumes retryable upload failures", () => {
    expect(isUploadAutoResumeError({ retryable: true, status: 0 })).toBe(true);
    expect(isUploadAutoResumeError({ retryable: true, status: 502 })).toBe(
      true,
    );
    expect(isUploadAutoResumeError({ retryable: false, status: 400 })).toBe(
      false,
    );
  });

  it("normalizes hashcheck offset values", () => {
    expect(resolveUploadHashCheckOffset({ offset: 24 })).toBe(24);
    expect(resolveUploadHashCheckOffset({ offset: "48" })).toBe(48);
    expect(resolveUploadHashCheckOffset({ offset: null })).toBe(0);
    expect(resolveUploadHashCheckOffset({ offset: "invalid" })).toBe(0);
  });

  it("prefers the upload-session offset facade when a long job id exists", async () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "session-1"),
    });
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ longJobUuid: "job-1", offset: 2048 }),
    }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await resolveUploadAutoResumeCheck({
      hash: "hash-1",
      hashCheckPath: "/api/uploadhashcheck/hash-1",
      jobId: "job-1",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/upload-sessions/job-1/offset",
      expect.any(Object),
    );
    expect(fetchMock).not.toHaveBeenCalledWith(
      "/api/upload-sessions/job-1",
      expect.objectContaining({
        method: "PATCH",
        body: expect.stringContaining("UPLOADING"),
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        longJobUuid: "job-1",
        offset: 2048,
      }),
    );
  });

  it("falls back to hashcheck when the upload-session offset facade fails", async () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "session-1"),
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ longJobUuid: "job-1", offset: 4096 }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const result = await resolveUploadAutoResumeCheck({
      hash: "hash-1",
      hashCheckPath: "/api/uploadhashcheck/hash-1",
      jobId: "job-1",
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/upload-sessions/job-1/offset",
      expect.any(Object),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/upload-sessions/resumable",
      expect.any(Object),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/uploadhashcheck/hash-1",
      expect.any(Object),
    );
    expect(result).toEqual(
      expect.objectContaining({
        longJobUuid: "job-1",
        offset: 4096,
      }),
    );
  });

  it("aborts hashcheck fetches when the request times out", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "session-1"),
    });
    let signal: AbortSignal | undefined;
    const fetchMock = vi.fn((_url: string, init?: RequestInit) => {
      signal = init?.signal as AbortSignal | undefined;
      return new Promise((_resolve, reject) => {
        signal?.addEventListener("abort", () => {
          reject(new Error("aborted"));
        });
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const request = resolveUploadAutoResumeCheck({
      hash: "hash-1",
      hashCheckPath: "/api/uploadhashcheck/hash-1",
    });
    await Promise.resolve();

    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal?.aborted).toBe(false);

    const rejection = expect(request).rejects.toThrow("aborted");
    await vi.advanceTimersByTimeAsync(15 * 1000);

    await rejection;
    expect(signal?.aborted).toBe(true);
  });

  it("rejects auto resume when the resolved long job belongs to another upload", () => {
    expect(() =>
      assertUploadLongJobMatches({ longJobUuid: "another-job" }, "job-1"),
    ).toThrow("Upload hash belongs to another long job");
  });

  it("does not resume or mark uploading when auto resume resolves another long job", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "session-1"),
    });
    vi.stubGlobal("navigator", { onLine: true });
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ longJobUuid: "another-job", offset: 4096 }),
    }));
    vi.stubGlobal("fetch", fetchMock);
    const upload = {
      resume: vi.fn(),
      setTargetUploadTime: vi.fn(),
    };
    const { result } = renderHook(() => useUploadAutoResume());
    const config = result.current({
      uploadType: "image",
      hash: "hash-1",
      hashCheckPath: "/api/uploadhashcheck/hash-1",
      jobId: "job-1",
    });

    act(() => {
      config.onRecoverableUploadError?.({
        upload: upload as never,
        error: { retryable: true, status: 502 } as never,
      });
    });
    await vi.advanceTimersByTimeAsync(getUploadAutoResumeDelay(0));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/upload-sessions/job-1/offset",
      expect.any(Object),
    );
    expect(fetchMock).not.toHaveBeenCalledWith(
      "/api/upload-sessions/job-1",
      expect.objectContaining({
        method: "PATCH",
        body: expect.stringContaining("UPLOADING"),
      }),
    );
    expect(hookMocks.getUploadTargetTime).not.toHaveBeenCalled();
    expect(upload.setTargetUploadTime).not.toHaveBeenCalled();
    expect(upload.resume).not.toHaveBeenCalled();
  });

  it("waits for BFF retry orchestration instead of resuming the failed long job", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "session-1"),
    });
    vi.stubGlobal("navigator", { onLine: true });
    const nextRetryAt = new Date(Date.now() + 45 * 1000).toISOString();
    const fetchMock = vi.fn(async (url: string) => ({
      ok: true,
      json: async () =>
        url.includes("/offset")
          ? {
              longJobUuid: "job-1",
              nextRetryAt,
              offset: 0,
              status: "RETRY_WAITING",
            }
          : { status: "RETRY_WAITING" },
    }));
    vi.stubGlobal("fetch", fetchMock);
    const upload = {
      resume: vi.fn(),
      setTargetUploadTime: vi.fn(),
    };
    const { result } = renderHook(() => useUploadAutoResume());
    const config = result.current({
      uploadType: "image",
      hash: "hash-1",
      hashCheckPath: "/api/uploadhashcheck/hash-1",
      jobId: "job-1",
    });

    act(() => {
      config.onRecoverableUploadError?.({
        upload: upload as never,
        error: { retryable: true, status: 502 } as never,
      });
    });
    await vi.advanceTimersByTimeAsync(getUploadAutoResumeDelay(0));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/upload-sessions/job-1/offset",
      expect.any(Object),
    );
    expect(fetchMock).not.toHaveBeenCalledWith(
      "/api/resumelongjob/job-1",
      expect.any(Object),
    );
    expect(fetchMock).not.toHaveBeenCalledWith(
      "/api/upload-sessions/job-1",
      expect.objectContaining({
        method: "PATCH",
        body: expect.stringContaining("UPLOADING"),
      }),
    );
    expect(hookMocks.getUploadTargetTime).not.toHaveBeenCalled();
    expect(upload.setTargetUploadTime).not.toHaveBeenCalled();
    expect(upload.resume).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(20 * 1000);

    const offsetChecks = fetchMock.mock.calls.filter(([url]) =>
      String(url).includes("/offset"),
    );
    expect(offsetChecks.length).toBeGreaterThan(1);
  });

  it("resumes immediately when the browser comes back online", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "session-1"),
    });
    vi.stubGlobal("navigator", { onLine: true });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "RETRY_WAITING" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ longJobUuid: "job-1", offset: 6144 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ longJobUuid: "job-1", offset: 6144 }),
      });
    vi.stubGlobal("fetch", fetchMock);
    const upload = {
      resume: vi.fn(),
      setTargetUploadTime: vi.fn(),
    };
    const { result } = renderHook(() => useUploadAutoResume());
    const config = result.current({
      uploadType: "image",
      hash: "hash-1",
      hashCheckPath: "/api/uploadhashcheck/hash-1",
      jobId: "job-1",
    });

    act(() => {
      config.onRecoverableUploadError?.({
        upload: upload as never,
        error: { retryable: true, status: 502 } as never,
      });
    });
    await Promise.resolve();

    window.dispatchEvent(new Event("online"));
    await vi.advanceTimersByTimeAsync(0);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/upload-sessions/job-1/offset",
      expect.any(Object),
    );
    expect(upload.setTargetUploadTime).toHaveBeenCalledWith(60);
    expect(upload.resume).toHaveBeenCalledWith(6144);
  });

  it("reports file availability while a retryable upload is waiting for auto resume", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "session-1"),
    });
    vi.stubGlobal("navigator", { onLine: false });
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ status: "RETRY_WAITING" }),
    }));
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useUploadAutoResume());
    const config = result.current({
      uploadType: "image",
      hash: "hash-1",
      hashCheckPath: "/api/uploadhashcheck/hash-1",
      jobId: "job-1",
    });

    act(() => {
      config.onRecoverableUploadError?.({
        upload: { resume: vi.fn(), setTargetUploadTime: vi.fn() } as never,
        error: { retryable: true, status: 502 } as never,
      });
    });
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/upload-sessions/job-1/file-availability",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ fileAvailable: true }),
      }),
    );

    await vi.advanceTimersByTimeAsync(60 * 1000);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/upload-sessions/job-1/file-availability",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ fileAvailable: true }),
      }),
    );
  });

  it("reports file availability while the upload is active", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "session-1"),
    });
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ status: "RETRY_WAITING" }),
    }));
    vi.stubGlobal("fetch", fetchMock);
    const upload = {
      getRealUuid: vi.fn(() => "job-1"),
    };
    const { result } = renderHook(() => useUploadAutoResume());
    const config = result.current({
      uploadType: "image",
      hash: "hash-1",
      hashCheckPath: "/api/uploadhashcheck/hash-1",
      jobId: "job-1",
    });

    act(() => {
      config.onLaunch?.({ upload: upload as never });
    });
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/upload-sessions/job-1/file-availability",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ fileAvailable: true }),
      }),
    );

    await vi.advanceTimersByTimeAsync(60 * 1000);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/upload-sessions/job-1/file-availability",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ fileAvailable: true }),
      }),
    );
  });

  it("marks active uploads as waiting for file when the page is leaving", async () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "session-1"),
    });
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ status: "WAITING_FOR_FILE" }),
    }));
    vi.stubGlobal("fetch", fetchMock);
    const upload = {
      getRealUuid: vi.fn(() => "job-1"),
    };
    const { result } = renderHook(() => useUploadAutoResume());
    const config = result.current({
      uploadType: "image",
      hash: "hash-1",
      hashCheckPath: "/api/uploadhashcheck/hash-1",
      jobId: "job-1",
    });

    act(() => {
      config.onLaunch?.({ upload: upload as never });
    });
    await Promise.resolve();
    fetchMock.mockClear();

    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/upload-sessions/job-1",
      expect.objectContaining({
        keepalive: true,
        method: "PATCH",
        body: JSON.stringify({
          status: "WAITING_FOR_FILE",
          fileAvailable: false,
          fileAvailableUntil: null,
        }),
      }),
    );
  });

  it("clears file availability when the upload is destroyed", async () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "session-1"),
    });
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ status: "WAITING_FOR_FILE" }),
    }));
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useUploadAutoResume());
    const config = result.current({
      uploadType: "image",
      hash: "hash-1",
      hashCheckPath: "/api/uploadhashcheck/hash-1",
      jobId: "job-1",
    });

    act(() => {
      config.onDestroy?.({ upload: {} as never });
    });
    await Promise.resolve();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/upload-sessions/job-1/file-availability",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ fileAvailable: false }),
      }),
    );
  });

  it("rebinds an in-memory upload to the BFF recreated running long job without calling resumeLongJob", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "session-1"),
    });
    vi.stubGlobal("navigator", { onLine: true });
    const emitSpy = vi.spyOn(bus, "emit");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "RETRY_WAITING" }),
      })
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            artifactUuid: null,
            hash: "hash-1",
            longJobUuid: "new-job",
            offset: 0,
            previousLongJobUuid: "old-job",
            status: "RETRY_READY",
            uploadType: "image",
            uploadUrl: null,
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          artifactUuid: "new-image",
          hash: "hash-1",
          longJobUuid: "new-job",
          offset: 0,
          status: "RETRY_READY",
          uploadUrl: "upload://new-backup-storage",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ longJobUuid: "new-job", offset: 0 }),
      });
    vi.stubGlobal("fetch", fetchMock);
    const upload = {
      getRealUuid: vi.fn(() => "old-job"),
      rebindUploadTarget: vi.fn(),
      resume: vi.fn(),
      setTargetUploadTime: vi.fn(),
    };
    const { result } = renderHook(() => useUploadAutoResume());
    const config = result.current({
      uploadType: "image",
      hash: "hash-1",
      hashCheckPath: "/api/uploadhashcheck/hash-1",
      jobId: "old-job",
    });

    act(() => {
      config.onRecoverableUploadError?.({
        upload: upload as never,
        error: { retryable: true, status: 502 } as never,
      });
    });
    await vi.advanceTimersByTimeAsync(getUploadAutoResumeDelay(0));

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/upload-sessions/old-job/offset",
      expect.any(Object),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/upload-sessions/resumable",
      expect.any(Object),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      "/api/upload-sessions/new-job/offset",
      expect.any(Object),
    );
    expect(upload.rebindUploadTarget).toHaveBeenCalledWith({
      artifactUuid: "new-image",
      offset: 0,
      realUuid: "new-job",
      uploadType: "image",
      uploadUrl: "upload://new-backup-storage",
    });
    expect(fetchMock).not.toHaveBeenCalledWith(
      "/api/resumelongjob/new-job",
      expect.anything(),
    );
    expect(emitSpy).toHaveBeenCalledWith("action:refetch:running");
    expect(emitSpy).toHaveBeenCalledWith(UPLOAD_OPERATION_LOG_REFETCH_EVENT);
    expect(upload.resume).toHaveBeenCalledWith(0);
  });
});
