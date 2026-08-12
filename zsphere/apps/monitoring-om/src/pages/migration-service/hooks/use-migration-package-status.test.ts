import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const hookMocks = vi.hoisted(() => ({
  doAction: vi.fn(
    (_options?: {
      onFinish?: (result: {
        total: number;
        success: number;
        fail: number;
        exception: number;
      }) => void;
    }) => Promise.resolve(),
  ),
  refetch: vi.fn(() => Promise.resolve()),
  startPolling: vi.fn(),
  stopPolling: vi.fn(),
}));

vi.mock("@apollo/client", () => ({
  gql: (strings: TemplateStringsArray) => strings.join(""),
  useQuery: () => ({
    data: {
      getMigrationServicePackage: {
        uuid: "package-1",
        status: "Uploaded",
      },
    },
    previousData: undefined,
    refetch: hookMocks.refetch,
    startPolling: hookMocks.startPolling,
    stopPolling: hookMocks.stopPolling,
  }),
}));

vi.mock("@zstack/zsphere-hooks", () => ({
  useAction: () => hookMocks.doAction,
}));

vi.mock("react-intl", () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage: string }) =>
      defaultMessage,
  }),
}));

import { useMigrationPackageStatus } from "./use-migration-package-status";

describe("useMigrationPackageStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hookMocks.doAction.mockResolvedValue(undefined);
  });

  it("submits cleanup as a MigrationService action", async () => {
    const { result } = renderHook(() => useMigrationPackageStatus());

    await act(async () => {
      await result.current.resetStatus();
    });

    expect(hookMocks.doAction).toHaveBeenCalledWith(
      expect.objectContaining({
        mutation: expect.stringContaining("mutation cleanStoragePackage"),
        payload: {
          uuid: "package-1",
          cleanStorageMode: false,
        },
        type: "MigrationService",
      }),
    );
  });

  it("continues re-upload only after fully successful cleanup", async () => {
    const continueReupload = vi.fn();
    hookMocks.doAction.mockImplementationOnce(async (options) => {
      options?.onFinish?.({ total: 1, success: 1, fail: 0, exception: 0 });
    });
    const { result } = renderHook(() => useMigrationPackageStatus());

    await act(async () => {
      await result.current.resetStatus({ onFinish: continueReupload });
    });

    expect(continueReupload).toHaveBeenCalledTimes(1);
  });

  it.each([
    { total: 1, success: 0, fail: 1, exception: 0 },
    { total: 1, success: 0, fail: 0, exception: 1 },
    { total: 2, success: 1, fail: 0, exception: 0 },
  ])("does not continue re-upload after invalid cleanup %#", async (completion) => {
    const continueReupload = vi.fn();
    hookMocks.doAction.mockImplementationOnce(async (options) => {
      options?.onFinish?.(completion);
    });
    const { result } = renderHook(() => useMigrationPackageStatus());

    await act(async () => {
      await result.current.resetStatus({ onFinish: continueReupload });
    });

    expect(continueReupload).not.toHaveBeenCalled();
  });
});
