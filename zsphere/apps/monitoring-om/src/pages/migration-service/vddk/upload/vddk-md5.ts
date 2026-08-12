export { calculateFileMd5OnMainThread } from "./vddk-md5-core";

import { calculateFileMd5OnMainThread } from "./vddk-md5-core";

type VddkMd5WorkerResponse =
  | { type: "success"; md5: string }
  | { type: "error"; message: string };

const calculateFileMd5ByWorker = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("./vddk-md5.worker.ts", import.meta.url),
      {
        type: "module",
      },
    );

    let settled = false;
    const settle = (callback: () => void) => {
      if (settled) {
        return;
      }
      settled = true;
      worker.onmessage = null;
      worker.onerror = null;
      worker.onmessageerror = null;
      worker.terminate();
      callback();
    };

    worker.onmessage = (event: MessageEvent<VddkMd5WorkerResponse>) => {
      const response = event.data;
      if (response.type === "success") {
        settle(() => resolve(response.md5));
        return;
      }
      settle(() => reject(new Error(response.message)));
    };
    worker.onerror = () => {
      settle(() => reject(new Error("VDDK MD5 worker failed")));
    };
    worker.onmessageerror = () => {
      settle(() => reject(new Error("VDDK MD5 worker message failed")));
    };
    try {
      // eslint-disable-next-line unicorn/require-post-message-target-origin -- Worker.postMessage has no targetOrigin argument.
      worker.postMessage({ file });
    } catch (error) {
      settle(() =>
        reject(error instanceof Error ? error : new Error(String(error))),
      );
    }
  });

export async function calculateFileMd5(file: File): Promise<string> {
  if (typeof Worker === "undefined") {
    return calculateFileMd5OnMainThread(file);
  }

  try {
    return await calculateFileMd5ByWorker(file);
  } catch {
    return calculateFileMd5OnMainThread(file);
  }
}
