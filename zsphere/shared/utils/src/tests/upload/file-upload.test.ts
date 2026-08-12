import { afterEach, describe, expect, it, vi } from "vitest";

import { FileUpload } from "../../upload";

const MB = 1024 * 1024;

class MockFormData {
  append = vi.fn();
}

class MockWorker {
  private listeners: Record<string, (event?: Event) => void> = {};

  constructor() {
    workers.push(this);
  }

  addEventListener = vi.fn(
    (eventName: string, listener: (event?: Event) => void) => {
      this.listeners[eventName] = listener;
    },
  );
  postMessage = vi.fn();
  terminate = vi.fn();

  emitError() {
    this.listeners.error?.(new Event("error"));
  }
}

let lastXhr: MockXMLHttpRequest | undefined;
let xhrs: MockXMLHttpRequest[] = [];
let workers: MockWorker[] = [];

class MockXMLHttpRequest {
  static DONE = 4;

  headers: Record<string, string> = {};
  private uploadProgressListener?: (event: ProgressEvent) => void;
  upload = {
    addEventListener: vi.fn(
      (eventName: string, listener: (event: ProgressEvent) => void) => {
        if (eventName === "progress") {
          this.uploadProgressListener = listener;
        }
      },
    ),
  };
  open = vi.fn();
  send = vi.fn();
  abort = vi.fn(() => {
    this.onabort?.({ type: "abort" } as ProgressEvent);
  });
  onreadystatechange: (() => void) | null = null;
  ontimeout: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: ((event: ProgressEvent) => void) | null = null;
  readyState = 0;
  status = 0;
  responseText = "";
  timeout = 0;

  constructor() {
    lastXhr = this;
    xhrs.push(this);
  }

  setRequestHeader(name: string, value: string) {
    this.headers[name] = String(value);
  }

  emitUploadProgress(loaded: number) {
    this.uploadProgressListener?.({ loaded } as ProgressEvent);
  }
}

const createFile = (size: number): File =>
  ({
    name: "test-image.qcow2",
    size,
    slice: (start?: number, end?: number) => {
      const sliceSize = Math.max((end ?? size) - (start ?? 0), 0);
      return new Blob([new Uint8Array(sliceSize)]);
    },
  }) as File;

describe("FileUpload", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    lastXhr = undefined;
    xhrs = [];
    workers = [];
  });

  it("resumes from the server offset and exposes upload size", () => {
    vi.stubGlobal("Worker", MockWorker);

    const file = createFile(128 * MB);
    const upload = new FileUpload(
      file,
      "upload://backup-storage",
      "long-job-uuid",
      "image-uuid",
      0,
    );

    upload.resume(24 * MB);

    expect(upload.getFileSize()).toBe(file.size);
    expect(upload.getSentSize()).toBe(24 * MB);
    expect((upload as unknown as { next: number }).next).toBe(24 * MB);
  });

  it("continues slice indexes from restored upload offsets", () => {
    vi.stubGlobal("Worker", MockWorker);
    vi.stubGlobal("XMLHttpRequest", MockXMLHttpRequest);
    vi.stubGlobal("FormData", MockFormData);
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => ""),
    });

    const file = createFile(128 * MB);
    const upload = new FileUpload(
      file,
      "upload://backup-storage",
      "long-job-uuid",
      "image-uuid",
      0,
    );

    upload.resume(24 * MB);
    upload
      .request("chunk-md5", 8 * MB, new Blob([new Uint8Array(1)]), 24 * MB)
      .catch(() => undefined);
    expect(lastXhr?.headers["X-SLICE-INDEX"]).toBe("3");

    upload.rebindUploadTarget({
      artifactUuid: "new-image",
      offset: 32 * MB,
      realUuid: "new-long-job",
      uploadUrl: "upload://new-backup-storage",
      uploadType: "image",
    });
    upload
      .request("chunk-md5", 8 * MB, new Blob([new Uint8Array(1)]), 32 * MB)
      .catch(() => undefined);

    expect(lastXhr?.headers["X-SLICE-INDEX"]).toBe("4");
  });

  it("uses chunk offset for Content-Range and aborts in-flight requests on pause", () => {
    vi.stubGlobal("Worker", MockWorker);
    vi.stubGlobal("XMLHttpRequest", MockXMLHttpRequest);
    vi.stubGlobal("FormData", MockFormData);

    const file = createFile(128 * MB);
    const upload = new FileUpload(
      file,
      "upload://backup-storage",
      "long-job-uuid",
      "image-uuid",
      0,
    );

    const offset = 32 * MB;
    const request = upload.request(
      "chunk-md5",
      8 * MB,
      new Blob([new Uint8Array(1)]),
      offset,
    );
    request.catch(() => undefined);

    expect(lastXhr?.headers["Content-Range"]).toBe(
      `bytes ${offset}-${offset + 8 * MB - 1}/${file.size}`,
    );

    upload.pause();

    expect(lastXhr?.abort).toHaveBeenCalledTimes(1);
  });

  it("uses the chunk-bound slice index instead of the mutable global index", () => {
    vi.stubGlobal("Worker", MockWorker);
    vi.stubGlobal("XMLHttpRequest", MockXMLHttpRequest);
    vi.stubGlobal("FormData", MockFormData);

    const upload = new FileUpload(
      createFile(128 * MB),
      "upload://backup-storage",
      "long-job-uuid",
      "image-uuid",
      0,
    );
    const uploadAccess = upload as unknown as {
      currentChunkIndex: number;
      pool: Map<number, unknown>;
    };
    const uploadChunk = {
      hash: "chunk-md5",
      sliceIndex: 4,
      sliceSize: 8 * MB,
      blob: new Blob([new Uint8Array(1)]),
      offset: 32 * MB,
    };

    uploadAccess.currentChunkIndex = 9;
    uploadAccess.pool.set(uploadChunk.offset, uploadChunk);
    upload.send(uploadChunk);

    expect(lastXhr?.headers["X-SLICE-INDEX"]).toBe("4");
  });

  it("starts with a 4MiB probe chunk before dynamic sizing ramps up", () => {
    vi.stubGlobal("Worker", MockWorker);

    const upload = new FileUpload(
      createFile(256 * MB),
      "upload://backup-storage",
      "long-job-uuid",
      "image-uuid",
      0,
    );
    const uploadAccess = upload as unknown as {
      calculateChunkSize: () => number;
      speed: number;
    };

    expect(uploadAccess.calculateChunkSize()).toBe(4 * MB);
    uploadAccess.speed = 1024 * MB;
    expect(uploadAccess.calculateChunkSize()).toBeGreaterThan(32 * MB);
  });

  it("uses dynamic chunks for package uploads too", () => {
    vi.stubGlobal("Worker", MockWorker);
    vi.stubGlobal("XMLHttpRequest", MockXMLHttpRequest);
    vi.stubGlobal("FormData", MockFormData);
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "session-1"),
    });

    const file = createFile(256 * MB);
    const upload = new FileUpload(
      file,
      "upload://package",
      "long-job-uuid",
      "file-uuid",
      0,
      "storagePackage",
    );

    const uploadAccess = upload as unknown as {
      calculateChunkSize: () => number;
      currentChunkIndex: number;
    };
    expect(uploadAccess.calculateChunkSize()).toBe(4 * MB);
    uploadAccess.currentChunkIndex = 3;

    upload.request("chunk-md5", 8 * MB, new Blob([new Uint8Array(1)]), 24 * MB);

    expect(lastXhr?.open).toHaveBeenCalledWith(
      "POST",
      "/api/uploadStoragePackage",
    );
    expect(lastXhr?.headers["X-FILE-UUID"]).toBe("file-uuid");
    expect(lastXhr?.headers["X-SLICE-SIZE"]).toBe(String(8 * MB));
    expect(lastXhr?.headers["X-SLICE-INDEX"]).toBe("3");
    expect(lastXhr?.headers["X-SESSION-ID"]).toBe("session-1");
  });

  it("uses injected target upload time and falls back to the default safety window", () => {
    vi.stubGlobal("Worker", MockWorker);

    const upload = new FileUpload(
      createFile(128 * MB),
      "upload://backup-storage",
      "long-job-uuid",
      "image-uuid",
      0,
      "image",
      undefined,
      { targetUploadTime: 35 },
    );

    expect(
      (upload as unknown as { targetUploadTime: number }).targetUploadTime,
    ).toBe(35);

    upload.setTargetUploadTime(Number.NaN);

    expect(
      (upload as unknown as { targetUploadTime: number }).targetUploadTime,
    ).toBe(20);
  });

  it("notifies upper layers when a retryable upload error exhausts short retries", async () => {
    vi.stubGlobal("Worker", MockWorker);
    vi.stubGlobal("XMLHttpRequest", MockXMLHttpRequest);
    vi.stubGlobal("FormData", MockFormData);

    const onRecoverableUploadError = vi.fn();
    const upload = new FileUpload(
      createFile(128 * MB),
      "upload://backup-storage",
      "long-job-uuid",
      "image-uuid",
      0,
      "image",
      undefined,
      { onRecoverableUploadError },
    );
    const uploadAccess = upload as unknown as {
      abort: boolean;
      maxRetry: number;
      pool: Map<number, unknown>;
    };
    const uploadChunk = {
      hash: "chunk-md5",
      sliceSize: 8 * MB,
      blob: new Blob([new Uint8Array(1)]),
      offset: 0,
    };

    uploadAccess.maxRetry = 0;
    uploadAccess.pool.set(uploadChunk.offset, uploadChunk);
    upload.send(uploadChunk);

    if (!lastXhr) {
      throw new Error("Expected upload XHR to be created");
    }
    lastXhr.readyState = MockXMLHttpRequest.DONE;
    lastXhr.status = 0;
    lastXhr.onreadystatechange?.();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(uploadAccess.abort).toBe(true);
    expect(onRecoverableUploadError).toHaveBeenCalledWith({
      upload,
      error: expect.objectContaining({
        offset: 0,
        retryable: true,
        status: 0,
      }),
    });
  });

  it("treats an already-existing 406 chunk as uploaded without retrying", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("Worker", MockWorker);
    vi.stubGlobal("XMLHttpRequest", MockXMLHttpRequest);
    vi.stubGlobal("FormData", MockFormData);

    const onRecoverableUploadError = vi.fn();
    const upload = new FileUpload(
      createFile(128 * MB),
      "upload://backup-storage",
      "long-job-uuid",
      "image-uuid",
      0,
      "image",
      undefined,
      { onRecoverableUploadError },
    );
    const uploadAccess = upload as unknown as {
      maxRetry: number;
      pool: Map<number, unknown>;
      retryTimers?: Map<number, ReturnType<typeof setTimeout>>;
    };
    const uploadChunk = {
      hash: "chunk-md5",
      sliceSize: 8 * MB,
      blob: new Blob([new Uint8Array(1)]),
      offset: 0,
    };

    uploadAccess.maxRetry = 1;
    uploadAccess.pool.set(uploadChunk.offset, uploadChunk);
    upload.send(uploadChunk);

    if (!lastXhr) {
      throw new Error("Expected upload XHR to be created");
    }
    lastXhr.readyState = MockXMLHttpRequest.DONE;
    lastXhr.status = 406;
    lastXhr.onreadystatechange?.();
    await Promise.resolve();

    expect(upload.getSentSize()).toBe(8 * MB);
    expect(uploadAccess.pool.size).toBe(0);
    expect(uploadAccess.retryTimers?.size).toBe(0);
    expect(onRecoverableUploadError).not.toHaveBeenCalled();
    await vi.runOnlyPendingTimersAsync();
    expect(xhrs).toHaveLength(1);
  });

  it("aborts all in-flight XHRs when retries are exhausted", async () => {
    vi.stubGlobal("Worker", MockWorker);
    vi.stubGlobal("XMLHttpRequest", MockXMLHttpRequest);
    vi.stubGlobal("FormData", MockFormData);

    const onRecoverableUploadError = vi.fn();
    const upload = new FileUpload(
      createFile(128 * MB),
      "upload://backup-storage",
      "long-job-uuid",
      "image-uuid",
      0,
      "image",
      undefined,
      { onRecoverableUploadError },
    );
    const uploadAccess = upload as unknown as {
      maxRetry: number;
      pool: Map<number, unknown>;
    };
    const firstChunk = {
      hash: "chunk-md5-1",
      sliceSize: 8 * MB,
      blob: new Blob([new Uint8Array(1)]),
      offset: 0,
    };
    const secondChunk = {
      hash: "chunk-md5-2",
      sliceSize: 8 * MB,
      blob: new Blob([new Uint8Array(1)]),
      offset: 8 * MB,
    };

    uploadAccess.maxRetry = 0;
    uploadAccess.pool.set(firstChunk.offset, firstChunk);
    uploadAccess.pool.set(secondChunk.offset, secondChunk);
    upload.send(firstChunk);
    upload.send(secondChunk);

    const firstXhr = xhrs[0];
    const secondXhr = xhrs[1];
    firstXhr.readyState = MockXMLHttpRequest.DONE;
    firstXhr.status = 502;
    firstXhr.onreadystatechange?.();
    await Promise.resolve();

    expect(secondXhr.abort).toHaveBeenCalledTimes(1);
    expect(onRecoverableUploadError).toHaveBeenCalledWith({
      upload,
      error: expect.objectContaining({
        offset: 0,
        retryable: true,
        status: 502,
      }),
    });
  });

  it("backs off with jitter and lowers the chunk cap after retryable upload failures", async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    vi.stubGlobal("Worker", MockWorker);
    vi.stubGlobal("XMLHttpRequest", MockXMLHttpRequest);
    vi.stubGlobal("FormData", MockFormData);

    const upload = new FileUpload(
      createFile(512 * MB),
      "upload://backup-storage",
      "long-job-uuid",
      "image-uuid",
      0,
    );
    const uploadAccess = upload as unknown as {
      calculateChunkSize: () => number;
      isFirstChunk: boolean;
      maxRetry: number;
      pool: Map<number, unknown>;
      speed: number;
    };
    const uploadChunk = {
      hash: "chunk-md5",
      sliceSize: 64 * MB,
      blob: new Blob([new Uint8Array(1)]),
      offset: 0,
    };

    uploadAccess.isFirstChunk = false;
    uploadAccess.speed = 1024 * MB;
    expect(uploadAccess.calculateChunkSize()).toBeGreaterThan(128 * MB);

    uploadAccess.maxRetry = 1;
    uploadAccess.pool.set(uploadChunk.offset, uploadChunk);
    upload.send(uploadChunk);

    if (!lastXhr) {
      throw new Error("Expected upload XHR to be created");
    }
    lastXhr.readyState = MockXMLHttpRequest.DONE;
    lastXhr.status = 413;
    lastXhr.onreadystatechange?.();
    await Promise.resolve();

    expect(uploadAccess.calculateChunkSize()).toBeLessThanOrEqual(128 * MB);

    await vi.advanceTimersByTimeAsync(600);
    expect(xhrs).toHaveLength(1);
    expect(Math.random).toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(400);
    expect(xhrs).toHaveLength(2);
  });

  it("reslices a failed oversized chunk before the short retry", async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    vi.stubGlobal("XMLHttpRequest", MockXMLHttpRequest);
    vi.stubGlobal("FormData", MockFormData);

    const file = createFile(1024 * MB);
    const offset = 64 * MB;
    const upload = new FileUpload(
      file,
      "upload://backup-storage",
      "long-job-uuid",
      "image-uuid",
      0,
    );
    const uploadAccess = upload as unknown as {
      isFirstChunk: boolean;
      maxRetry: number;
      pool: Map<number, unknown>;
      speed: number;
    };
    const uploadChunk = {
      hash: "large-chunk-md5",
      sliceSize: 256 * MB,
      blob: file.slice(offset, offset + 256 * MB),
      offset,
    };

    uploadAccess.isFirstChunk = false;
    uploadAccess.speed = 1024 * MB;
    uploadAccess.maxRetry = 1;
    uploadAccess.pool.set(uploadChunk.offset, uploadChunk);
    upload.send(uploadChunk);

    const firstXhr = lastXhr;
    if (!firstXhr) {
      throw new Error("Expected first upload XHR to be created");
    }

    firstXhr.readyState = MockXMLHttpRequest.DONE;
    firstXhr.status = 502;
    firstXhr.onreadystatechange?.();
    await Promise.resolve();

    await vi.advanceTimersByTimeAsync(1000);
    await Promise.resolve();

    const retryXhr = lastXhr;
    if (!retryXhr || retryXhr === firstXhr) {
      throw new Error("Expected retry upload XHR to be created");
    }

    expect(Number(retryXhr.headers["X-SLICE-SIZE"])).toBeLessThanOrEqual(
      32 * MB,
    );
    expect(retryXhr.headers["Content-Range"]).not.toBe(
      `bytes ${offset}-${offset + 256 * MB - 1}/${file.size}`,
    );
    expect(retryXhr.headers["Content-Range"]).toBe(
      `bytes ${offset}-${offset + 32 * MB - 1}/${file.size}`,
    );
  });

  it("reports offset conflicts as recoverable errors with the server offset", async () => {
    vi.stubGlobal("Worker", MockWorker);
    vi.stubGlobal("XMLHttpRequest", MockXMLHttpRequest);
    vi.stubGlobal("FormData", MockFormData);

    const onRecoverableUploadError = vi.fn();
    const upload = new FileUpload(
      createFile(128 * MB),
      "upload://backup-storage",
      "long-job-uuid",
      "image-uuid",
      0,
      "image",
      undefined,
      { onRecoverableUploadError },
    );
    const uploadAccess = upload as unknown as {
      maxRetry: number;
      pool: Map<number, unknown>;
    };
    const uploadChunk = {
      hash: "chunk-md5",
      sliceSize: 8 * MB,
      blob: new Blob([new Uint8Array(1)]),
      offset: 16 * MB,
    };

    uploadAccess.maxRetry = 2;
    uploadAccess.pool.set(uploadChunk.offset, uploadChunk);
    upload.send(uploadChunk);

    if (!lastXhr) {
      throw new Error("Expected upload XHR to be created");
    }
    lastXhr.readyState = MockXMLHttpRequest.DONE;
    lastXhr.status = 409;
    lastXhr.responseText = JSON.stringify({ serverOffset: 24 * MB });
    lastXhr.onreadystatechange?.();
    await Promise.resolve();

    expect(onRecoverableUploadError).toHaveBeenCalledWith({
      upload,
      error: expect.objectContaining({
        offset: 16 * MB,
        retryable: true,
        serverOffset: 24 * MB,
        status: 409,
      }),
    });
  });

  it("uses a background upload profile while the page is hidden and restores it when visible", () => {
    vi.stubGlobal("Worker", MockWorker);
    const listeners: Record<string, () => void> = {};
    let hidden = false;
    const documentMock = {
      addEventListener: vi.fn((eventName: string, listener: () => void) => {
        if (eventName === "visibilitychange") {
          listeners.visibilitychange = listener;
        }
      }),
      removeEventListener: vi.fn(),
    };
    Object.defineProperty(documentMock, "hidden", {
      configurable: true,
      get: () => hidden,
    });
    vi.stubGlobal("document", documentMock);

    const upload = new FileUpload(
      createFile(512 * MB),
      "upload://backup-storage",
      "long-job-uuid",
      "image-uuid",
      0,
    );
    const uploadAccess = upload as unknown as {
      calculateChunkSize: () => number;
      isFirstChunk: boolean;
      size: number;
      speed: number;
    };
    uploadAccess.isFirstChunk = false;
    uploadAccess.speed = 1024 * MB;

    upload.launch();
    expect(documentMock.addEventListener).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );

    hidden = true;
    listeners.visibilitychange?.();
    expect(uploadAccess.size).toBeLessThanOrEqual(2);
    expect(uploadAccess.calculateChunkSize()).toBeLessThanOrEqual(32 * MB);

    hidden = false;
    listeners.visibilitychange?.();
    expect(uploadAccess.size).toBe(4);
    expect(uploadAccess.calculateChunkSize()).toBeGreaterThan(32 * MB);

    upload.destroy();
    expect(documentMock.removeEventListener).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );
  });

  it("starts the fallback scheduler if the scheduler worker fails after launch", () => {
    vi.useFakeTimers();
    vi.stubGlobal("Worker", MockWorker);
    vi.stubGlobal("XMLHttpRequest", MockXMLHttpRequest);
    vi.stubGlobal("FormData", MockFormData);

    const upload = new FileUpload(
      createFile(128 * MB),
      "upload://backup-storage",
      "long-job-uuid",
      "image-uuid",
      0,
    );
    const uploadAccess = upload as unknown as {
      fallbackSchedulerTimer: ReturnType<typeof setTimeout> | null;
      useSchedulerWorker: boolean;
    };

    upload.launch();
    expect(workers[0].postMessage).toHaveBeenCalledWith({
      type: "START",
      payload: { interval: 10 },
    });

    workers[0].emitError();

    expect(uploadAccess.useSchedulerWorker).toBe(false);
    expect(uploadAccess.fallbackSchedulerTimer).not.toBeNull();
  });

  it("does not report negative speed when retry progress rolls back", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("Worker", MockWorker);

    const upload = new FileUpload(
      createFile(128 * MB),
      "upload://backup-storage",
      "long-job-uuid",
      "image-uuid",
      0,
    );
    const uploadAccess = upload as unknown as {
      flowWindow: Array<{ sentSize: number; timing: number }>;
      sentSize: number;
    };
    const speeds: number[] = [];

    uploadAccess.flowWindow = [
      { sentSize: 8 * MB, timing: -2000 },
      { sentSize: 8 * MB, timing: -1000 },
    ];
    uploadAccess.sentSize = 0;
    const stopMonitor = upload.monitor((speed) => {
      speeds.push(speed);
    });

    await vi.advanceTimersByTimeAsync(1000);

    expect(speeds[speeds.length - 1]).toBe(0);
    expect(speeds.every((speed) => speed >= 0)).toBe(true);
    stopMonitor();
    upload.destroy();
  });

  it("replaces a failed chunk progress when the chunk retries", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("Worker", MockWorker);
    vi.stubGlobal("XMLHttpRequest", MockXMLHttpRequest);
    vi.stubGlobal("FormData", MockFormData);

    const upload = new FileUpload(
      createFile(128 * MB),
      "upload://backup-storage",
      "long-job-uuid",
      "image-uuid",
      0,
    );
    const uploadAccess = upload as unknown as {
      maxRetry: number;
      pool: Map<number, unknown>;
    };
    const uploadChunk = {
      hash: "chunk-md5",
      sliceSize: 8 * MB,
      blob: new Blob([new Uint8Array(1)]),
      offset: 0,
    };

    uploadAccess.maxRetry = 1;
    uploadAccess.pool.set(uploadChunk.offset, uploadChunk);
    upload.send(uploadChunk);

    const firstXhr = lastXhr;
    if (!firstXhr) {
      throw new Error("Expected first upload XHR to be created");
    }
    firstXhr.emitUploadProgress(4 * MB);
    expect(upload.getSentSize()).toBe(4 * MB);

    firstXhr.readyState = MockXMLHttpRequest.DONE;
    firstXhr.status = 0;
    firstXhr.onreadystatechange?.();
    await Promise.resolve();
    expect(upload.getSentSize()).toBe(0);

    await vi.advanceTimersByTimeAsync(1000);
    const retryXhr = lastXhr;
    if (!retryXhr || retryXhr === firstXhr) {
      throw new Error("Expected retry upload XHR to be created");
    }

    retryXhr.emitUploadProgress(2 * MB);
    expect(upload.getSentSize()).toBe(2 * MB);
    retryXhr.emitUploadProgress(6 * MB);
    expect(upload.getSentSize()).toBe(4 * MB);

    retryXhr.readyState = MockXMLHttpRequest.DONE;
    retryXhr.status = 200;
    retryXhr.onreadystatechange?.();
    await Promise.resolve();

    expect(upload.getSentSize()).toBe(4 * MB);
  });

  it("clears pending retry timers when paused", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("Worker", MockWorker);
    vi.stubGlobal("XMLHttpRequest", MockXMLHttpRequest);
    vi.stubGlobal("FormData", MockFormData);

    const upload = new FileUpload(
      createFile(128 * MB),
      "upload://backup-storage",
      "long-job-uuid",
      "image-uuid",
      0,
    );
    const uploadAccess = upload as unknown as {
      maxRetry: number;
      pool: Map<number, unknown>;
      retryTimers?: Map<number, ReturnType<typeof setTimeout>>;
    };
    const uploadChunk = {
      hash: "chunk-md5",
      sliceSize: 8 * MB,
      blob: new Blob([new Uint8Array(1)]),
      offset: 0,
    };

    uploadAccess.maxRetry = 1;
    uploadAccess.pool.set(uploadChunk.offset, uploadChunk);
    upload.send(uploadChunk);

    if (!lastXhr) {
      throw new Error("Expected upload XHR to be created");
    }
    lastXhr.readyState = MockXMLHttpRequest.DONE;
    lastXhr.status = 0;
    lastXhr.onreadystatechange?.();
    await Promise.resolve();
    await Promise.resolve();

    expect(uploadAccess.retryTimers?.size).toBe(1);
    upload.pause();
    expect(uploadAccess.retryTimers?.size).toBe(0);

    await vi.runOnlyPendingTimersAsync();
    expect(xhrs).toHaveLength(1);
  });

  it("clears pending retry timers when destroyed", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("Worker", MockWorker);
    vi.stubGlobal("XMLHttpRequest", MockXMLHttpRequest);
    vi.stubGlobal("FormData", MockFormData);

    const upload = new FileUpload(
      createFile(128 * MB),
      "upload://backup-storage",
      "long-job-uuid",
      "image-uuid",
      0,
    );
    const uploadAccess = upload as unknown as {
      maxRetry: number;
      pool: Map<number, unknown>;
      retryTimers?: Map<number, ReturnType<typeof setTimeout>>;
    };
    const uploadChunk = {
      hash: "chunk-md5",
      sliceSize: 8 * MB,
      blob: new Blob([new Uint8Array(1)]),
      offset: 0,
    };

    uploadAccess.maxRetry = 1;
    uploadAccess.pool.set(uploadChunk.offset, uploadChunk);
    upload.send(uploadChunk);

    if (!lastXhr) {
      throw new Error("Expected upload XHR to be created");
    }
    lastXhr.readyState = MockXMLHttpRequest.DONE;
    lastXhr.status = 0;
    lastXhr.onreadystatechange?.();
    await Promise.resolve();
    await Promise.resolve();

    expect(uploadAccess.retryTimers?.size).toBe(1);
    upload.destroy();
    expect(uploadAccess.retryTimers?.size).toBe(0);

    await vi.runOnlyPendingTimersAsync();
    expect(xhrs).toHaveLength(1);
  });

  it("ignores late failed XHR callbacks after destroy without scheduling retries", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("Worker", MockWorker);
    vi.stubGlobal("XMLHttpRequest", MockXMLHttpRequest);
    vi.stubGlobal("FormData", MockFormData);

    const upload = new FileUpload(
      createFile(128 * MB),
      "upload://backup-storage",
      "long-job-uuid",
      "image-uuid",
      0,
    );
    const uploadAccess = upload as unknown as {
      maxRetry: number;
      pool: Map<number, unknown>;
      retryTimers?: Map<number, ReturnType<typeof setTimeout>>;
    };
    const uploadChunk = {
      hash: "chunk-md5",
      sliceSize: 8 * MB,
      blob: new Blob([new Uint8Array(1)]),
      offset: 0,
    };

    uploadAccess.maxRetry = 1;
    uploadAccess.pool.set(uploadChunk.offset, uploadChunk);
    upload.send(uploadChunk);

    const inflightXhr = lastXhr;
    if (!inflightXhr) {
      throw new Error("Expected upload XHR to be created");
    }

    upload.destroy();
    expect(inflightXhr.abort).toHaveBeenCalledTimes(1);
    expect(uploadAccess.pool.size).toBe(0);

    inflightXhr.readyState = MockXMLHttpRequest.DONE;
    inflightXhr.status = 0;
    inflightXhr.onreadystatechange?.();
    await Promise.resolve();

    expect(uploadAccess.retryTimers?.size).toBe(0);
    await vi.runOnlyPendingTimersAsync();
    expect(xhrs).toHaveLength(1);
  });

  it("notifies upper layers when all chunks are uploaded", () => {
    vi.stubGlobal("Worker", MockWorker);

    const onComplete = vi.fn();
    const upload = new FileUpload(
      createFile(8 * MB),
      "upload://backup-storage",
      "long-job-uuid",
      "image-uuid",
      0,
      "image",
      undefined,
      { onComplete },
    );
    const uploadAccess = upload as unknown as {
      calcComplete: boolean;
      markCompleteIfDone: () => void;
    };

    uploadAccess.calcComplete = true;
    uploadAccess.markCompleteIfDone();

    expect(onComplete).toHaveBeenCalledWith({ upload });
  });

  it("notifies upper layers immediately when the browser goes offline", () => {
    vi.stubGlobal("Worker", MockWorker);
    const listeners: Record<string, () => void> = {};
    const addEventListener = vi.fn(
      (eventName: string, listener: () => void) => {
        listeners[eventName] = listener;
      },
    );
    const removeEventListener = vi.fn();
    vi.stubGlobal("window", {
      addEventListener,
      removeEventListener,
    });
    vi.stubGlobal("navigator", { onLine: false });

    const onRecoverableUploadError = vi.fn();
    const onManualPause = vi.fn();
    const upload = new FileUpload(
      createFile(128 * MB),
      "upload://backup-storage",
      "long-job-uuid",
      "image-uuid",
      0,
      "image",
      undefined,
      {
        onManualPause,
        onRecoverableUploadError,
      },
    );

    upload.launch();
    listeners.offline?.();

    expect(addEventListener).toHaveBeenCalledWith(
      "offline",
      expect.any(Function),
    );
    expect(onManualPause).not.toHaveBeenCalled();
    expect(onRecoverableUploadError).toHaveBeenCalledWith({
      upload,
      error: expect.objectContaining({
        offset: 0,
        retryable: true,
        status: 0,
        error: "Browser offline",
      }),
    });
    expect((upload as unknown as { abort: boolean }).abort).toBe(true);
    upload.destroy();
    expect(removeEventListener).toHaveBeenCalledWith(
      "offline",
      expect.any(Function),
    );
  });

  it("re-registers the offline listener after auto resume", () => {
    vi.stubGlobal("Worker", MockWorker);
    let online = true;
    const listeners: Record<string, () => void> = {};
    const addEventListener = vi.fn(
      (eventName: string, listener: () => void) => {
        listeners[eventName] = listener;
      },
    );
    const removeEventListener = vi.fn();
    vi.stubGlobal("window", {
      addEventListener,
      removeEventListener,
    });
    vi.stubGlobal("navigator", {
      get onLine() {
        return online;
      },
    });

    const onRecoverableUploadError = vi.fn();
    const upload = new FileUpload(
      createFile(128 * MB),
      "upload://backup-storage",
      "long-job-uuid",
      "image-uuid",
      0,
      "image",
      undefined,
      { onRecoverableUploadError },
    );

    upload.launch();
    online = false;
    listeners.offline?.();
    expect(onRecoverableUploadError).toHaveBeenCalledTimes(1);

    online = true;
    upload.resume(24 * MB);
    expect(addEventListener).toHaveBeenCalledTimes(2);

    online = false;
    listeners.offline?.();
    expect(onRecoverableUploadError).toHaveBeenCalledTimes(2);
    expect(onRecoverableUploadError).toHaveBeenLastCalledWith({
      upload,
      error: expect.objectContaining({
        offset: 24 * MB,
        retryable: true,
        status: 0,
      }),
    });
  });

  it("rebinds the upload target when BFF recreates the long job", () => {
    vi.stubGlobal("Worker", MockWorker);
    vi.stubGlobal("XMLHttpRequest", MockXMLHttpRequest);
    vi.stubGlobal("FormData", MockFormData);

    const file = createFile(128 * MB);
    const upload = new FileUpload(
      file,
      "upload://old-backup-storage",
      "old-long-job",
      "old-image",
      32 * MB,
    );

    upload.rebindUploadTarget({
      artifactUuid: "new-image",
      offset: 0,
      realUuid: "new-long-job",
      uploadUrl: "upload://new-backup-storage",
      uploadType: "image",
    });

    expect(upload.getRealUuid()).toBe("new-long-job");
    expect(upload.getSentSize()).toBe(0);

    upload.request("chunk-md5", 8 * MB, new Blob([new Uint8Array(1)]), 0);

    expect(lastXhr?.headers.TRANSIT).toBe("upload://new-backup-storage");
    expect(lastXhr?.headers["JOB-ID"]).toBe("new-long-job");
    expect(lastXhr?.headers["X-IMAGE-UUID"]).toBe("new-image");
  });

  it("notifies upper layers when upload becomes active", () => {
    vi.stubGlobal("Worker", MockWorker);

    const onLaunch = vi.fn();
    const upload = new FileUpload(
      createFile(128 * MB),
      "upload://backup-storage",
      "long-job-uuid",
      "image-uuid",
      0,
      "image",
      undefined,
      { onLaunch },
    );

    upload.launch();

    expect(onLaunch).toHaveBeenCalledWith({ upload });
  });
});
