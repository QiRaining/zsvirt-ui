import { useQuery } from "@apollo/client";
import { useAction } from "@zstack/zsphere-hooks";
import { useCallback } from "react";
import type { IntlShape } from "react-intl";
import { useIntl } from "react-intl";

import {
  GET_DISASTER_RECOVERY_SERVICE,
  RUN_DISASTER_RECOVERY_SERVICE_ACTION,
} from "./queries";
import type {
  DisasterRecoveryServiceActionKey,
  DisasterRecoveryServiceOperationPayload,
  DisasterRecoveryServiceState,
  DeployServiceFormValues,
  InitializeSiteFormValues,
  UploadPackageFormValues,
} from "./types";
import { getPrimaryAction } from "./utils";

type DisasterRecoveryServiceOperation =
  | "prepare-upload"
  | "upload-package"
  | "install-service"
  | "initialize-site"
  | "recheck"
  | "retry"
  | "request-clear"
  | "force-clear";

const PRIMARY_ACTION_TO_OPERATION: Partial<
  Record<DisasterRecoveryServiceActionKey, DisasterRecoveryServiceOperation>
> = {
  "prepare-upload": "prepare-upload",
  "upload-package": "upload-package",
  "install-service": "install-service",
  "initialize-site": "initialize-site",
  retry: "retry",
};

function getOperationName(
  operation: DisasterRecoveryServiceOperation,
  intl: IntlShape,
): string {
  switch (operation) {
    case "prepare-upload":
      return intl.formatMessage({
        id: "disasterRecoveryService.action.prepareUpload",
        defaultMessage: "Prepare Upload",
      });
    case "upload-package":
      return intl.formatMessage({
        id: "disasterRecoveryService.action.uploadPackage",
        defaultMessage: "Upload Package",
      });
    case "install-service":
      return intl.formatMessage({
        id: "disasterRecoveryService.action.installService",
        defaultMessage: "Deploy DR Service",
      });
    case "initialize-site":
      return intl.formatMessage({
        id: "disasterRecoveryService.action.initializeSite",
        defaultMessage: "Initialize Local Site",
      });
    case "recheck":
      return intl.formatMessage({
        id: "disasterRecoveryService.action.recheck",
        defaultMessage: "Recheck",
      });
    case "retry":
      return intl.formatMessage({
        id: "disasterRecoveryService.action.retry",
        defaultMessage: "Retry",
      });
    case "request-clear":
      return intl.formatMessage({
        id: "disasterRecoveryService.action.clearService",
        defaultMessage: "Clear Service Registration",
      });
    case "force-clear":
      return intl.formatMessage({
        id: "disasterRecoveryService.clear.confirm",
        defaultMessage: "Confirm Clear",
      });
  }
}

export function useDisasterRecoveryService() {
  const intl = useIntl();
  const doAction = useAction();
  const { data, loading, refetch } = useQuery(GET_DISASTER_RECOVERY_SERVICE, {
    fetchPolicy: "no-cache",
  });

  const service = data?.disasterRecoveryService as
    | DisasterRecoveryServiceState
    | undefined;

  const runOperation = useCallback(
    async (
      operation: DisasterRecoveryServiceOperation,
      values?: Partial<DisasterRecoveryServiceOperationPayload>,
    ) => {
      await doAction({
        mutation: RUN_DISASTER_RECOVERY_SERVICE_ACTION,
        payload: { ...values, operation },
        name: getOperationName(operation, intl),
        total: 1,
        type: "DisasterRecoveryService",
        forceRunCallback: true,
      });
      await refetch();
    },
    [doAction, intl, refetch],
  );

  const advance = useCallback(async () => {
    if (!service) {
      return;
    }
    const operation =
      PRIMARY_ACTION_TO_OPERATION[getPrimaryAction(service.status).key];
    if (!operation) {
      return;
    }
    await runOperation(operation);
  }, [runOperation, service]);

  const retry = useCallback(() => runOperation("retry"), [runOperation]);
  const recheck = useCallback(() => runOperation("recheck"), [runOperation]);
  const prepareUpload = useCallback(
    () => runOperation("prepare-upload"),
    [runOperation],
  );
  const uploadPackage = useCallback(
    (values: UploadPackageFormValues) => runOperation("upload-package", values),
    [runOperation],
  );
  const installService = useCallback(
    (values: DeployServiceFormValues) =>
      runOperation("install-service", values),
    [runOperation],
  );
  const initializeSite = useCallback(
    (values: InitializeSiteFormValues) =>
      runOperation("initialize-site", values),
    [runOperation],
  );
  const requestClear = useCallback(
    () => runOperation("request-clear"),
    [runOperation],
  );
  const forceClear = useCallback(
    () => runOperation("force-clear"),
    [runOperation],
  );

  return {
    service,
    loading,
    advance,
    prepareUpload,
    uploadPackage,
    installService,
    initializeSite,
    recheck,
    retry,
    requestClear,
    forceClear,
  };
}
