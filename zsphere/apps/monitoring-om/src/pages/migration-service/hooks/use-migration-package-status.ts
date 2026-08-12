import { gql, useQuery } from "@apollo/client";
import { useAction } from "@zstack/zsphere-hooks";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";

import { isSuccessfulActionResult } from "../action-result";
import type { StepType, TaskStatus, MigrationPackageData } from "../types";

const GET_MIGRATION_PACKAGE = gql`
  query getMigrationServicePackage {
    getMigrationServicePackage {
      uuid
      name
      status
      type
      installPath
      version
      gatewayImageUuid
      linuxBootImageUuid
      windowsBootImageUuid
    }
  }
`;

const CLEAN_STORAGE_PACKAGE = gql`
  mutation cleanStoragePackage($input: CleanStoragePackageInput!) {
    cleanStoragePackage(input: $input) {
      actionId
    }
  }
`;

const POLL_INTERVAL = 3000;

/**
 * Keep polling at least this long after a user-initiated action (upload /
 * install / clean-storage), regardless of whether the server has yet
 * reported an in-progress state. Covers the URL-upload-completes-before-
 * first-poll case and any other "server skips Uploading/Installing and
 * jumps straight to terminal" path.
 */
const ACTION_POLL_GRACE_MS = 8000;

const isTaskInProgress = (status: TaskStatus): boolean =>
  status === "uploading" || status === "installing";

const getStepFromTaskStatus = (status: TaskStatus): StepType => {
  switch (status) {
    case "upload-ready":
    case "uploading":
    case "upload-failed":
      return "upload";
    case "install-ready":
    case "installing":
    case "install-failed":
      return "install";
    default:
      return "upload";
  }
};

const mapPackageStatusToTaskStatus = (status?: string | null): TaskStatus => {
  switch (status) {
    case "Uploading":
      return "uploading";
    case "UploadFailed":
      return "upload-failed";
    case "Uploaded":
      return "install-ready";
    case "Installing":
      return "installing";
    case "InstallFailed":
      return "install-failed";
    case "Installed":
    case "Running":
      return "completed";
    default:
      return "upload-ready";
  }
};

const INSTALLED_STATUSES = [
  "Installed",
  "Upgraded",
  "Upgrading",
  "UpgradePackageUploaded",
  "UpgradePackageUploadFailed",
  "UpgradeExecuteFailed",
];

export interface MigrationPackageStatusResult {
  currentStep: StepType;
  taskStatus: TaskStatus;
  resetStatus: (options?: {
    onFinish?: () => void;
    onFinally?: () => void;
  }) => Promise<void>;
  packageData: MigrationPackageData | undefined;
  getSoftwarePackage: () => void;
  startPolling: () => void;
  isServiceInstalled: boolean;
  /** True until the first network response (success or error) lands. */
  initialLoading: boolean;
}

/**
 * Polling hook for the migration-service installation page.
 *
 * Rewritten in response to ZSV-11478's third re-occurrence. The original
 * implementation used `useLazyQuery` + manual `setInterval`, with three
 * refs (`wasInProgressRef`, `actionTriggeredRef`, `statusAtPollingStartRef`)
 * tracking whether to auto-stop. Each prior fix added another ref; failure
 * modes grew quadratically with the surface area. The actual recurring
 * cause was `onCompleted` firing for every in-flight response in arrival
 * order — a slow earlier poll could land *after* a fast later poll and
 * overwrite the terminal state with stale data, regressing the UI from
 * Overview back to the install wizard.
 *
 * Design principles for this rewrite:
 *
 * 1. **Server response is the only source of truth.** `taskStatus`,
 *    `currentStep`, and `isServiceInstalled` are pure `useMemo` derivations
 *    of `data.getMigrationServicePackage.status`. No mirrored `useState`
 *    that can desync from data.
 *
 * 2. **Polling uses Apollo's built-in `startPolling` / `stopPolling`** on
 *    `useQuery`, gated by a derived `shouldPoll` flag. Apollo discards
 *    out-of-order responses internally (each refetch carries a request id;
 *    only the latest is applied), eliminating the stale-overwrite race.
 *
 * 3. **`shouldPoll = isInProgress(serverStatus) OR isActionWindowOpen`.**
 *    The action window opens for `ACTION_POLL_GRACE_MS` after a user
 *    action and is the ONLY signal we use for "the user just did
 *    something" — no `wasInProgressRef`, no baseline tracking, no
 *    closure capture of the at-action-start status.
 *
 * 4. **`previousData` keeps the last successful response visible during
 *    transient errors**, preventing the UI from flapping to "no package"
 *    when a single poll request fails.
 *
 * @see Jira ZSV-11478 — supersedes MR 3549 (lift to parent) + MR 4038
 *      (refs-based auto-stop patch).
 */
export const useMigrationPackageStatus = (): MigrationPackageStatusResult => {
  const intl = useIntl();
  const doAction = useAction();

  // ──────────── Action-window state ────────────
  // True for ACTION_POLL_GRACE_MS after the user triggers an action. While
  // open, polling is forced on regardless of current server status — this
  // is what makes the hook robust against fast-path completions where the
  // server skips the Uploading/Installing phase entirely.
  const [isActionWindowOpen, setIsActionWindowOpen] = useState(false);
  const actionTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (actionTimerRef.current !== null) {
        window.clearTimeout(actionTimerRef.current);
        actionTimerRef.current = null;
      }
    };
  }, []);

  // ──────────── First-response tracking ────────────
  // Suppresses install-wizard flicker on tab switch / route re-entry until
  // we know whether the package exists.
  const [hasResolvedOnce, setHasResolvedOnce] = useState(false);

  // ──────────── Server query ────────────
  const {
    data,
    previousData,
    refetch,
    startPolling: startApolloPolling,
    stopPolling: stopApolloPolling,
  } = useQuery(GET_MIGRATION_PACKAGE, {
    fetchPolicy: "no-cache",
    errorPolicy: "ignore",
    onCompleted: () => setHasResolvedOnce(true),
    onError: () => setHasResolvedOnce(true),
  });

  // Fall back to the last successful response during transient errors so
  // the UI does not regress to "no package" on a single failed poll.
  const packageData = useMemo<MigrationPackageData | undefined>(() => {
    const current = data?.getMigrationServicePackage as
      | MigrationPackageData
      | null
      | undefined;
    if (current !== undefined) return current ?? undefined;
    const prev = previousData?.getMigrationServicePackage as
      | MigrationPackageData
      | null
      | undefined;
    return prev ?? undefined;
  }, [data, previousData]);

  const taskStatus = useMemo<TaskStatus>(
    () => mapPackageStatusToTaskStatus(packageData?.status),
    [packageData?.status],
  );

  const currentStep = useMemo<StepType>(
    () => getStepFromTaskStatus(taskStatus),
    [taskStatus],
  );

  const isServiceInstalled = useMemo(
    () =>
      !!packageData?.status && INSTALLED_STATUSES.includes(packageData.status),
    [packageData?.status],
  );

  // ──────────── Poll control ────────────
  const shouldPoll = useMemo(
    () => isTaskInProgress(taskStatus) || isActionWindowOpen,
    [taskStatus, isActionWindowOpen],
  );

  useEffect(() => {
    if (shouldPoll) {
      startApolloPolling(POLL_INTERVAL);
      return () => {
        stopApolloPolling();
      };
    }
    return;
  }, [shouldPoll, startApolloPolling, stopApolloPolling]);

  // ──────────── Public API ────────────
  const getSoftwarePackage = useCallback(() => {
    refetch().catch(() => {
      /* errors are surfaced via Apollo state; no need to propagate */
    });
  }, [refetch]);

  const startPolling = useCallback(() => {
    if (actionTimerRef.current !== null) {
      window.clearTimeout(actionTimerRef.current);
    }
    setIsActionWindowOpen(true);
    actionTimerRef.current = window.setTimeout(() => {
      setIsActionWindowOpen(false);
      actionTimerRef.current = null;
    }, ACTION_POLL_GRACE_MS);
    // Immediate refetch so the user sees the first response without
    // waiting for the next scheduled poll tick.
    refetch().catch(() => {
      /* same as above */
    });
  }, [refetch]);

  const resetStatus = useCallback(
    async (options?: { onFinish?: () => void; onFinally?: () => void }) => {
      const uuid = packageData?.uuid;
      const { onFinish, onFinally } = options || {};
      if (!uuid) return;

      try {
        startPolling();
        await doAction({
          mutation: CLEAN_STORAGE_PACKAGE,
          payload: {
            uuid,
            cleanStorageMode: !["upload-failed", "install-ready"].includes(
              taskStatus,
            ),
          },
          name: intl.formatMessage({
            id: "clear.storage.installation.package",
            defaultMessage: "Clear Installation Package",
          }),
          total: 1,
          type: "MigrationService",
          forceRunCallback: true,
          onFinish: (result) => {
            getSoftwarePackage();
            if (isSuccessfulActionResult(result)) {
              onFinish?.();
            } else {
              onFinally?.();
            }
          },
        });
      } catch {
        onFinally?.();
      }
    },
    [
      intl,
      doAction,
      getSoftwarePackage,
      startPolling,
      taskStatus,
      packageData?.uuid,
    ],
  );

  return {
    currentStep,
    taskStatus,
    resetStatus,
    packageData,
    getSoftwarePackage,
    startPolling,
    isServiceInstalled,
    initialLoading: !hasResolvedOnce,
  };
};
