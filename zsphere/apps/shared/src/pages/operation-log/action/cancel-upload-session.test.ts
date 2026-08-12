import { describe, expect, it, vi } from "vitest";

import { cancelLocalUploadSessions } from "./cancel-upload-session";

const createUploadLog = (overrides: Record<string, unknown> = {}) =>
  ({
    uuid: "job-1",
    longjobs: [
      {
        data: JSON.stringify({ url: "upload://openEuler.raw" }),
        jobName: "APIAddImageMsg",
        longJobUuid: "job-1",
        state: "Running",
      },
    ],
    ...overrides,
  }) as never;

describe("cancelLocalUploadSessions", () => {
  it("destroys local uploader for upload long jobs before backend cancel", () => {
    const del = vi.fn();
    const getUploadControl = vi.fn(() => ({ del }));

    cancelLocalUploadSessions([createUploadLog()], getUploadControl);

    expect(getUploadControl).toHaveBeenCalledTimes(1);
    expect(del).toHaveBeenCalledTimes(1);
  });

  it("does not touch local upload state for non-upload image jobs", () => {
    const del = vi.fn();
    const getUploadControl = vi.fn(() => ({ del }));

    cancelLocalUploadSessions(
      [
        createUploadLog({
          longjobs: [
            {
              data: JSON.stringify({ url: "http://example.com/image.qcow2" }),
              jobName: "APIAddImageMsg",
              longJobUuid: "job-1",
              state: "Running",
            },
          ],
        }),
      ],
      getUploadControl,
    );

    expect(getUploadControl).not.toHaveBeenCalled();
    expect(del).not.toHaveBeenCalled();
  });
});
