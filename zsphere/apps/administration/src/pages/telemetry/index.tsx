import { Alert, Button, Tag } from "@zstack/design";
import { IllusIconExperienceUpgradeProgramObj } from "@zstack/icon";
import { HeaderList, Spinner } from "@zstack/zsphere-design-biz";
import { useUserIdentity } from "@zstack/zsphere-hooks";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { useCallback, useState } from "react";
import { useIntl } from "react-intl";
import { Navigate } from "react-router";

import TelemetryConsentDialog from "../../features/telemetry/components/telemetry-consent-dialog";
import { useTelemetryConsent } from "../../features/telemetry/use-telemetry-consent";

import style from "./index.module.less";

const TelemetryPage = () => {
  const intl = useIntl();
  const { isSystemAdmin } = useUserIdentity();
  const accountUuid = usePlatformStore(
    (state) => state.currentUser?.accountUuid,
  );
  const [dialogVisible, setDialogVisible] = useState(false);
  const telemetry = useTelemetryConsent({
    enabled: isSystemAdmin && Boolean(accountUuid),
    accountUuid,
  });

  const handleJoin = useCallback(() => {
    void telemetry.submitConsentAction("Enabled", () => {
      setDialogVisible(false);
    });
  }, [telemetry]);

  const handleLeave = useCallback(() => {
    void telemetry.submitConsentAction("Disabled");
  }, [telemetry]);

  if (!isSystemAdmin) {
    return <Navigate to="/exception/401" replace />;
  }

  const status =
    telemetry.consentState?.kind === "enabled"
      ? {
          label: intl.formatMessage({
            id: "telemetry.status.joined",
            defaultMessage: "Joined",
          }),
          theme: "green" as const,
          level: "strong" as const,
        }
      : {
          label: intl.formatMessage({
            id: "telemetry.status.notJoined",
            defaultMessage: "Not Joined",
          }),
          theme: undefined,
          level: "base" as const,
        };

  return (
    <div className={style.page}>
      <HeaderList
        title={intl.formatMessage({
          id: "virtualization.telemetry",
          defaultMessage: "Experience Improvement Program",
        })}
      />

      <main className={style.banner}>
        <IllusIconExperienceUpgradeProgramObj
          className={style.illustration}
          aria-hidden
        />
        <div className={style.details}>
          <div className={style.titleRow}>
            <h1>
              {intl.formatMessage({
                id: "virtualization.telemetry",
                defaultMessage: "Experience Improvement Program",
              })}
            </h1>
            {telemetry.consentState && (
              <Tag theme={status.theme} level={status.level}>
                {status.label}
              </Tag>
            )}
          </div>

          {telemetry.loading && <Spinner spinning />}
          {telemetry.error && (
            <Alert variant="danger">
              <div className={style.error}>
                <span>
                  {intl.formatMessage({
                    id: "telemetry.query.error",
                    defaultMessage:
                      "The Experience Improvement Program could not be loaded.",
                  })}
                </span>
                <Button
                  variant="link"
                  onClick={() => {
                    void telemetry.refetch();
                  }}
                >
                  {intl.formatMessage({
                    id: "telemetry.action.retry",
                    defaultMessage: "Try Again",
                  })}
                </Button>
              </div>
            </Alert>
          )}

          {!telemetry.loading &&
            !telemetry.error &&
            telemetry.settings &&
            telemetry.consentState && (
              <>
                <p className={style.description}>
                  {intl.formatMessage({
                    id: "telemetry.setting.description",
                    defaultMessage:
                      "The Experience Improvement Program helps us improve product usability and runtime performance so we can provide better services.",
                  })}
                </p>

                {!telemetry.hasUpdatePermission && (
                  <Alert variant="warning">
                    {intl.formatMessage({
                      id: "telemetry.permission.missing",
                      defaultMessage:
                        "The current Admin account does not have permission to update this setting.",
                    })}
                  </Alert>
                )}

                {telemetry.hasUpdatePermission && (
                  <div className={style.actions}>
                    {telemetry.consentState.kind === "enabled" ? (
                      <Button
                        variant="danger"
                        loading={telemetry.pendingAction === "Disabled"}
                        disabled={Boolean(telemetry.pendingAction)}
                        onClick={handleLeave}
                      >
                        {intl.formatMessage({
                          id: "telemetry.action.leave",
                          defaultMessage: "Leave Program",
                        })}
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        disabled={Boolean(telemetry.pendingAction)}
                        onClick={() => setDialogVisible(true)}
                      >
                        {intl.formatMessage({
                          id: "telemetry.action.join",
                          defaultMessage: "Join Now",
                        })}
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
        </div>
      </main>

      <TelemetryConsentDialog
        visible={dialogVisible}
        settings={telemetry.settings}
        settingsLoading={telemetry.settingsLoading}
        settingsError={telemetry.settingsError}
        actionError={telemetry.actionError}
        submitting={telemetry.pendingAction === "Enabled"}
        onJoin={handleJoin}
        onDefer={() => setDialogVisible(false)}
        onRetrySettings={() => {
          void telemetry.refetchSettings();
        }}
      />
    </div>
  );
};

export default TelemetryPage;
