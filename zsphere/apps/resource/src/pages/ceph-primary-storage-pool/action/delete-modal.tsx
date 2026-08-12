import { gql } from "@apollo/client";
import { Button } from "@zstack/design";
import { DialogBase, DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { CephPrimaryStoragePool as ICephPrimaryStoragePool } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const deleteCephPrimaryStoragePoolList = gql`
  mutation deleteCephPrimaryStoragePoolList(
    $input: DeleteCephPrimaryStoragePoolListInput!
  ) {
    deleteCephPrimaryStoragePoolList(input: $input) {
      actionId
    }
  }
`;

const DeleteModal: React.FC<IActionWrapperProps<ICephPrimaryStoragePool>> = ({
  refetch,
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [nextActionVisible, setNextActionVisible] = React.useState<
    null | "skipAction" | "deleteAction"
  >(null);

  const canNotDeletedDataPools = selectedList.filter(
    (pool) => Number(pool.totalCapacity) - Number(pool.availableCapacity) > 0,
  );
  const canDeletedDataPools = selectedList.filter(
    (pool) => Number(pool.totalCapacity) - Number(pool.availableCapacity) <= 0,
  );

  React.useEffect(() => {
    const initAction = () => {
      // 选择的 pool 都是可以删除的，显示删除弹窗
      if (canNotDeletedDataPools.length === 0) {
        return "deleteAction";
      }

      // 选择的 pool 中有可删的，也有不能删除的，显示提示弹窗，这里不存在选择的都是可以删除的 pool，因为这种情况按钮事先就被禁用了
      return "skipAction";
    };
    setNextActionVisible(initAction());
  }, [selectedList]);

  const onOk = async () => {
    doAction({
      mutation: deleteCephPrimaryStoragePoolList,
      payload: canDeletedDataPools?.map((item) => ({ uuid: item.uuid })),
      name: intl.formatMessage({
        id: "delete.cephPrimaryStoragePool",
        defaultMessage: "Delete Storage Pool",
      }),
      total: 1,
      onFinish: () => {
        refetch?.();
        setVisible(false);
        setSelectedList?.([]);
      },
    });
  };

  return (
    <>
      <DialogBase
        title={String(
          intl.formatMessage({
            id: "cephPrimaryStoragePool.modal_title.can_not_delete",
            defaultMessage: "Cannot delete storage pool.",
          }),
        )}
        visible={visible && nextActionVisible === "skipAction"}
        setVisible={setVisible}
        footer={
          <>
            <Button
              variant="link"
              onClick={() => {
                setVisible(false);
              }}
            >
              {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setNextActionVisible("deleteAction");
              }}
            >
              {intl.formatMessage({
                id: "skipAndContinue",
                defaultMessage: "Skip and Continue",
              })}
            </Button>
          </>
        }
      >
        {intl.formatMessage({
          id: "cephPrimaryStoragePool.modal.can_not_delete.alert.danger",
          defaultMessage: "Data detected in storage pool, cannot be deleted...",
        })}
      </DialogBase>
      <DialogP3
        bannerMessage={intl.formatMessage({
          id: "cephPrimaryStoragePool.modal.delete.alert.danger",
          defaultMessage:
            "Deleting a storage pool removes all records of the resources stored in the pool. Proceed with caution.",
        })}
        title={intl.formatMessage({
          id: "cephPrimaryStoragePool.modal.title.confirm.delete.cephPrimaryStoragePool",
          defaultMessage: "Delete Storage Pool?",
        })}
        resourceType={intl.formatMessage({
          id: "cephPrimaryStoragePool",
          defaultMessage: "Storage Pool",
        })}
        resourceNames={
          canDeletedDataPools?.map((pool) => pool.poolName ?? pool.uuid) || []
        }
        visible={visible && nextActionVisible === "deleteAction"}
        setVisible={setVisible}
        onConfirm={onOk}
      />
    </>
  );
};

export default DeleteModal;
