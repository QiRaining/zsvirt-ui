import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const hookMocks = vi.hoisted(() => {
  const fileUploadInstances: Array<{
    launch: ReturnType<typeof vi.fn>;
  }> = [];
  const FileUpload = vi.fn(function () {
    const instance = {
      launch: vi.fn(),
    };
    fileUploadInstances.push(instance);
    return instance;
  });

  return {
    FileUpload,
    alovaInstance: {
      Get: vi.fn(() => ({
        send: vi.fn(async () => ({ offset: 0 })),
      })),
    },
    doAction: vi.fn(async () => ({
      data: {
        addPackage: {
          jobResult: JSON.stringify({
            artifactUuid: "package-uuid",
            realUuid: "long-job-uuid",
            uploadUrl: "upload://package-target",
          }),
        },
      },
    })),
    fileUploadInstances,
    getUploadAutoResumeConfig: vi.fn(() => ({})),
    getUploadTargetTime: vi.fn(async () => 60),
    platformState: {
      migrationServicePackageResume: {},
      setMigrationServicePackageResume: vi.fn(),
      setStoragePackageResume: vi.fn(),
      storagePackageResume: {},
    },
    simpleHash: vi.fn(async () => "package-hash"),
  };
});

vi.mock("@zstack/alova-instance", () => ({
  default: hookMocks.alovaInstance,
}));

vi.mock("@zstack/zsphere-platform-store", () => ({
  usePlatformStore: () => hookMocks.platformState,
}));

vi.mock("@zstack/zsphere-utils", () => ({
  FileUpload: hookMocks.FileUpload,
  simpleHash: hookMocks.simpleHash,
}));

vi.mock("../use-action", () => ({
  default: () => hookMocks.doAction,
}));

vi.mock("../use-upload-auto-resume", () => ({
  default: () => hookMocks.getUploadAutoResumeConfig,
}));

vi.mock("../use-upload-target-time", () => ({
  default: () => hookMocks.getUploadTargetTime,
}));

import useUploadPackage from ".";

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  hookMocks.fileUploadInstances.length = 0;
  hookMocks.platformState.storagePackageResume = {};
  hookMocks.platformState.migrationServicePackageResume = {};
});

describe("useUploadPackage", () => {
  const renderUseUploadPackage = () =>
    renderHook(() =>
      useUploadPackage({
        actionName: "upload package",
        buildPayload: () => ({}),
        jobName: "APIUploadSoftwarePackageMsg",
        mutation: {} as never,
        mutationResponseKey: "addPackage",
        recovery: {
          mode: "session",
          hashCheckEndpoint: "/api/uploadStoragePackagehashcheck",
        },
        uploadType: "storagePackage",
      }),
    );

  it("does not launch package upload when upload session registration fails", async () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "session-1"),
    });
    const fetchMock = vi.fn(async () => ({
      ok: false,
      status: 503,
    }));
    vi.stubGlobal("fetch", fetchMock);
    const file = new File(["package"], "upgrade.iso");
    const { result } = renderUseUploadPackage();

    await expect(result.current.submitHandle({}, file)).rejects.toThrow(
      "Upload session request failed with 503",
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/upload-sessions",
      expect.objectContaining({ method: "POST" }),
    );
    expect(hookMocks.FileUpload).not.toHaveBeenCalled();
    expect(
      hookMocks.platformState.setStoragePackageResume,
    ).not.toHaveBeenCalled();
  });

  it("uses the configured resource type for a URL upload", async () => {
    const { result } = renderHook(() =>
      useUploadPackage({
        actionName: "Upload migration package",
        buildPayload: () => ({ type: "ZMigrate" }),
        jobName: "APIUploadSoftwarePackageToBackupStorageMsg",
        mutation: {} as never,
        mutationResponseKey: "addPackage",
        recovery: { mode: "session", hashCheckEndpoint: "/api/hashcheck" },
        resourceType: "MigrationService",
        uploadType: "migrationServicePackage",
      }),
    );

    await result.current.submitHandle(
      { uploadMethod: "url", url: "https://example.com/zmigrate.tar.gz" },
      undefined,
    );

    expect(hookMocks.doAction).toHaveBeenCalledWith(
      expect.objectContaining({ type: "MigrationService" }),
    );
  });

  it("propagates the original URL action failure", async () => {
    const originalError = new Error("URL upload submission failed");
    const actionPromise = Promise.reject(originalError);
    void actionPromise.catch(() => undefined);
    hookMocks.doAction.mockReturnValueOnce(actionPromise);
    const { result } = renderHook(() =>
      useUploadPackage({
        actionName: "Upload migration package",
        buildPayload: () => ({ type: "ZMigrate" }),
        jobName: "APIUploadSoftwarePackageToBackupStorageMsg",
        mutation: {} as never,
        mutationResponseKey: "addPackage",
        recovery: { mode: "session", hashCheckEndpoint: "/api/hashcheck" },
        resourceType: "MigrationService",
        uploadType: "migrationServicePackage",
      }),
    );

    await expect(
      result.current.submitHandle(
        { uploadMethod: "url", url: "https://example.com/zmigrate.tar.gz" },
        undefined,
      ),
    ).rejects.toBe(originalError);
  });

  it("runs the complete migration package session upload chain", async () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "session-1"),
    });
    const fetchMock = vi.fn(
      async (_url: string, _options?: RequestInit) => ({
        ok: true,
        json: vi.fn(async () => ({})),
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const hashCheckSend = vi.fn(async () => ({ offset: 0 }));
    hookMocks.alovaInstance.Get.mockReturnValueOnce({ send: hashCheckSend });
    hookMocks.doAction.mockResolvedValueOnce({
      data: {
        addPackage: {
          jobResult: JSON.stringify({
            artifactUuid: "migration-package-uuid",
            realUuid: "migration-long-job-uuid",
            uploadUrl: "http://example.com/migration-upload",
          }),
        },
      },
    });
    const buildPayload = vi.fn((_formData, fileName) => ({
      name: fileName,
      type: "ZMigrate",
      url: `upload://${fileName}`,
    }));
    const { result } = renderHook(() =>
      useUploadPackage({
        actionName: "Upload migration package",
        buildPayload,
        jobName: "APIUploadSoftwarePackageToBackupStorageMsg",
        mutation: {} as never,
        mutationResponseKey: "addPackage",
        recovery: {
          mode: "session",
          hashCheckEndpoint: "/api/uploadMigrationServicePackagehashcheck",
        },
        resourceType: "MigrationService",
        uploadType: "migrationServicePackage",
      }),
    );
    const file = new File(["migration-package"], "zmigrate.tar.gz", {
      lastModified: 1234,
    });

    await result.current.submitHandle({ uploadMethod: "local" }, file);

    expect(buildPayload).toHaveBeenCalledWith(
      { uploadMethod: "local" },
      "zmigrate.tar.gz",
    );
    expect(hookMocks.simpleHash).toHaveBeenCalledWith(file);
    expect(hookMocks.alovaInstance.Get).toHaveBeenCalledWith(
      "/api/uploadMigrationServicePackagehashcheck/package-hash",
    );
    expect(hashCheckSend).toHaveBeenCalledTimes(1);
    expect(hookMocks.doAction).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: {
          hash: "package-hash",
          name: "zmigrate.tar.gz",
          type: "ZMigrate",
          url: "upload://zmigrate.tar.gz",
        },
        type: "MigrationService",
      }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/upload-sessions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "x-session-id": "session-1" }),
      }),
    );
    const registration = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string,
    );
    expect(registration).toMatchObject({
      uploadType: "migrationServicePackage",
      hash: "package-hash",
      fileName: "zmigrate.tar.gz",
      fileSize: file.size,
      lastModified: 1234,
      longJobUuid: "migration-long-job-uuid",
      artifactUuid: "migration-package-uuid",
      uploadUrl: "http://example.com/migration-upload",
      offset: 0,
      status: "UPLOADING",
      jobName: "APIUploadSoftwarePackageToBackupStorageMsg",
      actionName: "Upload migration package",
      resourceType: "MigrationService",
    });
    expect(hookMocks.FileUpload).toHaveBeenCalledWith(
      file,
      "http://example.com/migration-upload",
      "migration-long-job-uuid",
      "migration-package-uuid",
      0,
      "migrationServicePackage",
      undefined,
      expect.objectContaining({ targetUploadTime: 60 }),
    );
    expect(hookMocks.fileUploadInstances[0].launch).toHaveBeenCalledTimes(1);
    expect(
      hookMocks.platformState.setMigrationServicePackageResume,
    ).toHaveBeenCalledWith({
      "migration-long-job-uuid": hookMocks.fileUploadInstances[0],
      "package-hash": hookMocks.fileUploadInstances[0],
    });
  });

  it("accepts the legacy inventory upload target for a local migration package", async () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "session-1"),
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: vi.fn(async () => ({})),
      })),
    );
    hookMocks.doAction.mockResolvedValueOnce({
      data: {
        addPackage: {
          jobResult: JSON.stringify({
            inventory: {
              uuid: "legacy-package-uuid",
              uploadFileUrl: "http://example.com/legacy-upload",
            },
            realUuid: "legacy-long-job-uuid",
          }),
        },
      },
    });
    const { result } = renderHook(() =>
      useUploadPackage({
        actionName: "Upload migration package",
        buildPayload: (_formData, fileName) => ({
          name: fileName,
          type: "ZMigrate",
          url: `upload://${fileName}`,
        }),
        jobName: "APIUploadSoftwarePackageToBackupStorageMsg",
        mutation: {} as never,
        mutationResponseKey: "addPackage",
        recovery: {
          mode: "session",
          hashCheckEndpoint: "/api/uploadMigrationServicePackagehashcheck",
        },
        resourceType: "MigrationService",
        uploadType: "migrationServicePackage",
      }),
    );
    const file = new File(["migration-package"], "zmigrate.tar.gz");

    await result.current.submitHandle({ uploadMethod: "local" }, file);

    expect(hookMocks.FileUpload).toHaveBeenCalledWith(
      file,
      "http://example.com/legacy-upload",
      "legacy-long-job-uuid",
      "legacy-package-uuid",
      0,
      "migrationServicePackage",
      undefined,
      expect.objectContaining({ targetUploadTime: 60 }),
    );
    expect(hookMocks.fileUploadInstances[0].launch).toHaveBeenCalledTimes(1);
  });

  it("tracks a VDDK upload in memory without hashcheck or session registration", async () => {
    hookMocks.doAction.mockResolvedValueOnce({
      data: {
        addPackage: {
          jobResult: JSON.stringify({
            artifactUuid: "vddk-upload-task",
            realUuid: "vddk-long-job",
            uploadUrl: "http://example.com/vddk-upload",
          }),
        },
      },
    });
    const { result } = renderHook(() =>
      useUploadPackage({
        actionName: "Upload VDDK",
        buildPayload: (_formData, fileName) => ({
          url: `upload://${fileName}`,
        }),
        jobName: "APIUploadSoftwarePackageToVmMsg",
        mutation: {} as never,
        mutationResponseKey: "addPackage",
        recovery: { mode: "memory" },
        resourceType: "MigrationService",
        uploadType: "migrationServicePackage",
      }),
    );
    const file = new File(["vddk"], "VMware-vix-disklib.tar.gz");

    await result.current.submitHandle({ uploadMethod: "local" }, file);

    expect(hookMocks.simpleHash).not.toHaveBeenCalled();
    expect(hookMocks.alovaInstance.Get).not.toHaveBeenCalled();
    expect(hookMocks.doAction).toHaveBeenCalledWith(
      expect.objectContaining({ type: "MigrationService" }),
    );
    expect(hookMocks.FileUpload).toHaveBeenCalledWith(
      file,
      "http://example.com/vddk-upload",
      "vddk-long-job",
      "vddk-upload-task",
      0,
      "migrationServicePackage",
      undefined,
      expect.objectContaining({ targetUploadTime: 60 }),
    );
    expect(hookMocks.fileUploadInstances[0].launch).toHaveBeenCalledTimes(1);
    expect(
      hookMocks.platformState.setMigrationServicePackageResume,
    ).toHaveBeenCalledWith({
      "vddk-long-job": hookMocks.fileUploadInstances[0],
    });
  });

  it("rejects a malformed upload target before launching the file upload", async () => {
    hookMocks.doAction.mockResolvedValueOnce({
      data: {
        addPackage: {
          jobResult: JSON.stringify({
            artifactUuid: "vddk-upload-task",
            realUuid: "vddk-long-job",
          }),
        },
      },
    });
    const { result } = renderHook(() =>
      useUploadPackage({
        actionName: "Upload VDDK",
        buildPayload: (_formData, fileName) => ({
          url: `upload://${fileName}`,
        }),
        jobName: "APIUploadSoftwarePackageToVmMsg",
        mutation: {} as never,
        mutationResponseKey: "addPackage",
        recovery: { mode: "memory" },
        uploadType: "migrationServicePackage",
      }),
    );
    const file = new File(["vddk"], "VMware-vix-disklib.tar.gz");

    await expect(
      result.current.submitHandle({ uploadMethod: "local" }, file),
    ).rejects.toThrow("Invalid upload target");

    expect(hookMocks.FileUpload).not.toHaveBeenCalled();
    expect(
      hookMocks.platformState.setMigrationServicePackageResume,
    ).not.toHaveBeenCalled();
  });
});
