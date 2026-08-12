import { describe, expect, it } from "vitest";

import {
  buildUploadResumeOperationLog,
  getHeaderResumableUploadSessions,
  getUploadSessionProgressLabel,
  getUploadSessionProgressPercent,
} from "./upload-resume-entry-utils";

const baseSession = {
  uploadType: "image" as const,
  hash: "hash-1",
  fileName: "openEuler.qcow2",
  fileSize: 100,
  lastModified: 1,
  longJobUuid: "job-1",
  offset: 25,
  status: "WAITING_FOR_FILE" as const,
  resumable: true,
  lastOpDate: "2026-05-27T10:00:00.000Z",
};

describe("getHeaderResumableUploadSessions", () => {
  it("keeps only resumable upload sessions that can be continued in the header", () => {
    expect(
      getHeaderResumableUploadSessions([
        baseSession,
        {
          ...baseSession,
          longJobUuid: "job-2",
          status: "UPLOADING",
        },
        {
          ...baseSession,
          longJobUuid: "job-retry-waiting",
          status: "RETRY_WAITING",
        },
        {
          ...baseSession,
          longJobUuid: "job-retry-ready",
          status: "RETRY_READY",
          lastOpDate: "2026-05-27T11:00:00.000Z",
        },
        {
          ...baseSession,
          longJobUuid: "job-3",
          status: "COMPLETED",
        },
        {
          ...baseSession,
          longJobUuid: "job-4",
          resumable: false,
        },
        {
          ...baseSession,
          longJobUuid: "",
        },
      ]),
    ).toEqual([
      {
        ...baseSession,
        longJobUuid: "job-retry-ready",
        status: "RETRY_READY",
        lastOpDate: "2026-05-27T11:00:00.000Z",
      },
      baseSession,
    ]);
  });

  it("sorts the newest resumable session first", () => {
    const older = {
      ...baseSession,
      longJobUuid: "older",
      lastOpDate: "2026-05-27T09:00:00.000Z",
    };
    const newer = {
      ...baseSession,
      longJobUuid: "newer",
      lastOpDate: "2026-05-27T11:00:00.000Z",
    };

    expect(
      getHeaderResumableUploadSessions([older, newer]).map(
        (session) => session.longJobUuid,
      ),
    ).toEqual(["newer", "older"]);
  });
});

describe("buildUploadResumeOperationLog", () => {
  it("maps upload type to the long job name expected by useResume", () => {
    expect(
      buildUploadResumeOperationLog({
        ...baseSession,
        uploadType: "storagePackage",
      }).longjobs?.[0]?.jobName,
    ).toBe("APIUploadSoftwarePackageMsg");

    expect(
      buildUploadResumeOperationLog({
        ...baseSession,
        uploadType: "migrationServicePackage",
      }).longjobs?.[0]?.jobName,
    ).toBe("APIUploadSoftwarePackageToBackupStorageMsg");
  });

  it("keeps the upload session on synthetic operation logs for resume validation", () => {
    expect(
      (
        buildUploadResumeOperationLog(baseSession) as {
          uploadSession?: typeof baseSession;
        }
      ).uploadSession,
    ).toBe(baseSession);
  });

  it("keeps recreated job relationship fields for retry-ready sessions", () => {
    const session = {
      ...baseSession,
      longJobUuid: "new-job",
      previousLongJobUuid: "old-job",
      replacedFromLongJobUuid: "root-job",
      rootSessionId: "root-job",
      status: "RETRY_READY" as const,
    };
    const operationLog = buildUploadResumeOperationLog(session) as {
      actionId?: string;
      uploadSession?: typeof session;
      longjobs?: Array<{ longJobUuid?: string }>;
    };

    expect(operationLog.actionId).toBe("new-job");
    expect(operationLog.longjobs?.[0]?.longJobUuid).toBe("new-job");
    expect(operationLog.uploadSession).toEqual(
      expect.objectContaining({
        longJobUuid: "new-job",
        previousLongJobUuid: "old-job",
        replacedFromLongJobUuid: "root-job",
        rootSessionId: "root-job",
      }),
    );
  });
});

describe("getUploadSessionProgressPercent", () => {
  it("formats bounded upload progress from offset and file size", () => {
    expect(getUploadSessionProgressPercent(baseSession)).toBe(25);
    expect(
      getUploadSessionProgressPercent({
        ...baseSession,
        offset: 120,
      }),
    ).toBe(100);
    expect(
      getUploadSessionProgressPercent({
        ...baseSession,
        fileSize: 0,
      }),
    ).toBeUndefined();
  });

  it("uses less-than-one percent label when uploaded bytes are non-zero", () => {
    expect(
      getUploadSessionProgressLabel({
        ...baseSession,
        offset: 496,
        fileSize: 60 * 1024 * 1024,
      }),
    ).toBe("<1%");
    expect(getUploadSessionProgressLabel({ ...baseSession, offset: 0 })).toBe(
      "0%",
    );
    expect(getUploadSessionProgressLabel(baseSession)).toBe("25%");
  });
});
