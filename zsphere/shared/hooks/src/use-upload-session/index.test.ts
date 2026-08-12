import { afterEach, describe, expect, it, vi } from "vitest";

const busMock = vi.hoisted(() => ({
  emit: vi.fn(),
}));
const UPLOAD_OPERATION_LOG_REFETCH_EVENT = "upload:operation-log:refetch";

vi.mock("@zstack/zsphere-utils", () => ({
  bus: busMock,
}));

import {
  getUploadSessionOffset,
  getResumableUploadSessions,
  registerUploadSession,
  updateUploadFileAvailability,
  updateUploadSession,
} from ".";

describe("upload session client", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("registers upload sessions with the current session id", async () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "session-1"),
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ longJobUuid: "job-1", resumable: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ longJobUuid: "job-1", resumable: true }],
      });
    vi.stubGlobal("fetch", fetchMock);

    const session = await registerUploadSession({
      uploadType: "image",
      hash: "hash-1",
      longJobUuid: "job-1",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/upload-sessions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "x-session-id": "session-1" }),
      }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/upload-sessions/resumable",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ "x-session-id": "session-1" }),
      }),
    );
    expect(busMock.emit).toHaveBeenCalledWith("action:refetch:running");
    expect(busMock.emit).toHaveBeenCalledWith(
      UPLOAD_OPERATION_LOG_REFETCH_EVENT,
    );
    expect(session.resumable).toBe(true);
  });

  it("does not fail registration when refresh notifications fail", async () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "session-1"),
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ longJobUuid: "job-1", resumable: true }),
      })),
    );
    busMock.emit.mockImplementationOnce(() => {
      throw new Error("notification failed");
    });

    await expect(
      registerUploadSession({
        uploadType: "image",
        hash: "hash-1",
        longJobUuid: "job-1",
      }),
    ).resolves.toEqual(
      expect.objectContaining({ longJobUuid: "job-1", resumable: true }),
    );
  });

  it("updates and lists resumable upload sessions", async () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "session-1"),
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "PAUSED" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ longJobUuid: "job-1" }],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ longJobUuid: "job-1" }],
      });
    vi.stubGlobal("fetch", fetchMock);

    await updateUploadSession("job-1", { status: "PAUSED" });
    const sessions = await getResumableUploadSessions();

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/upload-sessions/job-1",
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/upload-sessions/resumable",
      expect.objectContaining({ method: "GET" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/upload-sessions/resumable",
      expect.objectContaining({ method: "GET" }),
    );
    expect(busMock.emit).toHaveBeenCalledWith("action:refetch:running");
    expect(busMock.emit).toHaveBeenCalledWith(
      UPLOAD_OPERATION_LOG_REFETCH_EVENT,
    );
    expect(sessions).toEqual([
      expect.objectContaining({ longJobUuid: "job-1" }),
    ]);
  });

  it("queries the server-side offset facade for an upload session", async () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "session-1"),
    });
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        longJobUuid: "job-1",
        offset: 2048,
        uploadUrl: "http://example.com/upload",
        artifactUuid: "image-1",
      }),
    }));
    vi.stubGlobal("fetch", fetchMock);

    const session = await getUploadSessionOffset("job-1");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/upload-sessions/job-1/offset",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ "x-session-id": "session-1" }),
      }),
    );
    expect(session).toEqual(
      expect.objectContaining({
        longJobUuid: "job-1",
        offset: 2048,
      }),
    );
  });

  it("updates upload file availability heartbeat", async () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "session-1"),
    });
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ status: "RETRY_WAITING", fileAvailable: true }),
    }));
    vi.stubGlobal("fetch", fetchMock);

    const session = await updateUploadFileAvailability("job-1", true);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/upload-sessions/job-1/file-availability",
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({
          "content-type": "application/json",
          "x-session-id": "session-1",
        }),
        body: JSON.stringify({ fileAvailable: true }),
      }),
    );
    expect(session).toEqual(
      expect.objectContaining({
        status: "RETRY_WAITING",
        fileAvailable: true,
      }),
    );
  });
});
