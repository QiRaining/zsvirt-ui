import { DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  ChangeZSVBackupStorageStatePayload as IChangeZSVBackupStorageStatePayload,
  ZSVBackupStorage as IZSVBackupStorage,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { changeZSVBackupStorageState } from "../../../../gql/disaster-recovery-storage.gql";

const EnableAction: React.FC<IActionWrapperProps<IZSVBackupStorage>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = async () => {
    setSelectedList?.([]);
    const payload: IChangeZSVBackupStorageStatePayload[] = selectedList.map(
      (item) => {
        return { uuid: item.uuid, stateEvent: "enable" };
      },
    );
    doAction({
      mutation: changeZSVBackupStorageState,
      payload,
      name: intl.formatMessage({
        id: "enable.backupStorage",
        defaultMessage: "Enable Image Storage",
      }),
      total: selectedList.length,
      type: "ZSVBackupStorage",
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
      title={intl.formatMessage({
        id: "modal.title.confirm.enable.backupStorage",
        defaultMessage: "Enable Backup Storage?",
      })}
      resourceNames={(selectedList || []).map((r) => r.name)}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
};

export default EnableAction;
