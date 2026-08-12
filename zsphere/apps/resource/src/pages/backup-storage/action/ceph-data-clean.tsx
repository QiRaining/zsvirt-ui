import { gql, useQuery } from "@apollo/client";
import { Button } from "@zstack/design";
import { trashList } from "@zstack/virtualization-resource/src/gql/trash.gql";
import TrashList from "@zstack/virtualization-resource/src/pages/trash/list";
import { ModalSelect } from "@zstack/zsphere-components";
import { Modal } from "@zstack/zsphere-components";
import { DialogP0, DialogWeak } from "@zstack/zsphere-design-biz";
import type { ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { Op, TrashQueryType as ITrashQueryType } from "@zstack/zsphere-types";
import type {
  BackupStorage as IBackupStorage,
  Trash as ITrash,
} from "@zstack/zsphere-types/graphql";
import { bus, formatStorage } from "@zstack/zsphere-utils";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";

interface IInventory {
  size: number;
}
const CephDataDataClean: React.FC<
  IActionWrapperProps<IBackupStorage> & { trashQueryType: ITrashQueryType }
> = ({
  refetch,
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  trashQueryType,
}) => {
  const intl = useIntl();
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedTrashList, setSelectedTrashList] = useState<ITrash[]>([]);
  const current = selectedList?.[0];
  const defaultQuery = useMemo(() => {
    return {
      conditions: [
        {
          key: "uuid",
          value: current?.uuid,
          op: Op.eq,
        },
      ],
      type: ITrashQueryType.BackupStorage,
    };
  }, [current?.uuid]);

  const { data: trashData, loading } = useQuery(trashList, {
    variables: { ...defaultQuery },
  });

  const cleanUpTrashList = gql`
    mutation cleanUpTrashList($input: CleanUpTrashListInput!) {
      cleanUpTrashList(input: $input) {
        actionId
      }
    }
  `;
  const doAction = useAction();

  const onOk = (values: ITrash[]) => {
    setConfirmModalVisible(true);
    setSelectedTrashList(values);
  };
  const onSubmit = () => {
    const payload = selectedTrashList?.map((item: ITrash) => {
      return {
        type: trashQueryType,
        uuid: current?.uuid,
        trashId: item.uuid,
      };
    });
    const inventoriesResult: IInventory[] = [];
    doAction({
      mutation: cleanUpTrashList,
      payload,
      name: intl.formatMessage({
        id: "trash.storageMigrateOriginalData",
        defaultMessage: "Cleanup Raw Data of Storage Migrated Resource",
      }),
      total: selectedTrashList?.length,
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
            id: `clear.data`,
            defaultMessage: "Clear Data",
          }),
          resultTitle: intl.formatMessage(
            {
              id: `trash.modal.releaseSpace.alert`,
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
            bus.emit("action:refetch:Trash", refetch);
          },
        });
      },
    });
    setVisible(false);
    setConfirmModalVisible(false);
    setSelectedList?.([]);
    setSelectedTrashList([]);
  };
  if (loading) {
    return <></>;
  }
  if (trashData?.trashList?.total < 1) {
    return (
      <DialogWeak
        title={String(
          intl.formatMessage({
            id: "backupStorage.ceph.modal.no.trashData.alert.info",
            defaultMessage: "No data can be cleaned.",
          }),
        )}
        type="warning"
        onConfirm={() => setVisible(false)}
        visible={visible}
        setVisible={setVisible}
        footer={
          <Button variant="primary" onClick={() => setVisible(false)}>
            {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
          </Button>
        }
      />
    );
  }

  return (
    <>
      <ModalSelect
        title={intl.formatMessage({
          id: "select.trash.data",
          defaultMessage: "Select Data",
        })}
        visible={visible}
        selectType="checkbox"
        showSelect={false}
        setVisible={setVisible}
        onOk={onOk}
      >
        <TrashList view="select" defaultQuery={defaultQuery} />
      </ModalSelect>
      <DialogP0
        title={intl.formatMessage({
          id: "backupStorage.ceph.modal.clean.confirm.alert.title",
          defaultMessage: "Cleanup Data?",
        })}
        bannerMessage={intl.formatMessage({
          id: "backupStorage.ceph.modal.clean.confirm.alert.content",
          defaultMessage:
            "Please confirm that the data has been stored intact and complete after migration. The original data cannot be restored once it has been cleaned up, please operate with caution...",
        })}
        resourceNames={selectedTrashList.map((r) => r.name ?? r.uuid)}
        visible={confirmModalVisible}
        setVisible={setConfirmModalVisible}
        confirmText={intl.formatMessage({
          id: "ok",
          defaultMessage: "OK",
        })}
        onConfirm={onSubmit}
      />
    </>
  );
};

export default CephDataDataClean;
