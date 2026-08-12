import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  BackupStorage as IBackupStorage,
  ReconnectBackupStoragePayload as IReconnectBackupStoragePayload,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const ReconnectAction: React.FC<IActionWrapperProps<IBackupStorage>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const reconnectBackupStorage = gql`
    mutation reconnectBackupStorage($input: ReconnectBackupStorageInput!) {
      reconnectBackupStorage(input: $input) {
        actionId
      }
    }
  `;

  const onOk = () => {
    setSelectedList?.([]);
    const payload: IReconnectBackupStoragePayload[] = selectedList.map(
      (item) => {
        return { uuid: item.uuid };
      },
    );
    doAction({
      mutation: reconnectBackupStorage,
      payload,
      name: intl.formatMessage({
        id: "reconnect.backupStorage",
        defaultMessage: "Reconnect Image Storage",
      }),
      total: selectedList.length,
      middleState: {
        type: "BackupStorage",
        field: "status",
        data: { status: "Connecting" },
        uuids: selectedList.map((item) => item.uuid),
      },
      type: "BackupStorage",
      onProgress: (result: ITaskResult) => {
        console.log("onProgress:", result);
      },
      onFinish: (result: IActionResult) => {
        console.log("onFinish:", result);
      },
    });
  };

  return (
    <DialogP3
      bannerMessage={intl.formatMessage({
        id: "backupStorage.modal.reconnect.alert.danger",
        defaultMessage: "You cannot operate resources on this image storage while reconnection is in progress.",
      })}
      title={intl.formatMessage({
        id: "backupStorage.modal.title.confirm.reconnect.backupStorage",
        defaultMessage: "Reconnect Image Storage?",
      })}
      resourceNames={(selectedList || []).map((r) => r.name)}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
};

export default ReconnectAction;
