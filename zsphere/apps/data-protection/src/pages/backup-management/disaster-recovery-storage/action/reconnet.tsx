import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { ZSVBackupStorage as IZSVBackupStorage } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { reconnectZSVBackupStorage } from "../../../../gql/disaster-recovery-storage.gql";

const ReconnectAction: React.FC<IActionWrapperProps<IZSVBackupStorage>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = async () => {
    const payload = selectedList.map((item) => {
      return { uuid: item.uuid };
    });
    doAction({
      mutation: reconnectZSVBackupStorage,
      payload,
      name: intl.formatMessage({
        id: "reconnect.BackupStorage",
        defaultMessage: "Reconnect Backup Storage",
      }),
      total: selectedList.length,
      type: "ZSVBackupStorage",
      onFinish: () => {
        setSelectedList?.([]);
        refetch?.();
      },
    });
  };

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "modal.title.confirm.reconnect.BackupStorage",
        defaultMessage: "Reconnect Backup Storage?",
      })}
      resourceNames={(selectedList || []).map((r) => r.name)}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
};

export default ReconnectAction;
