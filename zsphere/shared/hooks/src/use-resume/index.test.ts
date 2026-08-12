import {
  act,
  fireEvent,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import React from "react";
import { createIntl, RawIntlProvider } from "react-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

const hookMocks = vi.hoisted(() => {
  const fileUploadInstances: Array<{
    args: unknown[];
    launch: ReturnType<typeof vi.fn>;
  }> = [];
  const FileUpload = vi.fn(function (...args: unknown[]) {
    const instance = {
      args,
      launch: vi.fn(),
    };
    fileUploadInstances.push(instance);
    return instance;
  });

  return {
    FileUpload,
    fileUploadInstances,
    getUploadAutoResumeConfig: vi.fn(() => ({})),
    getUploadTargetTime: vi.fn(async () => 60),
    platformState: {
      fileResume: {},
      migrationServicePackageResume: {},
      setFileResume: vi.fn(),
      setMigrationServicePackageResume: vi.fn(),
      setStoragePackageResume: vi.fn(),
      storagePackageResume: {},
    },
    simpleHash: vi.fn(async () => "fresh-hash"),
  };
});

const antdMocks = vi.hoisted(() => {
  const destroy = vi.fn();
  return {
    confirm: vi.fn((_config: unknown) => ({ destroy })),
    destroy,
  };
});

vi.mock("antd", () => ({
  Modal: {
    confirm: antdMocks.confirm,
  },
}));

vi.mock("@zstack/zsphere-platform-store", () => ({
  usePlatformStore: () => hookMocks.platformState,
}));

vi.mock("../use-upload-target-time", () => ({
  default: () => hookMocks.getUploadTargetTime,
}));

vi.mock("../use-upload-auto-resume", () => ({
  default: () => hookMocks.getUploadAutoResumeConfig,
}));

vi.mock("@zstack/zsphere-utils", () => ({
  FileUpload: hookMocks.FileUpload,
  simpleHash: hookMocks.simpleHash,
}));

import {
  getUploadResumeHashCandidates,
  getUploadTypeFromJobName,
  isSameUploadSessionFile,
  openUploadConfirmModal,
  resolveUploadResumeCheck,
  default as useResume,
} from ".";
import type { OpenUploadConfirmModal } from ".";

afterEach(() => {
  document.body.innerHTML = "";
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  antdMocks.confirm.mockImplementation((_config: unknown) => ({
    destroy: antdMocks.destroy,
  }));
  hookMocks.fileUploadInstances.length = 0;
  hookMocks.platformState.fileResume = {};
  hookMocks.platformState.storagePackageResume = {};
  hookMocks.platformState.migrationServicePackageResume = {};
});

describe("getUploadTypeFromJobName", () => {
  it("maps real backend upload job names to frontend upload types", () => {
    expect(getUploadTypeFromJobName("APIAddImageMsg")).toBe("image");
    expect(getUploadTypeFromJobName("APIUploadSoftwarePackageMsg")).toBe(
      "storagePackage",
    );
    expect(
      getUploadTypeFromJobName("APIUploadSoftwarePackageToBackupStorageMsg"),
    ).toBe("migrationServicePackage");
    expect(
      getUploadTypeFromJobName("APIUploadAndExecuteSoftwareUpgradePackageMsg"),
    ).toBe("migrationServicePackage");
    expect(getUploadTypeFromJobName("APIUploadSoftwarePackageToVmMsg")).toBe(
      "migrationServicePackage",
    );
  });

  it("falls back to image for unknown job names", () => {
    expect(getUploadTypeFromJobName("APINonUploadMsg")).toBe("image");
  });
});

describe("resume upload file matching", () => {
  const createFile = (options?: { lastModified?: number; name?: string }) =>
    new File(["same-content"], options?.name || "openEuler.raw", {
      lastModified: options?.lastModified ?? 1779857396248,
      type: "application/octet-stream",
    });

  it("treats the selected file as the same resumable file when metadata matches", () => {
    const file = createFile();

    expect(
      isSameUploadSessionFile(
        {
          artifactUuid: "artifact-1",
          fileName: file.name,
          fileSize: file.size,
          hash: "stored-hash",
          lastModified: file.lastModified,
          longJobUuid: "job-1",
          offset: 1024,
          status: "UPLOADING",
          uploadUrl: "http://example.com/upload",
        },
        file,
      ),
    ).toBe(true);
  });

  it("does not trust a same-name file when size or modified time changed", () => {
    const file = createFile();

    expect(
      isSameUploadSessionFile(
        {
          artifactUuid: "artifact-1",
          fileName: file.name,
          fileSize: file.size + 1,
          hash: "stored-hash",
          lastModified: file.lastModified,
          longJobUuid: "job-1",
          offset: 1024,
          status: "UPLOADING",
          uploadUrl: "http://example.com/upload",
        },
        file,
      ),
    ).toBe(false);
    expect(
      isSameUploadSessionFile(
        {
          artifactUuid: "artifact-1",
          fileName: file.name,
          fileSize: file.size,
          hash: "stored-hash",
          lastModified: file.lastModified + 1,
          longJobUuid: "job-1",
          offset: 1024,
          status: "UPLOADING",
          uploadUrl: "http://example.com/upload",
        },
        file,
      ),
    ).toBe(false);
  });

  it("tries the stored session hash before the freshly calculated hash for the same file", () => {
    const file = createFile();

    expect(
      getUploadResumeHashCandidates(
        "fresh-hash",
        {
          artifactUuid: "artifact-1",
          fileName: file.name,
          fileSize: file.size,
          hash: "stored-hash",
          lastModified: file.lastModified,
          longJobUuid: "job-1",
          offset: 1024,
          status: "UPLOADING",
          uploadUrl: "http://example.com/upload",
        },
        file,
      ),
    ).toEqual(["stored-hash", "fresh-hash"]);
  });

  it("does not use the stored DB offset when hashcheck cannot verify the long job", async () => {
    const file = createFile();
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "session-1"),
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: async () => ({
          longJobUuid: "another-job",
          offset: 2048,
          imageUploadUrl: "http://example.com/server-upload",
          imageUuid: "server-image",
        }),
      })),
    );

    await expect(
      resolveUploadResumeCheck({
        config: {
          hashCheckPath: (hash: string) => `/api/uploadhashcheck/${hash}`,
          resumeStateKey: "fileResume",
          uploadUrlKey: "imageUploadUrl",
          uuidKey: "imageUuid",
        } as never,
        file,
        jobId: "job-1",
        selectedHash: "fresh-hash",
        uploadSession: {
          artifactUuid: "artifact-1",
          fileName: file.name,
          fileSize: file.size,
          hash: "stored-hash",
          lastModified: file.lastModified,
          longJobUuid: "job-1",
          offset: 1024,
          status: "UPLOADING",
          uploadUrl: "http://example.com/db-upload",
        },
      }),
    ).resolves.toBeUndefined();
  });

  it("prefers the upload-session offset facade when the selected hash matches the stored session hash", async () => {
    const file = createFile();
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "session-1"),
    });
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        longJobUuid: "job-1",
        hash: "stored-hash",
        offset: 3072,
        uploadUrl: "http://example.com/session-upload",
        artifactUuid: "image-session",
      }),
    }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      resolveUploadResumeCheck({
        config: {
          hashCheckPath: (hash: string) => `/api/uploadhashcheck/${hash}`,
          resumeStateKey: "fileResume",
          uploadUrlKey: "imageUploadUrl",
          uuidKey: "imageUuid",
        } as never,
        file,
        jobId: "job-1",
        selectedHash: "stored-hash",
        uploadSession: {
          artifactUuid: "artifact-1",
          fileName: file.name,
          fileSize: file.size,
          hash: "stored-hash",
          lastModified: file.lastModified,
          longJobUuid: "job-1",
          offset: 1024,
          status: "UPLOADING",
          uploadUrl: "http://example.com/db-upload",
        },
      }),
    ).resolves.toEqual({
      hash: "stored-hash",
      next: 3072,
      uploadUrl: "http://example.com/session-upload",
      uuid: "image-session",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/upload-sessions/job-1/offset",
      expect.any(Object),
    );
  });
});

describe("openUploadConfirmModal", () => {
  it("opens an antd confirm with localized labels", () => {
    const intl = createIntl({
      locale: "zh-CN",
      messages: {
        cancel: "取消",
        ok: "确定",
      },
    });
    const onOk = vi.fn();
    const onCancel = vi.fn();

    const handle = openUploadConfirmModal({
      intl,
      title: "镜像上传",
      content: "请重新选择文件",
      onCancel,
      onOk,
    });

    expect(antdMocks.confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        cancelText: "取消",
        closable: false,
        content: "请重新选择文件",
        icon: null,
        maskClosable: false,
        okText: "确定",
        title: "镜像上传",
        zIndex: 1110,
      }),
    );

    const config = antdMocks.confirm.mock.calls[0]?.[0] as
      | { onCancel?: () => void; onOk?: () => void }
      | undefined;
    expect(config).toBeDefined();
    config?.onOk?.();
    config?.onCancel?.();
    expect(onOk).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);

    handle?.destroy();
    expect(antdMocks.destroy).toHaveBeenCalledTimes(1);
  });

  it("hides the cancel button when the confirm is not cancelable", () => {
    const intl = createIntl({
      locale: "zh-CN",
      messages: {
        cancel: "取消",
        ok: "确定",
      },
    });

    openUploadConfirmModal({
      cancelable: false,
      intl,
      title: "确认要暂停上传操作？",
      content: "上传任务暂停时间最大为72小时，超时将导致任务失败。",
    });

    expect(antdMocks.confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        cancelButtonProps: { style: { display: "none" } },
      }),
    );
  });
});

describe("useResume goingOn", () => {
  const createTestOpenConfirmModal = () => {
    const openConfirmModal: OpenUploadConfirmModal = ({
      title,
      content,
      onOk,
      zIndex,
    }) => {
      const modal = document.createElement("div");
      modal.setAttribute("data-testid", "upload-confirm-modal");
      if (zIndex !== undefined) {
        modal.setAttribute("data-z-index", String(zIndex));
      }
      modal.textContent = `${title ?? ""}${content ?? ""}`;

      const okButton = document.createElement("button");
      okButton.setAttribute("data-testid", "upload-confirm-ok");
      okButton.type = "button";
      okButton.textContent = "确定";
      okButton.addEventListener("click", () => {
        onOk?.();
      });
      modal.appendChild(okButton);
      document.body.appendChild(modal);

      return {
        destroy: vi.fn(() => {
          modal.remove();
        }),
      };
    };

    return vi.fn(openConfirmModal);
  };

  const renderUseResume = () => {
    const intl = createIntl({
      locale: "zh-CN",
      messages: {},
    });
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(RawIntlProvider, { value: intl }, children);
    const openConfirmModal = createTestOpenConfirmModal();

    return renderHook(() => useResume({ openConfirmModal }), { wrapper });
  };

  const operationLog = {
    longjobs: [
      {
        jobName: "APIAddImageMsg",
        longJobUuid: "job-1",
      },
    ],
  };

  it("only destroys an in-memory VDDK upload when it is canceled", () => {
    const fileUpload = {
      destroy: vi.fn(),
      getRealUuid: vi.fn(() => "job-vddk"),
    };
    hookMocks.platformState.migrationServicePackageResume = {
      "job-vddk": fileUpload,
    };
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderUseResume();

    const controls = result.current({
      longjobs: [
        {
          jobName: "APIUploadSoftwarePackageToVmMsg",
          longJobUuid: "job-vddk",
        },
      ],
    } as never);

    act(() => {
      controls.pause();
      controls.goingOn();
      controls.del();
    });

    expect(antdMocks.confirm).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(fileUpload.destroy).toHaveBeenCalledTimes(1);
    expect(
      hookMocks.platformState.setMigrationServicePackageResume,
    ).toHaveBeenCalledWith({});
  });

  it("continues an in-memory upload from the BFF offset facade", async () => {
    const fileUpload = {
      getFileHash: vi.fn(async () => "hash-1"),
      resume: vi.fn(),
      setTargetUploadTime: vi.fn(),
    };
    hookMocks.platformState.fileResume = {
      "job-1": fileUpload,
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ longJobUuid: "job-1", offset: 4096 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ longJobUuid: "job-1", offset: 4096 }),
      });
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "session-1"),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderUseResume();

    act(() => {
      result.current(operationLog as never).goingOn();
    });

    await waitFor(() => {
      expect(fileUpload.resume).toHaveBeenCalledWith(4096);
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/upload-sessions/job-1/offset",
      expect.any(Object),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/resumelongjob/job-1",
      expect.any(Object),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "/api/upload-sessions/job-1",
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(fileUpload.setTargetUploadTime).toHaveBeenCalledWith(60);
  });

  it("falls back to hashcheck when the BFF offset facade is unavailable", async () => {
    const fileUpload = {
      getFileHash: vi.fn(async () => "hash-1"),
      resume: vi.fn(),
      setTargetUploadTime: vi.fn(),
    };
    hookMocks.platformState.fileResume = {
      "job-1": fileUpload,
    };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ longJobUuid: "job-1", offset: 8192 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ longJobUuid: "job-1", offset: 8192 }),
      });
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "session-1"),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderUseResume();

    act(() => {
      result.current(operationLog as never).goingOn();
    });

    await waitFor(() => {
      expect(fileUpload.resume).toHaveBeenCalledWith(8192);
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/upload-sessions/job-1/offset",
      expect.any(Object),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/uploadhashcheck/hash-1",
      expect.any(Object),
    );
  });

  it("selects the same local file after page refresh and creates a resumed FileUpload", async () => {
    const file = new File(["same-content"], "openEuler.raw", {
      lastModified: 1779857396248,
      type: "application/octet-stream",
    });
    hookMocks.simpleHash.mockResolvedValueOnce("stored-hash");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          artifactUuid: "image-session",
          hash: "stored-hash",
          longJobUuid: "job-1",
          offset: 3072,
          uploadUrl: "http://example.com/session-upload",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          longJobUuid: "job-1",
          status: "UPLOADING",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "session-1"),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderUseResume();

    act(() => {
      result
        .current({
          longjobs: [
            {
              jobName: "APIAddImageMsg",
              longJobUuid: "job-1",
            },
          ],
          uploadSession: {
            artifactUuid: "old-image",
            fileName: file.name,
            fileSize: file.size,
            hash: "stored-hash",
            lastModified: file.lastModified,
            longJobUuid: "job-1",
            offset: 1024,
            status: "RETRY_READY",
            uploadUrl: "http://example.com/old-upload",
          },
        } as never)
        .goingOn();
    });

    fireEvent.click(await screen.findByTestId("upload-confirm-ok"));
    const input = document.querySelector("#jobId-job-1") as HTMLInputElement;
    Object.defineProperty(input, "files", {
      configurable: true,
      value: [file],
    });
    fireEvent.input(input);

    await waitFor(() => {
      expect(hookMocks.FileUpload).toHaveBeenCalledTimes(1);
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/upload-sessions/job-1/offset",
      expect.any(Object),
    );
    expect(fetchMock).not.toHaveBeenCalledWith(
      "/api/resumelongjob/job-1",
      expect.any(Object),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/upload-sessions",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"status":"UPLOADING"'),
      }),
    );
    expect(hookMocks.FileUpload).toHaveBeenCalledWith(
      file,
      "http://example.com/session-upload",
      "job-1",
      "image-session",
      3072,
      "image",
      undefined,
      expect.objectContaining({ targetUploadTime: 60 }),
    );
    expect(hookMocks.fileUploadInstances[0].launch).toHaveBeenCalledTimes(1);
    expect(hookMocks.platformState.setFileResume).toHaveBeenCalledWith(
      expect.objectContaining({
        "job-1": hookMocks.fileUploadInstances[0],
        "stored-hash": hookMocks.fileUploadInstances[0],
      }),
    );
  });

  it("does not launch a resumed FileUpload when upload session registration fails", async () => {
    const file = new File(["same-content"], "openEuler.raw", {
      lastModified: 1779857396248,
      type: "application/octet-stream",
    });
    hookMocks.simpleHash.mockResolvedValueOnce("stored-hash");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          artifactUuid: "image-session",
          hash: "stored-hash",
          longJobUuid: "job-1",
          offset: 3072,
          uploadUrl: "http://example.com/session-upload",
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
      });
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "session-1"),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderUseResume();

    act(() => {
      result
        .current({
          longjobs: [
            {
              jobName: "APIAddImageMsg",
              longJobUuid: "job-1",
            },
          ],
          uploadSession: {
            artifactUuid: "old-image",
            fileName: file.name,
            fileSize: file.size,
            hash: "stored-hash",
            lastModified: file.lastModified,
            longJobUuid: "job-1",
            offset: 1024,
            status: "RETRY_READY",
            uploadUrl: "http://example.com/old-upload",
          },
        } as never)
        .goingOn();
    });

    fireEvent.click(await screen.findByTestId("upload-confirm-ok"));
    const input = document.querySelector("#jobId-job-1") as HTMLInputElement;
    Object.defineProperty(input, "files", {
      configurable: true,
      value: [file],
    });
    fireEvent.input(input);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/upload-sessions",
        expect.objectContaining({ method: "POST" }),
      );
    });

    expect(hookMocks.FileUpload).not.toHaveBeenCalled();
    expect(hookMocks.platformState.setFileResume).not.toHaveBeenCalled();
  });

  it("destroys an in-memory upload rebound to the current long job when canceling", () => {
    const fileUpload = {
      destroy: vi.fn(),
      getRealUuid: vi.fn(() => "new-job"),
    };
    hookMocks.platformState.fileResume = {
      "old-job": fileUpload,
      "hash-1": fileUpload,
    };
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "session-1"),
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ status: "CANCELED" }),
      })),
    );
    const { result } = renderUseResume();

    act(() => {
      result
        .current({
          longjobs: [
            {
              jobName: "APIAddImageMsg",
              longJobUuid: "new-job",
            },
          ],
        } as never)
        .del();
    });

    expect(fileUpload.destroy).toHaveBeenCalledTimes(1);
    expect(hookMocks.platformState.setFileResume).toHaveBeenCalledWith({});
  });
});
