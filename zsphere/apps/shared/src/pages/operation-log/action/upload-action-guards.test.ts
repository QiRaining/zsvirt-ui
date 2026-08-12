import { OperationLongjobStatus } from "@zstack/zsphere-types";
import { describe, expect, it } from "vitest";

import { canManuallyContinueUploadJob } from "./upload-action-guards";

describe("upload action guards", () => {
  it("does not allow manual continue while an upload session is auto retrying", () => {
    expect(
      canManuallyContinueUploadJob(
        {
          longJobUuid: "job-1",
          state: OperationLongjobStatus.SUSPENDED,
        },
        {
          resumable: true,
          status: "RETRY_WAITING",
        },
      ),
    ).toBe(false);
  });

  it("allows manual continue for a user-paused upload session", () => {
    expect(
      canManuallyContinueUploadJob(
        {
          longJobUuid: "job-1",
          state: OperationLongjobStatus.SUSPENDED,
        },
        {
          resumable: true,
          status: "PAUSED",
        },
      ),
    ).toBe(true);
  });
});
