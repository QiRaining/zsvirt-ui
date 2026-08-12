// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { createIntl, RawIntlProvider } from "react-intl";
import { afterEach, describe, expect, it, vi } from "vitest";

interface TestUpdateQueryState {
  called: boolean;
  data?: {
    checkTelemetryUpdate: {
      version?: string | null;
      currentVersion?: string | null;
      releaseNotesEn?: string | null;
      releaseNotesZh?: string | null;
    };
  };
  loading: boolean;
  error: Error | null;
}

const queryMocks = vi.hoisted(() => {
  const getDefaultUpdateQueryState = (): TestUpdateQueryState => ({
    called: true,
    data: {
      checkTelemetryUpdate: {
        version: "5.2.0",
        currentVersion: "5.1.0",
        releaseNotesEn: "Release note from API",
        releaseNotesZh: "来自接口的版本更新内容",
      },
    },
    loading: false,
    error: null,
  });

  const mocks = {
    isSystemAdmin: true,
    sessionId: undefined as string | undefined,
    checkUpdate: vi.fn(),
    getDefaultUpdateQueryState,
    queryState: getDefaultUpdateQueryState(),
  };

  mocks.checkUpdate.mockImplementation(() =>
    Promise.resolve({
      data: mocks.queryState.data,
    }),
  );

  return mocks;
});

interface MockButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: string;
}

vi.mock("@apollo/client", () => ({
  gql: (strings: TemplateStringsArray) => strings.join(""),
  useLazyQuery: () => [queryMocks.checkUpdate, queryMocks.queryState],
}));

vi.mock("@zstack/design", () => ({
  Alert: ({
    children,
    className: _className,
    variant,
  }: {
    children: ReactNode;
    className?: string;
    variant?: string;
  }) => <div data-alert-variant={variant}>{children}</div>,
  Button: ({
    children,
    loading: _loading,
    variant: _variant,
    ...props
  }: MockButtonProps) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@zstack/icon", () => ({
  Icon: ({
    type,
    ...props
  }: { type: string } & HTMLAttributes<HTMLElement>) => (
    <span data-icon={type} {...props} />
  ),
}));

vi.mock("@zstack/zsphere-design-biz", () => ({
  DialogBase: ({
    children,
    footer,
    setVisible,
    title,
    visible,
  }: {
    children: ReactNode;
    footer: ReactNode;
    setVisible: (visible: boolean) => void;
    title: ReactNode;
    visible: boolean;
  }) =>
    visible ? (
      <div role="dialog" aria-label={String(title)}>
        <button type="button" onClick={() => setVisible(false)}>
          shell close
        </button>
        {children}
        {footer}
      </div>
    ) : null,
  Spinner: () => <div>loading</div>,
}));

vi.mock("./hooks/use-user-identity", () => ({
  useUserIdentity: () => ({
    isSystemAdmin: queryMocks.isSystemAdmin,
    sessionId: queryMocks.sessionId,
  }),
}));

import UpdateCheck from "./update-check";

const renderUpdateCheck = () => {
  const intl = createIntl({ locale: "en-US", messages: {} });

  return render(
    <RawIntlProvider value={intl}>
      <UpdateCheck />
    </RawIntlProvider>,
  );
};

afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
  vi.clearAllMocks();
  queryMocks.isSystemAdmin = true;
  queryMocks.sessionId = undefined;
  queryMocks.queryState = queryMocks.getDefaultUpdateQueryState();
  queryMocks.checkUpdate.mockReset();
  queryMocks.checkUpdate.mockImplementation(() =>
    Promise.resolve({
      data: queryMocks.queryState.data,
    }),
  );
});

describe("UpdateCheck", () => {
  it("silently checks once after login and does nothing when the current version is latest", async () => {
    queryMocks.sessionId = "session-latest";
    queryMocks.queryState = {
      called: true,
      data: {
        checkTelemetryUpdate: {
          version: "5.2.0",
          currentVersion: "5.2.0",
          releaseNotesEn: null,
          releaseNotesZh: null,
        },
      },
      loading: false,
      error: null,
    };

    renderUpdateCheck();

    await waitFor(() =>
      expect(queryMocks.checkUpdate).toHaveBeenCalledTimes(1),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("does not automatically check again after refreshing within the same login session", async () => {
    queryMocks.sessionId = "session-refresh";

    renderUpdateCheck();

    expect(
      await screen.findByRole("dialog", { name: "Check for Updates" }),
    ).toBeTruthy();
    expect(queryMocks.checkUpdate).toHaveBeenCalledTimes(1);

    cleanup();
    queryMocks.checkUpdate.mockClear();

    renderUpdateCheck();

    await new Promise((resolve) => window.setTimeout(resolve, 0));
    expect(queryMocks.checkUpdate).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("silently retries the automatic check once and opens release notes when retry finds a new version", async () => {
    queryMocks.sessionId = "session-new-after-retry";
    queryMocks.queryState = {
      called: false,
      data: undefined,
      loading: false,
      error: null,
    };
    queryMocks.checkUpdate
      .mockRejectedValueOnce(new Error("temporary unreachable"))
      .mockResolvedValueOnce({
        data: {
          checkTelemetryUpdate: {
            version: "5.2.0",
            currentVersion: "5.1.0",
            releaseNotesEn: "Release note from API",
            releaseNotesZh: "来自接口的版本更新内容",
          },
        },
      });

    renderUpdateCheck();

    expect(
      await screen.findByRole("dialog", { name: "Check for Updates" }),
    ).toBeTruthy();
    expect(queryMocks.checkUpdate).toHaveBeenCalledTimes(2);
    expect(screen.getByText("Release Notes")).toBeTruthy();
    expect(screen.getByText("Release note from API")).toBeTruthy();
  });

  it("automatically opens release notes after a non-system-admin login when a new version exists", async () => {
    queryMocks.isSystemAdmin = false;
    queryMocks.sessionId = "normal-user-session";
    queryMocks.queryState = {
      called: false,
      data: undefined,
      loading: false,
      error: null,
    };
    queryMocks.checkUpdate.mockResolvedValueOnce({
      data: {
        checkTelemetryUpdate: {
          version: "5.2.0",
          currentVersion: "5.1.0",
          releaseNotesEn: "Release note from API",
          releaseNotesZh: "来自接口的版本更新内容",
        },
      },
    });

    renderUpdateCheck();

    expect(
      await screen.findByRole("dialog", { name: "Check for Updates" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: "Check for Updates" }),
    ).toBeNull();
    expect(screen.getByText("Release note from API")).toBeTruthy();
  });

  it("silently ignores the automatic check after one retry failure", async () => {
    queryMocks.sessionId = "session-failed";
    queryMocks.queryState = {
      called: false,
      data: undefined,
      loading: false,
      error: null,
    };
    queryMocks.checkUpdate
      .mockRejectedValueOnce(new Error("first failure"))
      .mockRejectedValueOnce(new Error("second failure"));

    renderUpdateCheck();

    await waitFor(() =>
      expect(queryMocks.checkUpdate).toHaveBeenCalledTimes(2),
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(
      screen.queryByText("Update check failed. Try again later."),
    ).toBeNull();
  });

  it("opens a confirmation dialog before loading update information", () => {
    queryMocks.queryState = {
      called: false,
      data: undefined,
      loading: false,
      error: null,
    };

    renderUpdateCheck();

    fireEvent.click(screen.getByRole("button", { name: "Check for Updates" }));

    expect(queryMocks.checkUpdate).not.toHaveBeenCalled();
    expect(
      screen.getByRole("dialog", { name: "Check for Updates" }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "The system will compare the current cluster version with the official latest version. Update checks only report anonymized version and device identifiers, and do not include hostnames, IP addresses, or business data.",
      ),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Confirm and Check for Updates" }),
    ).toBeTruthy();
  });

  it("loads update information after confirmation", async () => {
    renderUpdateCheck();

    fireEvent.click(screen.getByRole("button", { name: "Check for Updates" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Confirm and Check for Updates" }),
    );

    await waitFor(() =>
      expect(queryMocks.checkUpdate).toHaveBeenCalledTimes(1),
    );
    expect(screen.getByText("v5.1.0")).toBeTruthy();
    expect(screen.getByText("v5.2.0")).toBeTruthy();
    expect(screen.getByText("Release Notes")).toBeTruthy();
    expect(screen.getByText("Release note from API")).toBeTruthy();
  });

  it("shows the current-latest state when the backend returns the same version", async () => {
    queryMocks.queryState = {
      called: true,
      data: {
        checkTelemetryUpdate: {
          version: "5.2.0",
          currentVersion: "5.2.0",
          releaseNotesEn: null,
          releaseNotesZh: null,
        },
      },
      loading: false,
      error: null,
    };

    renderUpdateCheck();

    fireEvent.click(screen.getByRole("button", { name: "Check for Updates" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Confirm and Check for Updates" }),
    );

    await waitFor(() =>
      expect(
        screen.getByText("The current version is already the latest version."),
      ).toBeTruthy(),
    );
    expect(
      screen
        .getByText("The current version is already the latest version.")
        .closest('[data-alert-variant="positive"]'),
    ).toBeTruthy();
    const currentVersionLabel = screen.getByText("Current Version:");
    const latestAlert = screen.getByText(
      "The current version is already the latest version.",
    );

    expect(currentVersionLabel).toBeTruthy();
    expect(
      currentVersionLabel.compareDocumentPosition(latestAlert) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getAllByText("v5.2.0")).toHaveLength(1);
    expect(screen.queryByText("Latest Version")).toBeNull();
  });

  it("shows the failure state when the backend update check fails", async () => {
    queryMocks.queryState = {
      called: true,
      data: undefined,
      loading: false,
      error: new Error("Telemetry Cloud is unreachable"),
    };

    renderUpdateCheck();

    fireEvent.click(screen.getByRole("button", { name: "Check for Updates" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Confirm and Check for Updates" }),
    );

    const errorAlertText = await screen.findByText(
      "Update check failed. Try again later.",
    );
    const currentVersionLabel = screen.getByText("Current Version:");

    expect(currentVersionLabel).toBeTruthy();
    expect(screen.getByText("--")).toBeTruthy();
    expect(
      currentVersionLabel.compareDocumentPosition(errorAlertText) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      screen.getByText(
        "Unable to connect to the update server. Check the network and try again.",
      ),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Try Again" })).toBeTruthy();
    expect(screen.queryByText("v5.2.0")).toBeNull();
  });

  it("does not render for non-system-admin users", () => {
    queryMocks.isSystemAdmin = false;

    renderUpdateCheck();

    expect(
      screen.queryByRole("button", { name: "Check for Updates" }),
    ).toBeNull();
  });
});
