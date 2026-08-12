import { describe, expect, it, vi } from "vitest";

import { openUploadAfterCleanup } from "./reupload-orchestration";

describe("openUploadAfterCleanup", () => {
  it("opens upload only through the cleanup success continuation", () => {
    const openUpload = vi.fn();
    const resetStatus = vi.fn();

    openUploadAfterCleanup({ openUpload, resetStatus });

    expect(resetStatus).toHaveBeenCalledTimes(1);
    expect(openUpload).not.toHaveBeenCalled();

    resetStatus.mock.calls[0][0].onFinish();

    expect(openUpload).toHaveBeenCalledTimes(1);
  });
});
