import { gql } from "@apollo/client";
import { Alert, Button, Checkbox, Tooltip } from "@zstack/design";
import {
  DialogBase,
  DialogP3,
  DialogSelectedResource,
} from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { VmInstanceState } from "@zstack/zsphere-types";
import type {
  RebootVmInstancePayload,
  VmInstance,
} from "@zstack/zsphere-types/graphql";
import { useBoolean, usePersistFn, useUnmount } from "ahooks";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { useVmBackupTaskStatus } from "../../hooks/use-resource-config-query";

const rebootVmInstance = gql`
  mutation rebootVmInstance($input: RebootVmInstanceInput!) {
    rebootVmInstance(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<VmInstance>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  refetch,
}) => {
  const doAction = useAction();
  const intl = useIntl();
  const rootVolumeUuids =
    selectedList?.map((item) => item?.rootVolumeUuid)?.filter(Boolean) ?? [];
  const dataVolumeUuids =
    selectedList?.reduce((preUUids, vm) => {
      const volumeUuids =
        vm?.allVolumes
          ?.map((item) => item?.uuid)
          ?.filter((uuid) => uuid !== vm.rootVolumeUuid) ?? [];
      return [...preUUids, ...volumeUuids];
    }, [] as string[]) ?? [];
  const [cancelBackupTask, { toggle }] = useBoolean();

  const { data: dataVmBackupTaskStatus } = useVmBackupTaskStatus(
    true,
    rootVolumeUuids,
    dataVolumeUuids,
    visible,
  );

  const backupTotal = useMemo(
    () =>
      dataVmBackupTaskStatus?.backupTaskStatus?.backupTaskStatusData?.length ??
      0,
    [dataVmBackupTaskStatus?.backupTaskStatus],
  );

  const onOk = usePersistFn(() => {
    setVisible(false);
    const payload: RebootVmInstancePayload[] = selectedList.map((item) => {
      return {
        uuid: item.uuid,
        cancelBackupTask,
        backupTaskLongJobUuids:
          dataVmBackupTaskStatus?.backupTaskStatus?.backupTaskStatusData?.find(
            (backupData: any) => backupData.targetResourceUuid === item.uuid,
          )?.longJobUuids ?? [],
      };
    });

    doAction({
      mutation: rebootVmInstance,
      payload,
      name: intl.formatMessage({
        id: "reboot.vm",
        defaultMessage: "Reboot Virtual Machine",
      }),
      total: selectedList.length,
      middleState: {
        type: "VmInstance",
        field: "state",
        data: { state: VmInstanceState.Rebooting },
        uuids: selectedList.map((item) => item.uuid),
      },
      type: "VmInstance",
      onFinish: () => {
        if (window.location.pathname === "/novnc") {
          refetch?.();
        }
        setSelectedList?.([]);
      },
    });

    if (setSelectedList) {
      setSelectedList([]);
    }
  });

  const isTaskRunning = dataVmBackupTaskStatus?.backupTaskStatus?.isTaskRunning;

  const alertMessage = React.useMemo(() => {
    if (!isTaskRunning) {
      return;
    }

    if (selectedList?.length === 1) {
      return (
        <ReactMarkdown>
          {intl.formatMessage(
            {
              id: "reboot.vm.cancel.running.backup.task.alert",
              defaultMessage: `1. Cannot reboot the virtual machine for it is running a backup task. Wait until the backup task is completed or select the checkbox to cancel the backup task and try again.
2. The backup task progress is {progress}%. When you cancel the backup task, the Cloud will not save the backup data. Please exercise caution.`,
            },
            { progress: dataVmBackupTaskStatus?.backupTaskStatus?.progress },
          )}
        </ReactMarkdown>
      );
    }

    return (
      <ReactMarkdown>
        {intl.formatMessage(
          {
            id: "reboot.vm.cancel.running.backup.task.alert.mutli",
            defaultMessage: `1. Cannot reboot the virtual machine for it is running a backup task. Wait until the backup task is completed or select the checkbox to cancel the backup task and try again.
2. When you cancel the backup task, the Cloud will not save the backup data. Proceed with caution.`,
          },
          { progress: dataVmBackupTaskStatus?.backupTaskStatus?.progress },
        )}
      </ReactMarkdown>
    );
  }, [dataVmBackupTaskStatus, intl, isTaskRunning, selectedList?.length]);

  useUnmount(() => toggle(false));

  if (isTaskRunning) {
    return (
      <DialogBase
        title={intl.formatMessage({
          id: "vm.modal.title.confirm.restart.vm",
          defaultMessage: "Reboot Virtual Machine?",
        })}
        visible={visible}
        setVisible={setVisible}
        footer={
          <>
            <Button variant="subtle" onClick={() => setVisible(false)}>
              {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                onOk();
              }}
            >
              {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
            </Button>
          </>
        }
      >
        <Alert variant="warning" className="mb-4">
          {alertMessage}
        </Alert>
        <DialogSelectedResource
          names={selectedList.map((item) => item.name ?? item.uuid)}
        />
        <Tooltip
          content={intl.formatMessage({
            id: "reboot.vm.cancel.running.backup.task.tip",
            defaultMessage:
              "Selecting this checkbox will cancel the backup jobs that are currently running for the selected virtual machines. The subsequent backup jobs are not affected.",
          })}
        >
          <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={cancelBackupTask}
              onCheckedChange={(v) => toggle(v === true)}
            />
            {intl.formatMessage(
              {
                id: "reboot.vm.cancel.running.backup.task",
                defaultMessage: "Reboot",
              },
              {
                total: backupTotal,
              },
            )}
          </label>
        </Tooltip>
      </DialogBase>
    );
  }

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "vm.modal.title.confirm.restart.vm",
        defaultMessage: "Reboot Virtual Machine?",
      })}
      visible={visible}
      setVisible={setVisible}
      onConfirm={() => {
        onOk();
      }}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
    />
  );
};

export default Action;
