import { gql, useQuery } from "@apollo/client";
import { DialogP0Smart } from "@zstack/zsphere-design-biz";
import { useAction, useSensitiveJudge } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  DeleteZSVBackupStoragePayload as IDeleteZSVBackupStoragePayload,
  ZSVBackupStorage as IZSVBackupStorage,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import {
  deleteZSVBackupStorage,
  getBackupStorageOfBackupJobSummary,
} from "../../../../gql/disaster-recovery-storage.gql";

const DeleteAction: React.FC<IActionWrapperProps<IZSVBackupStorage>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const needValidate = useSensitiveJudge();

  const { data } = useQuery(getBackupStorageOfBackupJobSummary, {
    variables: {
      backupStorageUuids: selectedList.map((item) => item.uuid),
    },
    fetchPolicy: "network-only",
  });

  const backupJobTotal = useMemo(() => {
    return data?.getLocalBackupStorageOfBackupJobSummary?.total || 0;
  }, [data?.getLocalBackupStorageOfBackupJobSummary]);

  const onOk = async () => {
    const payload: IDeleteZSVBackupStoragePayload[] = selectedList.map(
      (item) => {
        return { uuid: item.uuid };
      },
    );
    doAction({
      mutation: deleteZSVBackupStorage,
      payload,
      name: intl.formatMessage({
        id: "delete.disaster.recovery.storage",
        defaultMessage: "Delete Backup Storage",
      }),
      total: selectedList.length,
      type: "ZSVSBackupStorage",
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogP0Smart
      title={intl.formatMessage({
        id: "modal.title.confirm.delete.backupStorage",
        defaultMessage: "Delete Backup Storage?",
      })}
      bannerMessage={intl.formatMessage({
        id: "backup.storage.alert.msg",
        defaultMessage:
          "Deleting a backup storage stops the related backup plans and the backup data will not be displayed. Proceed with caution.",
      })}
      resourceType={intl.formatMessage({
        id: "backup.storage.title",
        defaultMessage: "Backup Storage",
      })}
      resourceNames={selectedList?.map((r) => r.name) || []}
      relatedResources={[
        {
          name: intl.formatMessage({
            id: "backup.job",
            defaultMessage: "Backup Job",
          }),
          count: backupJobTotal,
        },
      ]}
      visible={visible}
      setVisible={setVisible}
      confirmText="Delete"
      onConfirm={onOk}
      needValidate={needValidate}
    />
  );
};

export default DeleteAction;
