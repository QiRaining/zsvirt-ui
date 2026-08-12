import { fireEvent, render, screen } from "@testing-library/react";
import type { OperationLog } from "@zstack/zsphere-types/graphql";
import React from "react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

const doAction = vi.fn();
const del = vi.fn();
const goingOn = vi.fn();
let actionKeyToRender = "cancel";
const getUploadControl = vi.fn(() => ({ del, goingOn }));

vi.mock("@zstack/zsphere-components", () => ({
  Action: ({
    menuList,
    selectedList,
    setSelectedList,
  }: {
    menuList: Array<{
      key: string;
      ActionWrapper: React.ComponentType<Record<string, unknown>>;
    }>;
    selectedList: OperationLog[];
    setSelectedList?: (selectedList: OperationLog[]) => void;
  }) => {
    const CancelAction = menuList.find(
      (item) => item.key === actionKeyToRender,
    )?.ActionWrapper;
    return CancelAction ? (
      <CancelAction
        visible
        selectedList={selectedList}
        setSelectedList={setSelectedList}
        setVisible={vi.fn()}
      />
    ) : null;
  },
}));

vi.mock("@zstack/zsphere-hooks", () => ({
  useAction: () => doAction,
  useResume: () => getUploadControl,
}));

vi.mock("@zstack/zsphere-design-biz", () => ({
  DialogP1: ({ onConfirm }: { onConfirm: () => void }) => (
    <button data-testid="confirm-cancel" type="button" onClick={onConfirm}>
      confirm
    </button>
  ),
  DialogP3: ({ onConfirm }: { onConfirm: () => void }) => (
    <button data-testid="confirm-going-on" type="button" onClick={onConfirm}>
      confirm
    </button>
  ),
}));

import OperationLongjobAction from ".";

const createUploadOperationLog = () =>
  ({
    name: "openEuler.raw",
    longjobs: [
      {
        data: JSON.stringify({ url: "upload://openEuler.raw" }),
        jobName: "APIAddImageMsg",
        longJobUuid: "job-1",
        state: "Running",
      },
    ],
  }) as never;

const createSuspendedUpgradeOperationLog = () =>
  ({
    name: "ZMigrate-10.1.122.10.tar.gz",
    longjobs: [
      {
        data: JSON.stringify({
          url: "upload://ZMigrate-10.1.122.10.tar.gz",
        }),
        jobName: "APIUploadAndExecuteSoftwareUpgradePackageMsg",
        longJobUuid: "upgrade-job-1",
        state: "Suspended",
      },
    ],
  }) as never;

describe("OperationLongjobAction", () => {
  beforeEach(() => {
    actionKeyToRender = "cancel";
    doAction.mockClear();
    del.mockClear();
    goingOn.mockClear();
    getUploadControl.mockClear();
  });

  it("destroys the local upload queue when the cancel action is confirmed", () => {
    render(
      <IntlProvider locale="zh-CN">
        <OperationLongjobAction
          view="main"
          position="row"
          selectedList={[createUploadOperationLog()]}
          setSelectedList={vi.fn()}
          refetch={vi.fn()}
          onVisibleChange={vi.fn()}
        />
      </IntlProvider>,
    );

    fireEvent.click(screen.getByTestId("confirm-cancel"));

    expect(getUploadControl).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "openEuler.raw",
        uuid: "job-1",
      }),
    );
    expect(del).toHaveBeenCalledTimes(1);
    expect(doAction).toHaveBeenCalledTimes(1);
  });

  it("continues a paused local migration service upgrade upload", () => {
    actionKeyToRender = "goingOn";

    render(
      <IntlProvider locale="zh-CN">
        <OperationLongjobAction
          view="main"
          position="row"
          selectedList={[createSuspendedUpgradeOperationLog()]}
          setSelectedList={vi.fn()}
          refetch={vi.fn()}
          onVisibleChange={vi.fn()}
        />
      </IntlProvider>,
    );

    fireEvent.click(screen.getByTestId("confirm-going-on"));

    expect(getUploadControl).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "ZMigrate-10.1.122.10.tar.gz",
        uuid: "upgrade-job-1",
      }),
    );
    expect(goingOn).toHaveBeenCalledTimes(1);
  });
});
