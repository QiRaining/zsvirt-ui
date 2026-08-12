import { gql } from "@apollo/client";
import { Button, Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { useAction } from "@zstack/zsphere-hooks";
import { OperationLongjobStatus } from "@zstack/zsphere-types";
import type { OperationLog } from "@zstack/zsphere-types/graphql";
import { usePersistFn } from "ahooks";
import { includes } from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import {
  isUploadAutoRetryingStatus,
  UPLOAD_AUTO_RETRY_STATUSES,
} from "../../action/upload-action-guards";
import { getAllLongjobs } from "../../action/validators";
import { useOperationLogUploadSessions } from "../../upload-session-context";
import { useZsvResume } from "../../use-zsv-resume";

const cancelLongjob = gql`
  mutation cancelLongjob($input: CancelLongjobInput!) {
    cancelLongjob(input: $input) {
      actionId
    }
  }
`;

const supportCancelApiList: string[] = [
  "APICreateVmBackupMsg", // 创建备份
  "APIMigrateVmMsg", // 更改物理机
  "APIAddImageMsg", //添加镜像
  "APIFlattenVmInstanceMsg", // 云主机扁平合并
  "APIFlattenVolumeMsg", // 云盘扁平合并
  "APIPrimaryStorageMigrateVmMsg", //更改主机和数据存储&&更改数据存储
  "APIUploadSoftwarePackageMsg",
  "APIUploadSoftwarePackageToBackupStorageMsg",
  "APIUploadAndExecuteSoftwareUpgradePackageMsg",
  "APIUploadSoftwarePackageToVmMsg",
];

const notSupportPauseApiList: string[] = [
  "APICreateVmBackupMsg",
  "APIMigrateVmMsg",
  "APIFlattenVmInstanceMsg",
  "APIFlattenVolumeMsg",
  "APIPrimaryStorageMigrateVmMsg",
  "APIUploadSoftwarePackageToVmMsg",
];

const uploadContinueStatuses = ["WAITING_FOR_FILE", "RETRY_READY", "PAUSED"];
const uploadCancelableStatuses = [
  ...uploadContinueStatuses,
  ...UPLOAD_AUTO_RETRY_STATUSES,
  "RETRY_EXHAUSTED",
];

export const ResumeButton: React.FC<{
  operationLog: OperationLog;
  longJobState: OperationLongjobStatus;
  setLongJobState: Function;
  complete: any;
}> = ({ operationLog, longJobState, setLongJobState, complete }) => {
  const intl = useIntl();
  const resume = useZsvResume();
  const { getUploadSession, refreshUploadSessions } =
    useOperationLogUploadSessions();
  const currentLongjob = useMemo(
    () => getAllLongjobs(operationLog)?.[0],
    [operationLog],
  );
  const uploadSession = getUploadSession(currentLongjob?.longJobUuid);
  const operationLogWithUploadSession = useMemo(
    () =>
      uploadSession
        ? ({ ...operationLog, uploadSession } as OperationLog)
        : operationLog,
    [operationLog, uploadSession],
  );

  const pauseAndGoingOn = useMemo(() => {
    if (!operationLog) {
      return null;
    }
    return resume(operationLogWithUploadSession);
  }, [operationLog, operationLogWithUploadSession, resume]);

  const doAction = useAction();

  const jobResp = useMemo(() => {
    return operationLog?.operationTasks?.[0]?.operationApis?.[0]?.resp || "{}";
  }, [operationLog]);

  const jobData = useMemo(() => {
    try {
      return JSON.parse(
        JSON.parse(jobResp)?.jobData ||
          JSON.parse(jobResp)?.inventory?.jobData ||
          "{}",
      );
    } catch {
      return {};
    }
  }, [jobResp]);
  const longjobData = useMemo(() => {
    try {
      return JSON.parse(currentLongjob?.data || "{}");
    } catch {
      return {};
    }
  }, [currentLongjob?.data]);

  const cancel = usePersistFn(() => {
    const uuid = currentLongjob?.longJobUuid;
    setLongJobState("CANCELING");
    doAction({
      mutation: cancelLongjob,
      payload: [{ uuid }],
      name: intl.formatMessage({
        id: "cancel.task",
        defaultMessage: "Cancel Task",
      }),
      total: 1,
      type: "OperationLongjob",
      onFinish: () => {
        pauseAndGoingOn?.del();
      },
    });
  });

  if (
    !includes(supportCancelApiList, currentLongjob?.jobName) ||
    pauseAndGoingOn === null
  ) {
    return null;
  }

  const isUpload =
    jobData?.url?.indexOf("upload://") === 0 ||
    longjobData?.url?.indexOf("upload://") === 0;
  const localUpload = pauseAndGoingOn?.getFile?.();
  const waitingForFile = Boolean(
    uploadSession?.resumable &&
    !localUpload &&
    !complete &&
    uploadContinueStatuses.includes(uploadSession.status),
  );
  const uploadAutoRetrying = isUploadAutoRetryingStatus(uploadSession?.status);
  const uploadCancelable = Boolean(
    uploadSession?.status &&
    uploadCancelableStatuses.includes(uploadSession.status),
  );
  const paused: boolean = longJobState === OperationLongjobStatus.SUSPENDED;
  const running: boolean = longJobState === OperationLongjobStatus.RUNNING;
  const supportsPause = !includes(
    notSupportPauseApiList,
    currentLongjob?.jobName,
  );
  const canContinue =
    supportsPause && ((paused && !uploadAutoRetrying) || waitingForFile);

  if (
    [
      "APIAddImageMsg",
      "APIUploadSoftwarePackageMsg",
      "APIUploadSoftwarePackageToBackupStorageMsg",
      "APIUploadAndExecuteSoftwareUpgradePackageMsg",
    ].includes(currentLongjob?.jobName || "") &&
    !isUpload &&
    !uploadSession
  ) {
    return null;
  }

  const continueButton = (
    <Button
      variant="secondary"
      style={{ marginRight: 4 }}
      icon={<Icon type="play-circle" />}
      onClick={() => {
        pauseAndGoingOn?.goingOn();
        void refreshUploadSessions({ force: true });
      }}
    >
      {waitingForFile
        ? intl.formatMessage({
            id: "operationLog.upload.selectFileToContinue",
            defaultMessage: "Select File to Continue",
          })
        : intl.formatMessage({
            id: "operation.goingOn",
            defaultMessage: "Continue",
          })}
    </Button>
  );

  return (
    <>
      {running &&
        !waitingForFile &&
        !uploadAutoRetrying &&
        supportsPause &&
        !complete && (
          <Button
            variant="secondary"
            style={{ marginRight: 4 }}
            icon={<Icon type="pause-circle" />}
            onClick={() => {
              pauseAndGoingOn?.pause();
            }}
          >
            {intl.formatMessage({
              id: "operation.pause",
              defaultMessage: "Pause",
            })}
          </Button>
        )}
      {canContinue &&
        (waitingForFile ? (
          <Tooltip
            title={intl.formatMessage({
              id: "operationLog.upload.reselectFileTip",
              defaultMessage:
                "The browser no longer has access to the local file. Select the same file to continue uploading.",
            })}
          >
            {continueButton}
          </Tooltip>
        ) : (
          continueButton
        ))}
      {(canContinue || running || uploadCancelable) && (
        <Button
          variant="secondary"
          style={{ marginRight: 4 }}
          icon={<Icon type="minus-circle" />}
          onClick={cancel}
        >
          {intl.formatMessage({
            id: "operation.cancel",
            defaultMessage: "Cancel",
          })}
        </Button>
      )}
    </>
  );
};
