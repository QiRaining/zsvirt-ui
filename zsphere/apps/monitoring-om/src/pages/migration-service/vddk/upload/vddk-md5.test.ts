import { afterEach, describe, expect, it, vi } from "vitest";

import { calculateFileMd5, calculateFileMd5OnMainThread } from "./vddk-md5";

const HELLO_WORLD_MD5 = "5eb63bbbe01eeed093cb22bb8f5acdc3";

describe("VDDK full-file MD5", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("hashes every byte across multiple chunks", async () => {
    const file = new File(["hello world"], "vddk.tar.gz");

    await expect(calculateFileMd5OnMainThread(file, 2)).resolves.toBe(
      HELLO_WORLD_MD5,
    );
  });

  it("uses the worker result and always terminates the worker", async () => {
    const terminate = vi.fn();

    class SuccessfulWorker {
      onmessage: ((event: MessageEvent) => void) | null = null;
      onerror: ((event: ErrorEvent) => void) | null = null;

      postMessage() {
        queueMicrotask(() => {
          this.onmessage?.({
            data: { type: "success", md5: HELLO_WORLD_MD5 },
          } as MessageEvent);
        });
      }

      terminate = terminate;
    }

    vi.stubGlobal("Worker", SuccessfulWorker);

    await expect(
      calculateFileMd5(new File(["ignored by worker"], "vddk.tar.gz")),
    ).resolves.toBe(HELLO_WORLD_MD5);
    expect(terminate).toHaveBeenCalledTimes(1);
  });

  it("falls back to complete main-thread hashing when the worker fails", async () => {
    const terminate = vi.fn();

    class FailingWorker {
      onmessage: ((event: MessageEvent) => void) | null = null;
      onerror: ((event: ErrorEvent) => void) | null = null;

      postMessage() {
        queueMicrotask(() => {
          this.onerror?.(new Event("error") as ErrorEvent);
        });
      }

      terminate = terminate;
    }

    vi.stubGlobal("Worker", FailingWorker);

    await expect(
      calculateFileMd5(new File(["hello world"], "vddk.tar.gz")),
    ).resolves.toBe(HELLO_WORLD_MD5);
    expect(terminate).toHaveBeenCalledTimes(1);
  });

  it("terminates the worker before falling back when postMessage throws", async () => {
    const terminate = vi.fn();

    class ThrowingWorker {
      onmessage: ((event: MessageEvent) => void) | null = null;
      onerror: ((event: ErrorEvent) => void) | null = null;

      postMessage() {
        throw new Error("structured clone failed");
      }

      terminate = terminate;
    }

    vi.stubGlobal("Worker", ThrowingWorker);

    await expect(
      calculateFileMd5(new File(["hello world"], "vddk.tar.gz")),
    ).resolves.toBe(HELLO_WORLD_MD5);
    expect(terminate).toHaveBeenCalledTimes(1);
  });

  it("terminates the worker and falls back after a messageerror", async () => {
    const terminate = vi.fn();

    class MessageErrorWorker {
      onmessage: ((event: MessageEvent) => void) | null = null;
      onmessageerror: ((event: MessageEvent) => void) | null = null;
      onerror: ((event: ErrorEvent) => void) | null = null;

      postMessage() {
        queueMicrotask(() => {
          this.onmessageerror?.(new MessageEvent("messageerror"));
        });
      }

      terminate = terminate;
    }

    vi.stubGlobal("Worker", MessageErrorWorker);

    await expect(
      calculateFileMd5(new File(["hello world"], "vddk.tar.gz")),
    ).resolves.toBe(HELLO_WORLD_MD5);
    expect(terminate).toHaveBeenCalledTimes(1);
  });
});
