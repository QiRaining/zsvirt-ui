import { describe, expect, it } from "vitest";

import { getAllLongjobs, verifyGoingOn, verifyPause } from "./validators";

const createOperationLog = (overrides: Record<string, unknown>) =>
  overrides as any;

describe("operation-log validators", () => {
  it("collects nested longjobs and normalizes state", () => {
    const log = createOperationLog({
      longjobs: [
        {
          longJobUuid: "job-1",
          jobName: "APIAddImageMsg",
          state: "Running",
        },
      ],
      operationTasks: [
        {
          operationApis: [
            {
              longjob: {
                longJobUuid: "job-2",
                jobName: "APIUploadSoftwarePackageMsg",
                state: "Suspended",
              },
            },
          ],
        },
      ],
    });

    expect(getAllLongjobs(log)).toMatchObject([
      { longJobUuid: "job-1", state: "RUNNING" },
      { longJobUuid: "job-2", state: "SUSPENDED" },
    ]);
  });

  it("uses nested upload longjobs for pause and resume visibility", () => {
    const runningLog = createOperationLog({
      operationTasks: [
        {
          operationApis: [
            {
              resp: JSON.stringify({
                jobData: JSON.stringify({ url: "upload://backup-storage" }),
              }),
              longjob: {
                longJobUuid: "job-1",
                jobName: "APIAddImageMsg",
                state: "Running",
              },
            },
          ],
        },
      ],
    });
    const suspendedLog = createOperationLog({
      operationTasks: [
        {
          operationApis: [
            {
              longjob: {
                longJobUuid: "job-2",
                jobName: "APIUploadSoftwarePackageMsg",
                state: "Suspended",
              },
            },
          ],
        },
      ],
    });

    expect(verifyPause(runningLog)).toBe(true);
    expect(verifyGoingOn(suspendedLog)).toBe(true);
  });

  it("treats real migration service package APIs as upload longjobs", () => {
    const uploadToBackupStorageLog = createOperationLog({
      operationTasks: [
        {
          operationApis: [
            {
              longjob: {
                longJobUuid: "job-migration-upload",
                jobName: "APIUploadSoftwarePackageToBackupStorageMsg",
                state: "Suspended",
              },
            },
          ],
        },
      ],
    });
    const upgradeLog = createOperationLog({
      operationTasks: [
        {
          operationApis: [
            {
              longjob: {
                longJobUuid: "job-migration-upgrade",
                jobName: "APIUploadAndExecuteSoftwareUpgradePackageMsg",
                state: "Suspended",
              },
            },
          ],
        },
      ],
    });

    expect(verifyGoingOn(uploadToBackupStorageLog)).toBe(true);
    expect(verifyGoingOn(upgradeLog)).toBe(true);
  });
});
