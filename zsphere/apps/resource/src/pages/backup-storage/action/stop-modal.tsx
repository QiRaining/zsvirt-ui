import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { BackupStorageStateEvent } from "@zstack/zsphere-types";
import type {
  BackupStorage as IBackupStorage,
  ChangeBackupStorageStatePayload as IChangeBackupStorageStatePayload,
} from "@zstack/zsphere-types/graphql";
import { filter as _filter, map as _map } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

const StopAction: React.FC<IActionWrapperProps<IBackupStorage>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const stopBackupStorage = gql`
    mutation changeBackupStorageState($input: ChangeBackupStorageStateInput!) {
      changeBackupStorageState(input: $input) {
        actionId
      }
    }
  `;

  const onOk = () => {
    const uuids = _map(_filter(selectedList, ["state", "Enabled"]), "uuid");

    const payload: IChangeBackupStorageStatePayload[] = uuids.map((uuid) => {
      return { uuid, stateEvent: BackupStorageStateEvent.disable };
    });
    doAction({
      mutation: stopBackupStorage,
      payload,
      name: intl.formatMessage({
        id: "disable.backupStorage",
        defaultMessage: "Disable Image Storage",
      }),
      total: payload.length,
      onProgress: () => {},
      onFinish: () => {},
    });
    setSelectedList?.([]);
  };

  return (
    <DialogP3
      bannerMessage={intl.formatMessage({
        id: "backupStorage.modal.disable.alertMessage",
        defaultMessage:
          "After disabled, you cannot add new images to this image storage. Existing images in the image storage remain unaffected and can be used to create new virtual machines.",
      })}
      title={intl.formatMessage({
        id: "backupStorage.modal.title.confirm.disable.backupStorage",
        defaultMessage: "Disable Image Storage?",
      })}
      resourceNames={(_filter(selectedList, ["state", "Enabled"]) || []).map(
        (r) => r.name,
      )}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
};

export default StopAction;
