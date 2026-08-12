import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CancelLongJob from "./cancel-long-job";

const doAction = vi.fn();

vi.mock("@zstack/zsphere-hooks", () => ({
  useAction: () => doAction,
  useResume: () => vi.fn(() => ({ del: vi.fn() })),
}));

vi.mock("@zstack/zsphere-design-biz", () => ({
  DialogP1: ({ onConfirm }: { onConfirm: () => void }) => (
    <button data-testid="confirm-cancel" type="button" onClick={onConfirm}>
      confirm
    </button>
  ),
}));

const createOperationLog = () =>
  ({
    name: "openEuler",
    longjobs: [
      {
        data: JSON.stringify({ url: "upload://openEuler.raw" }),
        jobName: "APIAddImageMsg",
        longJobUuid: "job-1",
        state: "Running",
      },
    ],
  }) as never;

const createUpgradeOperationLog = () =>
  ({
    name: "ZMigrate-10.1.122.10.tar.gz",
    longjobs: [
      {
        data: JSON.stringify({
          url: "upload://ZMigrate-10.1.122.10.tar.gz",
        }),
        jobName: "APIUploadAndExecuteSoftwareUpgradePackageMsg",
        longJobUuid: "upgrade-job-1",
        state: "Running",
      },
    ],
  }) as never;

const renderCancelLongJob = (
  onBeforeCancelLongJobs = vi.fn(),
  selectedList = [createOperationLog()],
) =>
  render(
    <IntlProvider locale="zh-CN">
      <CancelLongJob
        visible
        selectedList={selectedList}
        setSelectedList={vi.fn()}
        setVisible={vi.fn()}
        onVisibleChange={vi.fn()}
        onBeforeCancelLongJobs={onBeforeCancelLongJobs}
      />
    </IntlProvider>,
  );

describe("CancelLongJob", () => {
  beforeEach(() => {
    doAction.mockClear();
  });

  it("delegates local upload cleanup to the cancel action callback before cancelling long jobs", () => {
    const onBeforeCancelLongJobs = vi.fn();

    renderCancelLongJob(onBeforeCancelLongJobs);

    fireEvent.click(screen.getByTestId("confirm-cancel"));

    expect(onBeforeCancelLongJobs).toHaveBeenCalledWith([
      expect.objectContaining({
        name: "openEuler",
        uuid: "job-1",
        longjobs: [
          expect.objectContaining({
            jobName: "APIAddImageMsg",
            longJobUuid: "job-1",
          }),
        ],
      }),
    ]);
    expect(doAction).toHaveBeenCalledTimes(1);
  });

  it("allows cancelling local migration service upgrade upload long jobs", () => {
    const onBeforeCancelLongJobs = vi.fn();

    renderCancelLongJob(onBeforeCancelLongJobs, [createUpgradeOperationLog()]);

    fireEvent.click(screen.getByTestId("confirm-cancel"));

    expect(onBeforeCancelLongJobs).toHaveBeenCalledWith([
      expect.objectContaining({
        name: "ZMigrate-10.1.122.10.tar.gz",
        uuid: "upgrade-job-1",
        longjobs: [
          expect.objectContaining({
            jobName: "APIUploadAndExecuteSoftwareUpgradePackageMsg",
            longJobUuid: "upgrade-job-1",
          }),
        ],
      }),
    ]);
    expect(doAction).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: [{ uuid: "upgrade-job-1" }],
        total: 1,
        type: "OperationLongjob",
      }),
    );
  });
});
