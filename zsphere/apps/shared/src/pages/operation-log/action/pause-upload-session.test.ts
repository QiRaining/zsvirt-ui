import {
  refreshResumableUploadSessions,
  updateUploadSession,
} from "@zstack/zsphere-hooks";
import { describe, expect, it, vi } from "vitest";

import { pauseUploadSession } from "./pause-upload-session";

vi.mock("@zstack/zsphere-hooks", () => ({
  refreshResumableUploadSessions: vi.fn(async () => []),
  updateUploadSession: vi.fn(async () => ({ status: "PAUSED" })),
}));

describe("pauseUploadSession", () => {
  it("pauses the local uploader and persists PAUSED to upload session", async () => {
    const file = { pause: vi.fn() };

    await pauseUploadSession("job-1", file);

    expect(file.pause).toHaveBeenCalledTimes(1);
    expect(updateUploadSession).toHaveBeenCalledWith("job-1", {
      status: "PAUSED",
    });
    expect(refreshResumableUploadSessions).toHaveBeenCalledTimes(1);
  });
});
