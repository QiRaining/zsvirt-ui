import { gql } from "@apollo/client";
import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { OperationLog } from "@zstack/zsphere-types/graphql";
import { includes } from "lodash-es";
import React, { useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { getAllLongjobs } from "./validators";

const cancelLongjob = gql`
  mutation cancelLongjob($input: CancelLongjobInput!) {
    cancelLongjob(input: $input) {
      actionId
    }
  }
`;

const normalCanCancelApi = [
  "APICreateVmBackupMsg",
  "APIConvertVmFromForeignHypervisorMsg",
  "APIAddImageMsg",
  "APIAddKVMHostFromConfigFileMsg",
  "APIBatchCreateBaremetalChassisMsg",
  "APICreateDataVolumeTemplateFromVolumeMsg",
  "APICreateRootVolumeTemplateFromRootVolumeMsg",
  "APIExportImageFromBackupStorageMsg",
  "APICreateVmFromCdpBackupMsg",
  "APIRevertVmFromCdpBackupMsg",
  "APIMigrateVmMsg",
  "APIPrimaryStorageMigrateVmMsg",
  "APIFlattenVmInstanceMsg",
  "APIFlattenVolumeMsg",
  "APIUploadSoftwarePackageMsg",
  "APIUploadSoftwarePackageToBackupStorageMsg",
  "APIUploadAndExecuteSoftwareUpgradePackageMsg",
];

const cdpCancelApi = [
  "APICreateVmFromCdpBackupMsg",
  "APIRevertVmFromCdpBackupMsg",
];

interface IProps extends IActionWrapperProps<OperationLog> {
  onVisibleChange: (visible: boolean) => void;
  onBeforeCancelLongJobs?: (operationLogs: OperationLog[]) => void;
}

const CancelLongJob: React.FC<IProps> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  onVisibleChange,
  onBeforeCancelLongJobs,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  useEffect(() => {
    onVisibleChange(visible);
  }, [onVisibleChange, visible]);

  const canCancelObjectList = useMemo(() => {
    return selectedList?.flatMap((it) =>
      getAllLongjobs(it)
        .filter((job) => includes(normalCanCancelApi, job?.jobName || ""))
        .map((job) => ({
          ...it,
          uuid: job.longJobUuid,
          longjobs: [job],
        })),
    );
  }, [selectedList]);

  const cdpLongJobList = useMemo(() => {
    return canCancelObjectList?.filter((it) =>
      includes(cdpCancelApi, it.longjobs?.[0]?.jobName || ""),
    );
  }, [canCancelObjectList]);

  const submitData = (checked?: any) => {
    if (canCancelObjectList?.length > 0) {
      onBeforeCancelLongJobs?.(canCancelObjectList);
      const normalUuidList = canCancelObjectList?.map((it: any) =>
        includes(cdpCancelApi, it?.longjobs?.[0]?.jobName || "") && checked
          ? {
              uuid: it.uuid,
              options: it,
            }
          : { uuid: it.uuid },
      );
      doAction({
        mutation: cancelLongjob,
        payload: normalUuidList,
        name: intl.formatMessage({
          id: "cancel.task",
          defaultMessage: "Cancel Task",
        }),
        total: normalUuidList?.length,
        type: "OperationLongjob",
        onFinish: () => {
          setSelectedList?.([]);
        },
      });
    }
  };

  const onOk = () => {
    submitData();
  };

  const bannerMessage = useMemo(() => {
    if (cdpLongJobList?.length > 0) {
      return canCancelObjectList?.length !== cdpLongJobList?.length ? (
        <ReactMarkdown>
          {intl.formatMessage({
            id: "longJob.modal.cancel.alert.warn.with.cdp.task",
            defaultMessage:
              "1. Some tasks cannot be canceled. Only tasks that can be canceled are displayed.\n2. A CDP data restoration task is ongoing. If this task is canceled, data generated during the restoration will be cleaned up automatically.",
          })}
        </ReactMarkdown>
      ) : (
        <ReactMarkdown>
          {intl.formatMessage({
            id: "longJob.modal.cancel.alert.warn.with.all.cdp.task",
            defaultMessage: `After this task is canceled, data generated during the restoration will be cleaned up automatically.`,
          })}
        </ReactMarkdown>
      );
    }
    return;
  }, [cdpLongJobList, canCancelObjectList, intl]);

  return (
    <DialogP1
      onConfirm={onOk}
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "operationLog.modal.title.confirm.cancel.task",
        defaultMessage: "Cancel Task?",
      })}
      resourceNames={canCancelObjectList?.map(
        (it) => it?.name ?? it?.uuid ?? "",
      )}
      bannerMessage={bannerMessage}
    />
  );
};

export default CancelLongJob;
