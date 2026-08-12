import { gql } from "@apollo/client";
import { DialogP0Smart } from "@zstack/zsphere-design-biz";
import { useAction, useSensitiveJudge } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  BackupStorage as IBackupStorage,
  DeleteBackupStoragePayload as IDeleteBackupStoragePayload,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { useNavigate, useLocation } from "react-router";

const DeleteAction: React.FC<IActionWrapperProps<IBackupStorage>> = ({
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const navigate = useNavigate();
  const location = useLocation();

  const needValidate = useSensitiveJudge();

  const deleteBackupStorage = gql`
    mutation deleteBackupStorage($input: DeleteBackupStorageInput!) {
      deleteBackupStorage(input: $input) {
        actionId
      }
    }
  `;
  const onOk = async () => {
    const uuids = selectedList?.map((item) => item.uuid) || [];
    const payload: IDeleteBackupStoragePayload[] = uuids.map((uuid) => {
      return { uuid };
    });

    doAction({
      mutation: deleteBackupStorage,
      payload,
      name: intl.formatMessage({
        id: "delete.backupStorage",
        defaultMessage: "Delete Image Storage",
      }),
      total: selectedList?.length,
      type: "BackupStorage",
      onProgress: () => {},
      onFinish: () => {
        if (location.pathname.indexOf("backup-storage/detail") > -1) {
          navigate(-1);
        }
      },
    });
  };

  const isAllowBackup = useMemo(() => {
    return selectedList?.[0]?.systemTag?.includes("allowbackup");
  }, [selectedList]);

  return (
    <DialogP0Smart
      title={intl.formatMessage({
        id: "backupStorage.modal.title.confirm.delete.backupStorage",
        defaultMessage: "Delete Image Storage?",
      })}
      bannerMessage={
        isAllowBackup ? (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "backupStorage.modal.delete.cdp.alert.danger",
              defaultMessage: `1. This backup storage is also used as a local backup server. Deleting the backup storage also deletes the CDP tasks and CDP data on the corresponding local backup server. Proceed with caution.
2. Deleting a backup storage will only delete the backup storage and image records on the platform but not actual data.`,
            })}
          </ReactMarkdown>
        ) : (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "backupStorage.modal.delete.alert.danger",
              defaultMessage:
                "Deleting an image storage only removes the records of the storage and its images from the platform. This operation does not remove the actual data.",
            })}
          </ReactMarkdown>
        )
      }
      resourceType={intl.formatMessage({
        id: "backupStorage",
        defaultMessage: "Image Storage",
      })}
      resourceNames={selectedList?.map((r) => r.name) || []}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
      needValidate={needValidate}
    />
  );
};

export default DeleteAction;
