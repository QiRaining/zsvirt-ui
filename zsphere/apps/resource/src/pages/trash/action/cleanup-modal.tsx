import { gql } from "@apollo/client";
import { Modal } from "@zstack/zsphere-components";
import { DialogP0 } from "@zstack/zsphere-design-biz";
import type { ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { TrashQueryType } from "@zstack/zsphere-types";
import type { Trash as ITrash } from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import React from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

const cleanUpTrashList = gql`
  mutation cleanUpTrashList($input: CleanUpTrashListInput!) {
    cleanUpTrashList(input: $input) {
      actionId
    }
  }
`;

interface IInventory {
  size: number;
}

const Action: React.FC<IActionWrapperProps<ITrash>> = ({
  visible,
  setVisible,
  refetch,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";

  const onOk = async () => {
    // storageType字段 区分 PrimaryStorage/BackupStorage 类型
    const type =
      selectedList?.[0].storageType === "PrimaryStorageVO"
        ? TrashQueryType.PrimaryStorage
        : TrashQueryType.BackupStorage;

    // uuid 是主存储或镜像服务器UUID
    const payload = selectedList?.map((item: ITrash) => {
      return {
        type,
        uuid,
        trashId: item.uuid,
      };
    });
    // 收集每一次的返回结果
    const inventoriesResult: IInventory[] = [];
    doAction({
      mutation: cleanUpTrashList,
      payload,
      name: intl.formatMessage({
        id: "trash.storageMigrateOriginalData",
        defaultMessage: "Cleanup Raw Data of Storage Migrated Resource",
      }),
      total: selectedList.length,
      onProgress: (result: ITaskResult) => {
        if (result.inventory) {
          inventoriesResult.push(result.inventory);
        }
      },
      onFinish: () => {
        if (inventoriesResult.length === 0) {
          return;
        }
        const total = inventoriesResult?.reduce<number>((sum, curr) => {
          return sum + curr.size;
        }, 0);

        Modal.renderResult({
          title: intl.formatMessage({
            id: "clear.data",
            defaultMessage: "Clear Data",
          }),
          resultTitle: intl.formatMessage(
            {
              id: "trash.modal.releaseSpace.alert",
              defaultMessage: "{total} storage space is released.",
            },
            {
              total: formatStorage(total),
            },
          ),
          resultType: "success",
          okText: intl.formatMessage({ id: "ok", defaultMessage: "OK" }),
          onOk() {
            refetch?.();
          },
        });
      },
    });
    setSelectedList?.([]);
  };

  return (
    <DialogP0
      bannerMessage={intl.formatMessage({
        id: "trash.modal.cleanup.alert.danger",
        defaultMessage:
          "Make sure that the storage migrated data is intact. Cleaning up raw data will make the data unrecoverable. Please exercise caution.",
      })}
      title={intl.formatMessage({
        id: "backupStorage.modal.title.confirm.trash.storageMigrateOriginalData",
        defaultMessage: "Cleanup Raw Data of Storage Migrated Resource?",
      })}
      resourceNames={(selectedList as any).map(
        (r: any) => r.name ?? r.resourceUuid,
      )}
      visible={visible}
      setVisible={setVisible}
      onConfirm={() => {
        onOk();
      }}
      confirmText={intl.formatMessage({
        id: "ok.cleanup",
        defaultMessage: "Confirmation Cleanup",
      })}
      guide={{
        confirmWord: "Clean up",
      }}
    />
  );
};

export default Action;
