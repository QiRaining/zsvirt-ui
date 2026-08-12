import { fireEvent, render, screen } from "@testing-library/react";
import { OperationLongjobStatus } from "@zstack/zsphere-types";
import type { OperationLog } from "@zstack/zsphere-types/graphql";
import React from "react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

const resumeMocks = vi.hoisted(() => ({
  del: vi.fn(),
  getFile: vi.fn(),
  goingOn: vi.fn(),
  pause: vi.fn(),
}));

vi.mock("@zstack/design", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  Tooltip: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@zstack/icon", () => ({
  Icon: () => null,
}));

vi.mock("@zstack/zsphere-hooks", () => ({
  useAction: () => vi.fn(),
}));

vi.mock("../../action/upload-action-guards", () => ({
  isUploadAutoRetryingStatus: () => false,
  UPLOAD_AUTO_RETRY_STATUSES: [],
}));

vi.mock("../../action/validators", () => ({
  getAllLongjobs: (operationLog: OperationLog) => operationLog.longjobs,
}));

vi.mock("../../upload-session-context", () => ({
  useOperationLogUploadSessions: () => ({
    getUploadSession: () => undefined,
    refreshUploadSessions: vi.fn(),
  }),
}));

vi.mock("../../use-zsv-resume", () => ({
  useZsvResume: () => () => resumeMocks,
}));

import { ResumeButton } from "./resume-button";

const operationLog = {
  longjobs: [
    {
      data: JSON.stringify({ url: "upload://VMware-vix-disklib.tar.gz" }),
      jobName: "APIUploadSoftwarePackageToVmMsg",
      longJobUuid: "vddk-job-1",
    },
  ],
} as OperationLog;

const renderButton = (longJobState: OperationLongjobStatus) =>
  render(
    <IntlProvider locale="en-US">
      <ResumeButton
        complete={false}
        longJobState={longJobState}
        operationLog={operationLog}
        setLongJobState={vi.fn()}
      />
    </IntlProvider>,
  );

describe("ResumeButton VDDK upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps cancel available without offering pause or continue after the local file is lost", () => {
    resumeMocks.getFile.mockReturnValue(undefined);

    renderButton(OperationLongjobStatus.RUNNING);

    expect(screen.getByText("Cancel")).toBeTruthy();
    expect(screen.queryByText("Pause")).toBeNull();
    expect(screen.queryByText("Continue")).toBeNull();
    expect(screen.queryByText("Select File to Continue")).toBeNull();
  });

  it("offers cancel but not pause while the VDDK FileUpload remains in memory", () => {
    resumeMocks.getFile.mockReturnValue({ pause: vi.fn() });

    renderButton(OperationLongjobStatus.RUNNING);
    fireEvent.click(screen.getByText("Cancel"));

    expect(screen.queryByText("Pause")).toBeNull();
    expect(resumeMocks.pause).not.toHaveBeenCalled();
  });
});
