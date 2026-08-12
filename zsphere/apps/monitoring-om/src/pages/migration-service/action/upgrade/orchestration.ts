import type { ActionCompletionResult } from "../../action-result";
import { isSuccessfulActionResult } from "../../action-result";

interface UpgradeAfterCleanupOptions {
  submitCleanup: (
    onFinish: (result: ActionCompletionResult) => void,
  ) => unknown;
  executeUpgrade: () => unknown;
}

export const runUpgradeAfterSuccessfulCleanup = ({
  submitCleanup,
  executeUpgrade,
}: UpgradeAfterCleanupOptions): Promise<unknown> =>
  new Promise((resolve, reject) => {
    const onFinish = (result: ActionCompletionResult) => {
      if (!isSuccessfulActionResult(result)) {
        resolve(undefined);
        return;
      }

      try {
        Promise.resolve(executeUpgrade()).then(resolve, reject);
      } catch (error) {
        reject(error);
      }
    };

    try {
      Promise.resolve(submitCleanup(onFinish)).catch(reject);
    } catch (error) {
      reject(error);
    }
  });

interface ExecuteUpgradeRequestOptions {
  isLocalUpload: boolean;
  submitLocalUpload: () => unknown;
  submitUrlUpgrade: () => unknown;
}

export const executeUpgradeRequest = async ({
  isLocalUpload,
  submitLocalUpload,
  submitUrlUpgrade,
}: ExecuteUpgradeRequestOptions): Promise<unknown> =>
  isLocalUpload ? submitLocalUpload() : submitUrlUpgrade();
