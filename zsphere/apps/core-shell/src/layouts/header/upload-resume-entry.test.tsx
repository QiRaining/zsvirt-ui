// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { createIntl, RawIntlProvider } from "react-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

const hookMocks = vi.hoisted(() => ({
  goingOn: vi.fn(),
  refreshUploadSessions: vi.fn(),
  removeUploadSession: vi.fn(),
  resumeWithOperationLog: vi.fn(),
  sessions: [
    {
      fileName: "openEuler.raw",
      fileSize: 100,
      hash: "hash-1",
      lastModified: 1,
      lastOpDate: "2026-05-27T10:00:00.000Z",
      longJobUuid: "job-1",
      offset: 25,
      resumable: true,
      status: "WAITING_FOR_FILE",
      uploadType: "image",
    },
  ],
}));

vi.mock("@zstack/design", () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  InfoPopover: ({
    content,
    trigger,
  }: {
    content: React.ReactNode;
    trigger: React.ReactNode;
  }) => (
    <div>
      {trigger}
      {content}
    </div>
  ),
}));

vi.mock("@zstack/icon", () => ({
  IconCloudUpload: () => <span data-testid="upload-icon" />,
}));

vi.mock("@zstack/utils", () => ({
  cn: (...classes: Array<string | false | undefined>) =>
    classes.filter(Boolean).join(" "),
}));

vi.mock("@zstack/zsphere-hooks", () => ({
  useResume: () => (operationLog: unknown) => {
    hookMocks.resumeWithOperationLog(operationLog);
    return {
      goingOn: hookMocks.goingOn,
    };
  },
  useResumableUploadSessions: () => ({
    refreshUploadSessions: hookMocks.refreshUploadSessions,
    removeUploadSession: hookMocks.removeUploadSession,
    sessions: hookMocks.sessions,
  }),
}));

vi.mock("@zstack/zsphere-utils", () => ({
  formatBytesToSize: (value: number) => `${value} B`,
}));

vi.mock("react-router", () => ({
  useNavigate: () => vi.fn(),
}));

import UploadResumeEntry from "./upload-resume-entry";

const renderUploadResumeEntry = () => {
  const intl = createIntl({ locale: "zh-CN", messages: {} });

  return render(
    <RawIntlProvider value={intl}>
      <UploadResumeEntry />
    </RawIntlProvider>,
  );
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("UploadResumeEntry", () => {
  it("refreshes resumable sessions after choosing to continue without removing the session eagerly", () => {
    renderUploadResumeEntry();

    fireEvent.click(screen.getByText("选择文件继续"));

    expect(hookMocks.goingOn).toHaveBeenCalledTimes(1);
    expect(hookMocks.refreshUploadSessions).toHaveBeenCalledTimes(1);
    expect(hookMocks.removeUploadSession).not.toHaveBeenCalled();
  });

  it("continues a page-refresh upload session through a synthetic operation log", () => {
    renderUploadResumeEntry();

    fireEvent.click(screen.getByText("选择文件继续"));

    expect(hookMocks.resumeWithOperationLog).toHaveBeenCalledWith(
      expect.objectContaining({
        actionId: "job-1",
        name: "openEuler.raw",
        uploadSession: expect.objectContaining({
          hash: "hash-1",
          longJobUuid: "job-1",
          status: "WAITING_FOR_FILE",
        }),
        longjobs: [
          expect.objectContaining({
            jobName: "APIAddImageMsg",
            longJobUuid: "job-1",
          }),
        ],
      }),
    );
    expect(hookMocks.goingOn).toHaveBeenCalledTimes(1);
  });
});
