import { useQuery } from "@apollo/client";
import { useAuth } from "@zstack/auth";
import { toast } from "@zstack/design";
import { useAction, type IActionResult } from "@zstack/zsphere-hooks";
import type {
  TelemetryConsentInventory,
  TelemetrySettingInventory,
  UpdateTelemetryConsentPayload,
} from "@zstack/zsphere-types/graphql";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import {
  GetTelemetryConsent,
  GetTelemetrySettings,
  UpdateTelemetryConsent,
} from "../../gql/telemetry.gql";
import {
  isSuccessfulTelemetryAction,
  parseTelemetryConsent,
  parseTelemetrySettings,
  type TelemetryConsentState,
  type ValidTelemetrySettingInventory,
} from "./consent-state";
import {
  clearTelemetryPromptRecord,
  createDisabledPromptRecord,
  writeTelemetryPromptRecord,
} from "./prompt-storage";

const TELEMETRY_UPDATE_AUTH = {
  type: "action",
  authKey: "edit",
  resource: "telemetry",
} as const;

interface UseTelemetryConsentOptions {
  enabled: boolean;
  accountUuid?: string;
}

interface TelemetryQueryResult<T> {
  value: T | null;
  contractError: Error | null;
}

type TelemetryConsentAction = "Enabled" | "Disabled";

const toError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error));

const getConsentResult = (
  inventory?: TelemetryConsentInventory,
): TelemetryQueryResult<TelemetryConsentState> => {
  if (!inventory) {
    return { value: null, contractError: null };
  }

  try {
    return {
      value: parseTelemetryConsent(inventory),
      contractError: null,
    };
  } catch (error) {
    return {
      value: null,
      contractError: toError(error),
    };
  }
};

const getSettingsResult = (
  inventory?: TelemetrySettingInventory,
): TelemetryQueryResult<ValidTelemetrySettingInventory> => {
  if (!inventory) {
    return { value: null, contractError: null };
  }

  try {
    return {
      value: parseTelemetrySettings(inventory),
      contractError: null,
    };
  } catch (error) {
    return {
      value: null,
      contractError: toError(error),
    };
  }
};

export const useTelemetryConsent = ({
  enabled,
  accountUuid,
}: UseTelemetryConsentOptions) => {
  const intl = useIntl();
  const doAction = useAction();
  const { hasAuth } = useAuth();
  const hasUpdatePermission = hasAuth(TELEMETRY_UPDATE_AUTH);
  const [pendingAction, setPendingAction] =
    useState<TelemetryConsentAction | null>(null);
  const [actionError, setActionError] = useState<Error | null>(null);

  const consentQuery = useQuery<{
    getTelemetryConsent: TelemetryConsentInventory;
  }>(GetTelemetryConsent, {
    skip: !enabled,
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });
  const settingsQuery = useQuery<{
    getTelemetrySettings: TelemetrySettingInventory;
  }>(GetTelemetrySettings, {
    skip: !enabled,
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  const consentResult = useMemo(
    () => getConsentResult(consentQuery.data?.getTelemetryConsent),
    [consentQuery.data?.getTelemetryConsent],
  );
  const settingsResult = useMemo(
    () => getSettingsResult(settingsQuery.data?.getTelemetrySettings),
    [settingsQuery.data?.getTelemetrySettings],
  );

  useEffect(() => {
    const error = consentQuery.error ?? consentResult.contractError;
    if (error) {
      console.error("[telemetry] consent query failed", {
        operation: "GetTelemetryConsent",
        route: globalThis.location?.pathname,
        error,
      });
    }
  }, [consentQuery.error, consentResult.contractError]);

  useEffect(() => {
    const error = settingsQuery.error ?? settingsResult.contractError;
    if (error) {
      console.error("[telemetry] settings query failed", {
        operation: "GetTelemetrySettings",
        route: globalThis.location?.pathname,
        error,
      });
    }
  }, [settingsQuery.error, settingsResult.contractError]);

  const persistPromptDecision = useCallback(
    (action: TelemetryConsentAction) => {
      if (!accountUuid) {
        throw new Error(
          "Telemetry consent action requires a prepared accountUuid",
        );
      }

      if (action === "Enabled") {
        clearTelemetryPromptRecord(window.localStorage, accountUuid);
        return;
      }

      writeTelemetryPromptRecord(
        window.localStorage,
        accountUuid,
        createDisabledPromptRecord(Date.now()),
      );
    },
    [accountUuid],
  );

  const handleVerifiedAction = useCallback(
    async (
      action: TelemetryConsentAction,
      result: IActionResult,
      onVerified?: () => void,
    ) => {
      const refetchConsent = await consentQuery.refetch();
      const nextState = parseTelemetryConsent(
        refetchConsent.data.getTelemetryConsent,
      );

      if (!isSuccessfulTelemetryAction(result)) {
        throw new Error(
          `Telemetry ${action} action did not complete successfully`,
        );
      }

      const expectedKind = action === "Enabled" ? "enabled" : "disabled";

      if (nextState.kind !== expectedKind) {
        throw new Error(
          `Telemetry ${action} verification failed: expected=${expectedKind}, actual=${nextState.kind}`,
        );
      }

      try {
        persistPromptDecision(action);
      } catch (error) {
        console.error("[telemetry] prompt decision persistence failed", {
          operation: action,
          accountUuid,
          error,
        });
      }

      toast({
        title:
          action === "Enabled"
            ? intl.formatMessage({
                id: "telemetry.action.join.success",
                defaultMessage:
                  "You have joined the Experience Improvement Program.",
              })
            : intl.formatMessage({
                id: "telemetry.action.leave.success",
                defaultMessage:
                  "You have left the Experience Improvement Program.",
              }),
        indicator: "success",
      });
      onVerified?.();
    },
    [accountUuid, consentQuery, intl, persistPromptDecision],
  );

  const submitConsentAction = useCallback(
    async (action: TelemetryConsentAction, onVerified?: () => void) => {
      setActionError(null);

      if (!hasUpdatePermission) {
        const error = new Error("Missing telemetry update permission");
        setActionError(error);
        console.error("[telemetry] consent action denied", {
          operation: action,
          accountUuid,
          error,
        });
        return;
      }

      setPendingAction(action);
      const payload: UpdateTelemetryConsentPayload =
        action === "Enabled"
          ? {
              action,
              agreedToTerms: true,
            }
          : {
              action,
            };

      try {
        await doAction({
          mutation: UpdateTelemetryConsent,
          payload,
          name:
            action === "Enabled"
              ? intl.formatMessage({
                  id: "telemetry.action.join.name",
                  defaultMessage: "Join the Experience Improvement Program",
                })
              : intl.formatMessage({
                  id: "telemetry.action.leave.name",
                  defaultMessage: "Leave the Experience Improvement Program",
                }),
          total: 1,
          type: "TelemetryConsentInventory",
          onFinish: (result) => {
            void handleVerifiedAction(action, result, onVerified)
              .catch((error: unknown) => {
                const normalizedError = toError(error);
                setActionError(normalizedError);
                console.error("[telemetry] consent action failed", {
                  operation: action,
                  actionUuid: result.actionId,
                  error: normalizedError,
                });
                toast({
                  title: intl.formatMessage({
                    id: "telemetry.action.error",
                    defaultMessage:
                      "The Experience Improvement Program could not be updated. Try again.",
                  }),
                  variant: "destructive",
                });
              })
              .finally(() => {
                setPendingAction(null);
              });
          },
        });
      } catch (error) {
        const normalizedError = toError(error);
        setPendingAction(null);
        setActionError(normalizedError);
        console.error("[telemetry] consent mutation rejected", {
          operation: action,
          error: normalizedError,
        });
        toast({
          title: intl.formatMessage({
            id: "telemetry.action.error",
            defaultMessage:
              "The Experience Improvement Program could not be updated. Try again.",
          }),
          variant: "destructive",
        });
      }
    },
    [accountUuid, doAction, handleVerifiedAction, hasUpdatePermission, intl],
  );

  const refetch = useCallback(async () => {
    setActionError(null);
    await Promise.all([consentQuery.refetch(), settingsQuery.refetch()]);
  }, [consentQuery, settingsQuery]);

  return {
    consentState: consentResult.value,
    settings: settingsResult.value,
    loading: consentQuery.loading || settingsQuery.loading,
    consentLoading: consentQuery.loading,
    settingsLoading: settingsQuery.loading,
    error:
      consentQuery.error ??
      settingsQuery.error ??
      consentResult.contractError ??
      settingsResult.contractError,
    consentError: consentQuery.error ?? consentResult.contractError,
    settingsError: settingsQuery.error ?? settingsResult.contractError,
    actionError,
    pendingAction,
    hasUpdatePermission,
    submitConsentAction,
    refetch,
    refetchSettings: settingsQuery.refetch,
  };
};
