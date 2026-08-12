import { useUserIdentity } from "@zstack/zsphere-hooks";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { bus } from "@zstack/zsphere-utils";
import { useCallback, useEffect, useState } from "react";

import TelemetryConsentDialog from "./components/telemetry-consent-dialog";
import {
  shouldOpenTelemetryGate,
  type TelemetryPromptRecordV1,
} from "./consent-state";
import {
  createDeferredPromptRecord,
  readTelemetryPromptRecord,
  writeTelemetryPromptRecord,
} from "./prompt-storage";
import { useTelemetryConsent } from "./use-telemetry-consent";

const TELEMETRY_CONSENT_BLOCKING_EVENT = "telemetry:consent-gate:blocking";
const TELEMETRY_CONSENT_BLOCKING_KEY = "zsv.telemetry.consent-gate.blocking";

const reportDashboardOnboardingBlocking = (blocking: boolean) => {
  sessionStorage.setItem(TELEMETRY_CONSENT_BLOCKING_KEY, String(blocking));
  bus.emit(TELEMETRY_CONSENT_BLOCKING_EVENT, blocking);
};

export interface TelemetryConsentGateProps {
  blocked?: boolean;
}

interface PromptReadResult {
  record?: TelemetryPromptRecordV1;
  error?: Error;
}

export const TelemetryConsentGate = ({
  blocked = false,
}: TelemetryConsentGateProps) => {
  const { isSystemAdmin } = useUserIdentity();
  const accountUuid = usePlatformStore(
    (state) => state.currentUser?.accountUuid,
  );
  const [promptRevision, setPromptRevision] = useState(0);
  const [sessionDismissed, setSessionDismissed] = useState(false);
  const enabled = isSystemAdmin && Boolean(accountUuid) && !blocked;
  const telemetry = useTelemetryConsent({
    enabled,
    accountUuid,
  });

  const [promptResult, setPromptResult] = useState<PromptReadResult>({});

  useEffect(() => {
    if (!accountUuid) {
      setPromptResult({});
      return;
    }

    try {
      setPromptResult({
        record: readTelemetryPromptRecord(window.localStorage, accountUuid),
      });
    } catch (error) {
      setPromptResult({
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }, [accountUuid, promptRevision]);

  useEffect(() => {
    if (promptResult.error) {
      console.error("[telemetry] prompt record read failed", {
        operation: "read",
        accountUuid,
        error: promptResult.error,
      });
    }
  }, [accountUuid, promptResult.error]);

  useEffect(() => {
    setSessionDismissed(false);
  }, [accountUuid]);

  const shouldOpen =
    !blocked &&
    !sessionDismissed &&
    !promptResult.error &&
    shouldOpenTelemetryGate({
      isSystemAdmin,
      hasUpdatePermission: telemetry.hasUpdatePermission,
      consentState: telemetry.consentState,
      settingsReady: Boolean(telemetry.settings) && !telemetry.settingsError,
      promptRecord: promptResult.record,
      now: Date.now(),
    });
  const blocksDashboardOnboarding =
    enabled &&
    (telemetry.loading || shouldOpen || Boolean(telemetry.pendingAction));

  useEffect(() => {
    reportDashboardOnboardingBlocking(blocksDashboardOnboarding);
  }, [blocksDashboardOnboarding]);

  useEffect(
    () => () => {
      reportDashboardOnboardingBlocking(false);
    },
    [],
  );

  const handleDefer = useCallback(() => {
    if (!accountUuid || telemetry.pendingAction) {
      return;
    }

    const record = createDeferredPromptRecord(Date.now());
    try {
      writeTelemetryPromptRecord(window.localStorage, accountUuid, record);
      setPromptRevision((revision) => revision + 1);
      setSessionDismissed(true);
    } catch (error) {
      console.error("[telemetry] prompt record write failed", {
        operation: "deferred",
        accountUuid,
        decision: record.decision,
        error,
      });
      setSessionDismissed(true);
    }
  }, [accountUuid, telemetry.pendingAction]);

  const handleJoin = useCallback(() => {
    void telemetry.submitConsentAction("Enabled", () => {
      setSessionDismissed(true);
      setPromptRevision((revision) => revision + 1);
    });
  }, [telemetry]);

  if (!enabled && !telemetry.pendingAction) {
    return null;
  }

  return (
    <TelemetryConsentDialog
      visible={shouldOpen}
      settings={telemetry.settings}
      settingsLoading={telemetry.settingsLoading}
      settingsError={telemetry.settingsError}
      actionError={telemetry.actionError}
      submitting={telemetry.pendingAction === "Enabled"}
      onJoin={handleJoin}
      onDefer={handleDefer}
      onRetrySettings={() => {
        void telemetry.refetchSettings();
      }}
    />
  );
};

export default TelemetryConsentGate;
