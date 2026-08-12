import { Modal } from "@zstack/zsphere-components";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import type { ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  ReclaimSpaceFromZSVBackupStoragePayload as IReclaimSpaceFromZSVBackupStoragePayload,
  ZSVBackupStorage as IZSVBackupStorage,
} from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import React from "react";
import { useIntl } from "react-intl";

import { reclaimSpaceFromZSVBackupStorage } from "../../../../gql/disaster-recovery-storage.gql";

interface IInventory {
  freedSpaceInBytes: number;
}

const ClearDataAction: React.FC<IActionWrapperProps<IZSVBackupStorage>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = async () => {
    setSelectedList?.([]);
    const payload: IReclaimSpaceFromZSVBackupStoragePayload[] =
      selectedList.map((item) => {
        return { uuid: item.uuid };
      });
    const inventoriesResult: IInventory[] = [];
    doAction({
      mutation: reclaimSpaceFromZSVBackupStorage,
      payload,
      name: intl.formatMessage({
        id: "clear.BackupServer.data",
        defaultMessage: "Clean Up Backup Storage Data",
      }),
      total: selectedList.length,
      type: "ZSVBackupStorage",
      onProgress: (result: ITaskResult) => {
        if (result.inventory) {
          inventoriesResult.push(result.inventory);
        }
      },
      onFinish: () => {
        if (inventoriesResult.length === 0) {
          return;
        }
        const total = inventoriesResult?.reduce<number>((sum, current) => {
          return sum + current.freedSpaceInBytes;
        }, 0);

        Modal.renderResult({
          title: intl.formatMessage({
            id: "clear.data",
            defaultMessage: "Clear Data",
          }),
          resultTitle: intl.formatMessage(
            {
              id: "modal.clear.data.alert",
              defaultMessage: `{total} storage space is released.`,
            },
            {
              total: formatStorage(total),
            },
          ),
          resultType: "success",
        });
      },
    });
  };

  return (
    <DialogP3
      bannerMessage={intl.formatMessage({
        id: "BackupServer.modal.clear.data.alert.danger",
        defaultMessage:
          "Clean up invalid backup data that has been completely deleted and more storage space will be released.",
      })}
      title={intl.formatMessage({
        id: "modal.title.confirm.data.clear.BackupServerData",
        defaultMessage: "Clean up Data on Backup Storage?",
      })}
      resourceNames={(selectedList || []).map((r) => r.name)}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
};

export default ClearDataAction;
