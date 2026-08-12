import { calculateFileMd5OnMainThread } from "./vddk-md5-core";

interface VddkMd5WorkerRequest {
  file: File;
}

type VddkMd5WorkerResponse =
  | { type: "success"; md5: string }
  | { type: "error"; message: string };

const workerScope = globalThis as unknown as {
  close: () => void;
  onmessage: ((event: MessageEvent<VddkMd5WorkerRequest>) => void) | null;
  postMessage: (message: VddkMd5WorkerResponse) => void;
};

workerScope.onmessage = (event) => {
  void calculateFileMd5OnMainThread(event.data.file)
    .then((md5) => {
      // eslint-disable-next-line unicorn/require-post-message-target-origin -- Worker.postMessage has no targetOrigin argument.
      workerScope.postMessage({ type: "success", md5 });
    })
    .catch((error: unknown) => {
      const response: VddkMd5WorkerResponse = {
        type: "error",
        message: error instanceof Error ? error.message : String(error),
      };
      // eslint-disable-next-line unicorn/require-post-message-target-origin -- Worker.postMessage has no targetOrigin argument.
      workerScope.postMessage(response);
    })
    .finally(() => {
      workerScope.close();
    });
};
