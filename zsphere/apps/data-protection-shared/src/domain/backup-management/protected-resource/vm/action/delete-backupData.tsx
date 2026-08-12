import { gql } from "@apollo/client";
import { Alert } from "@zstack/design";
import { Checkbox } from "@zstack/design";
import { Tooltip } from "@zstack/design";
import { Button } from "@zstack/design";
import { DialogBase, DialogSelectedResource } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import {
  BackupResourceType,
  BackupDataIsRemoteSynced,
  BackupDataIsLocalSynced,
} from "@zstack/zsphere-types";
import type { BackupData } from "@zstack/zsphere-types/graphql";
import React, { useState } from "react";
import { useIntl } from "react-intl";

const deleteBackupDataList = gql`
  mutation deleteBackupDataList($input: DeleteBackupDataListInput!) {
    deleteBackupDataList(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<BackupData>> = ({
  view,
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const isRemoteView = view === "main.remote";
  const [checked, setChecked] = useState(false);

  const onOk = async () => {
    setVisible(false);

    const payload = selectedList?.map((it: any) => {
      const backupStorageUuids = it.backupStorageRefs.map(
        (bsRefs: any) => bsRefs.backupStorageUuid,
      );
      return {
        remote: checked,
        whole: true,
        groupUuid: it.groupUuid,
        handleDependency: true,
        backupStorageUuids,
        type: "Root",
        backupType: BackupResourceType.VmInstance,
        bsUuid: isRemoteView
          ? it?.remoteBackupStorage?.uuid
          : it?.localBackupStorage?.uuid,
      };
    });

    doAction({
      mutation: deleteBackupDataList,
      payload,
      name: intl.formatMessage({
        id: "delete.localBackupData",
        defaultMessage: "Delete Backup Data",
      }),
      total: selectedList.length,
      type: "BackupData",
    });
  };

  const isSynced = isRemoteView
    ? selectedList.some(
        (it) => it?.isLocalSynced === BackupDataIsLocalSynced.Yes,
      )
    : selectedList.some(
        (it) => it?.isRemoteSynced === BackupDataIsRemoteSynced.Yes,
      );

  const remoteLabel = isRemoteView
    ? intl.formatMessage({
        id: "delete.local.back.data",
        defaultMessage: "Delete Also Data on Local Backup Server",
      })
    : intl.formatMessage({
        id: "delete.remote.back.data",
        defaultMessage: "Delete Also Data on Remote Backup Server",
      });

  return (
    <DialogBase
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "localBackupData.modal.title.confirm.delete.localBackupData",
        defaultMessage: "Delete Backup Data?",
      })}
      footer={
        <>
          <Button variant="subtle" onClick={() => setVisible(false)}>
            {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
          </Button>
          <Button variant="danger" onClick={onOk}>
            {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
          </Button>
        </>
      }
    >
      <Alert variant="error" className="mb-4">
        {intl.formatMessage({
          id: "localBackupData.modal.title.confirm.delete.localBackupData",
          defaultMessage: "Delete Backup Data?",
        })}
      </Alert>
      <DialogSelectedResource
        names={selectedList.map((r) => r.name ?? r.uuid)}
      />
      {isSynced && (
        <Tooltip content={remoteLabel}>
          <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={checked}
              onCheckedChange={(v) => setChecked(v === true)}
            />
            {remoteLabel}
          </label>
        </Tooltip>
      )}
    </DialogBase>
  );
};

export default Action;
