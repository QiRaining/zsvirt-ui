import { gql, useLazyQuery } from "@apollo/client";
import { Alert, Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { DialogBase, Spinner } from "@zstack/zsphere-design-biz";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";

import { useUserIdentity } from "./hooks/use-user-identity";

import style from "./update-check.module.less";

const CHECK_TELEMETRY_UPDATE = gql`
  query CheckTelemetryUpdateForUpdateCheck {
    checkTelemetryUpdate {
      version
      currentVersion
      releaseNotesZh
      releaseNotesEn
    }
  }
`;

const UNKNOWN_VERSION = "--";

type DialogPhase = "confirm" | "checking" | "result";

interface TelemetryUpdateInventory {
  version?: string | null;
  currentVersion?: string | null;
  releaseNotesZh?: string | null;
  releaseNotesEn?: string | null;
}

interface TelemetryUpdateQueryData {
  checkTelemetryUpdate?: TelemetryUpdateInventory | null;
}

const AUTO_CHECKED_SESSION_ID_KEY =
  "zsphere.telemetry.update.autoCheckedSessionId";

const isAutoCheckedSession = (sessionId: string) => {
  try {
    return (
      window.sessionStorage.getItem(AUTO_CHECKED_SESSION_ID_KEY) === sessionId
    );
  } catch {
    return false;
  }
};

const markAutoCheckedSession = (sessionId: string) => {
  try {
    window.sessionStorage.setItem(AUTO_CHECKED_SESSION_ID_KEY, sessionId);
  } catch {
    // Ignore unavailable sessionStorage; the in-memory guard still prevents duplicate checks.
  }
};

const getUpdateInfoFromResult = (result?: {
  data?: TelemetryUpdateQueryData | null;
}) => result?.data?.checkTelemetryUpdate ?? undefined;

const normalizeVersion = (version?: string | null) => {
  const trimmed = version?.trim();

  if (!trimmed) {
    return UNKNOWN_VERSION;
  }

  return trimmed.startsWith("v") ? trimmed : `v${trimmed}`;
};

const getVersionParts = (version?: string | null) =>
  version
    ?.replace(/^v/i, "")
    .split(".")
    .map((part) => Number.parseInt(part, 10))
    .filter((part) => Number.isFinite(part)) ?? [];

const isNewerVersion = (
  latestVersion?: string | null,
  currentVersion?: string | null,
) => {
  const latestParts = getVersionParts(latestVersion);
  const currentParts = getVersionParts(currentVersion);

  if (!latestParts.length || !currentParts.length) {
    return true;
  }

  const length = Math.max(latestParts.length, currentParts.length);

  for (let index = 0; index < length; index += 1) {
    const latestPart = latestParts[index] ?? 0;
    const currentPart = currentParts[index] ?? 0;

    if (latestPart > currentPart) {
      return true;
    }

    if (latestPart < currentPart) {
      return false;
    }
  }

  return false;
};

const splitReleaseNotes = (releaseNotes?: string | null) =>
  releaseNotes
    ?.split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean) ?? [];

const UpdateCheck = () => {
  const intl = useIntl();
  const { isSystemAdmin, sessionId } = useUserIdentity();
  const [visible, setVisible] = useState(false);
  const [dialogPhase, setDialogPhase] = useState<DialogPhase>("confirm");
  const [checkFailed, setCheckFailed] = useState(false);
  const [checkedUpdateInfo, setCheckedUpdateInfo] =
    useState<TelemetryUpdateInventory>();
  const autoCheckedSessionRef = useRef<string | null>(null);
  const [checkUpdate, updateQuery] = useLazyQuery<{
    checkTelemetryUpdate: TelemetryUpdateInventory;
  }>(CHECK_TELEMETRY_UPDATE, {
    fetchPolicy: "network-only",
  });
  const updateInfo =
    checkedUpdateInfo ?? updateQuery.data?.checkTelemetryUpdate;
  const currentVersion = updateInfo?.currentVersion;
  const latestVersion = updateInfo?.version;
  const releaseNotes = intl.locale.toLowerCase().startsWith("zh")
    ? updateInfo?.releaseNotesZh
    : updateInfo?.releaseNotesEn;
  const releaseNoteItems = useMemo(
    () => splitReleaseNotes(releaseNotes),
    [releaseNotes],
  );
  const currentVersionLabel = normalizeVersion(currentVersion);
  const latestVersionLabel = normalizeVersion(latestVersion);
  const isChecking = dialogPhase === "checking" || updateQuery.loading;
  const showResult = dialogPhase === "result";
  const hasNewVersion = useMemo(
    () => isNewerVersion(latestVersion, currentVersion),
    [currentVersion, latestVersion],
  );
  const hasUpdateInfo = Boolean(updateInfo);
  const hasCheckError =
    showResult &&
    !isChecking &&
    (checkFailed || (Boolean(updateQuery.called) && !hasUpdateInfo));
  const widthClassName =
    showResult && hasUpdateInfo && hasNewVersion ? "w-150" : "w-[520px]";

  const checkOnce = useCallback(async () => {
    const result = await checkUpdate();
    const nextUpdateInfo = getUpdateInfoFromResult(result);

    if (!nextUpdateInfo) {
      throw new Error("Telemetry update response is empty");
    }

    return nextUpdateInfo;
  }, [checkUpdate]);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    if (
      autoCheckedSessionRef.current === sessionId ||
      isAutoCheckedSession(sessionId)
    ) {
      return;
    }

    autoCheckedSessionRef.current = sessionId;
    markAutoCheckedSession(sessionId);
    let canceled = false;

    const checkWithOneRetry = async () => {
      try {
        return await checkOnce();
      } catch {
        return checkOnce();
      }
    };

    void checkWithOneRetry()
      .then((nextUpdateInfo) => {
        if (canceled) {
          return;
        }

        setCheckedUpdateInfo(nextUpdateInfo);
        setCheckFailed(false);

        if (
          isNewerVersion(nextUpdateInfo.version, nextUpdateInfo.currentVersion)
        ) {
          setDialogPhase("result");
          setVisible(true);
        }
      })
      .catch(() => {
        // Auto check is intentionally silent after one retry.
      });

    return () => {
      canceled = true;
    };
  }, [checkOnce, sessionId]);

  if (!isSystemAdmin && !visible) {
    return null;
  }

  const queryVersion = () => {
    setCheckFailed(false);
    setDialogPhase("checking");
    void checkOnce()
      .then((nextUpdateInfo) => {
        setCheckedUpdateInfo(nextUpdateInfo);
      })
      .catch(() => {
        setCheckFailed(true);
      })
      .finally(() => {
        setDialogPhase("result");
      });
  };

  const openDialog = () => {
    if (isChecking) {
      return;
    }

    setVisible(true);
    setDialogPhase("confirm");
  };

  const closeDialog = () => {
    if (isChecking) {
      return;
    }

    setVisible(false);
    setDialogPhase("confirm");
  };

  const footer =
    dialogPhase === "confirm" ? (
      <div className={style.footer}>
        <Button variant="subtle" onClick={closeDialog}>
          {intl.formatMessage({
            id: "cancel",
            defaultMessage: "Cancel",
          })}
        </Button>
        <Button variant="primary" onClick={queryVersion}>
          {intl.formatMessage({
            id: "telemetry.version.confirm.action",
            defaultMessage: "Confirm and Check for Updates",
          })}
        </Button>
      </div>
    ) : isChecking ? null : hasCheckError ? (
      <div className={style.footer}>
        <Button variant="subtle" onClick={closeDialog}>
          {intl.formatMessage({
            id: "close",
            defaultMessage: "Close",
          })}
        </Button>
        <Button variant="primary" onClick={queryVersion}>
          {intl.formatMessage({
            id: "telemetry.action.retry",
            defaultMessage: "Try Again",
          })}
        </Button>
      </div>
    ) : (
      <div className={style.footer}>
        <Button variant="primary" onClick={closeDialog}>
          {intl.formatMessage({
            id: "close",
            defaultMessage: "Close",
          })}
        </Button>
      </div>
    );

  return (
    <>
      {isSystemAdmin && (
        <button
          className={style.trigger}
          type="button"
          disabled={visible && updateQuery.loading}
          onClick={openDialog}
        >
          <Icon className={style.triggerIcon} type="refresh" />
          <span>
            {intl.formatMessage({
              id: "telemetry.version.action.check",
              defaultMessage: "Check for Updates",
            })}
          </span>
        </button>
      )}

      <DialogBase
        title={intl.formatMessage({
          id: "telemetry.version.dialog.title",
          defaultMessage: "Check for Updates",
        })}
        visible={visible}
        setVisible={(nextVisible) => {
          if (!nextVisible) {
            closeDialog();
          }
        }}
        widthClassName={widthClassName}
        bodyClassName={style.body}
        footer={footer}
      >
        <div className={style.content}>
          {dialogPhase === "confirm" && (
            <div className={style.confirmContent}>
              <p className={style.confirmVersion}>
                <span className={style.confirmVersionLabel}>
                  {intl.formatMessage({
                    id: "telemetry.version.confirm.currentVersion",
                    defaultMessage: "Current Version:",
                  })}
                </span>
                <span>{currentVersionLabel}</span>
              </p>
              <p className={style.confirmDescription}>
                {intl.formatMessage({
                  id: "telemetry.version.confirm.description",
                  defaultMessage:
                    "The system will compare the current cluster version with the official latest version. Update checks only report anonymized version and device identifiers, and do not include hostnames, IP addresses, or business data.",
                })}
              </p>
            </div>
          )}

          {isChecking && (
            <div className={style.loading} aria-live="polite" aria-busy="true">
              <Spinner spinning />
              <span>
                {intl.formatMessage({
                  id: "telemetry.version.loading",
                  defaultMessage: "Checking for updates...",
                })}
              </span>
            </div>
          )}

          {hasCheckError && (
            <div className={style.errorContent}>
              <p className={style.resultCurrentVersion}>
                <span className={style.resultCurrentVersionLabel}>
                  {intl.formatMessage({
                    id: "telemetry.version.confirm.currentVersion",
                    defaultMessage: "Current Version:",
                  })}
                </span>
                <span className={style.resultCurrentVersionValue}>
                  {currentVersionLabel}
                </span>
              </p>

              <div className={style.errorAlert} role="alert">
                <Icon
                  className={style.errorIcon}
                  type="alert-triangle-fill"
                  aria-hidden
                />
                <div className={style.error}>
                  {intl.formatMessage({
                    id: "telemetry.version.query.error",
                    defaultMessage: "Update check failed. Try again later.",
                  })}
                </div>
              </div>
              <p className={style.errorDescription}>
                {intl.formatMessage({
                  id: "telemetry.version.query.error.description",
                  defaultMessage:
                    "Unable to connect to the update server. Check the network and try again.",
                })}
              </p>
            </div>
          )}

          {!hasCheckError &&
            showResult &&
            !isChecking &&
            hasUpdateInfo &&
            (hasNewVersion ? (
              <>
                <Alert className={style.status} variant="info">
                  {intl.formatMessage({
                    id: "telemetry.version.newVersion",
                    defaultMessage:
                      "New version available. Upgrade is recommended.",
                  })}
                </Alert>

                <div className={style.versionPanel}>
                  <div className={style.versionItem}>
                    <span className={style.versionLabel}>
                      {intl.formatMessage({
                        id: "telemetry.version.current",
                        defaultMessage: "Current Version",
                      })}
                    </span>
                    <span className={style.versionValue}>
                      {currentVersionLabel}
                    </span>
                  </div>
                  <div className={style.arrow} aria-hidden>
                    &gt;
                  </div>
                  <div className={style.versionItem}>
                    <span className={style.versionLabel}>
                      {intl.formatMessage({
                        id: "telemetry.version.latest",
                        defaultMessage: "Latest Version",
                      })}
                    </span>
                    <span className={`${style.versionValue} ${style.latest}`}>
                      {latestVersionLabel}
                    </span>
                  </div>
                </div>

                {releaseNoteItems.length > 0 && (
                  <section className={style.releaseNotes}>
                    <h3>
                      {intl.formatMessage({
                        id: "telemetry.version.releaseNotes",
                        defaultMessage: "Release Notes",
                      })}
                    </h3>
                    <ul>
                      {releaseNoteItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </section>
                )}
              </>
            ) : (
              <>
                <p className={style.resultCurrentVersion}>
                  <span className={style.resultCurrentVersionLabel}>
                    {intl.formatMessage({
                      id: "telemetry.version.confirm.currentVersion",
                      defaultMessage: "Current Version:",
                    })}
                  </span>
                  <span className={style.resultCurrentVersionValue}>
                    {currentVersionLabel}
                  </span>
                </p>

                <Alert className={style.status} variant="positive">
                  {intl.formatMessage({
                    id: "telemetry.version.currentLatestSimple",
                    defaultMessage:
                      "The current version is already the latest version.",
                  })}
                </Alert>
              </>
            ))}
        </div>
      </DialogBase>
    </>
  );
};

export default UpdateCheck;
