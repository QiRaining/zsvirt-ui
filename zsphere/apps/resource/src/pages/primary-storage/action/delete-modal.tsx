import { gql } from "@apollo/client";
import { Button } from "@zstack/design";
import {
  DialogBase,
  DialogP0Smart,
  DialogWeak,
} from "@zstack/zsphere-design-biz";
import { useAction, useSensitiveJudge } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { PrimaryStorageVO as IPrimaryStorage } from "@zstack/zsphere-types/graphql";
import { sumBy } from "lodash-es";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";

const deletePrimaryStorageList = gql`
  mutation deletePrimaryStorageList($input: DeletePrimaryStorageListInput!) {
    deletePrimaryStorageList(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IPrimaryStorage>> = ({
  view,
  position,
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const [nextVisible, setNextVisible] = useState(false);
  const doAction = useAction();
  const navigate = useNavigate();

  const needValidate = useSensitiveJudge(); //***处理敏感操作***
  const attachedClusterList = selectedList?.filter((item: IPrimaryStorage) => {
    return item?.attachedClusterUuids?.length;
  });
  const noAttachedClusterList = selectedList?.filter(
    (item: IPrimaryStorage) => {
      return !item?.attachedClusterUuids?.length;
    },
  );

  const hasSharedBlockType = useMemo(() => {
    return selectedList?.some((cv) => cv?.type === "SharedBlock");
  }, [selectedList]);
  const onOk = () => {
    const payloadSelectedList = selectedList
      .filter((item: IPrimaryStorage) => {
        return !item?.attachedClusterUuids?.length;
      })
      .map((item: IPrimaryStorage) => ({ uuid: item.uuid }));

    doAction({
      mutation: deletePrimaryStorageList,
      payload: payloadSelectedList,
      name: intl.formatMessage({
        id: "delete.primaryStorage",
        defaultMessage: "Delete Data Storage",
      }),
      total: payloadSelectedList.length,
      type: "PrimaryStorageVO",
      onFinish: () => {
        setSelectedList?.([]);
      },
    });
    if (
      view === "main" &&
      position === "header" &&
      localStorage.getItem("currentEnv") !== `"virtualization"`
    ) {
      navigate(-1);
    }
  };

  const linkedResourceMessage = hasSharedBlockType
    ? intl.formatMessage(
        {
          id: "associatedCount.vm.volume.baremetal2Instances.and.primaryStorage",
          defaultMessage:
            "{vmInstanceCount} VMs, {baremetal2InstancesCount} elastic baremetal instances, and {volumeCount} disks ",
        },
        {
          vmInstanceCount: sumBy(noAttachedClusterList, "vmInstanceCount"),
          volumeCount: sumBy(noAttachedClusterList, "volumeCount"),
          baremetal2InstancesCount: sumBy(
            noAttachedClusterList,
            "baremetal2InstancesCount",
          ),
        },
      )
    : intl.formatMessage(
        {
          id: "associatedCount.vm.volume.and.primaryStorage",
          defaultMessage: "{vmInstanceCount} VMs and {volumeCount} disks ",
        },
        {
          vmInstanceCount: sumBy(noAttachedClusterList, "vmInstanceCount"),
          volumeCount: sumBy(noAttachedClusterList, "volumeCount"),
        },
      );

  const alertMessage = hasSharedBlockType
    ? intl.formatMessage({
        id: "primaryStorage.modal.delete.alert.danger.case1",
        defaultMessage:
          "Deleting a primary storage also deletes all the resources on the primary storage, including the virtual machines, elastic baremetal instances, volumes, and snapshots. Please exercise caution.",
      })
    : intl.formatMessage({
        id: "primaryStorage.modal.delete.alert.danger",
        defaultMessage:
          "Deleting a data storage also deletes all the resources on the data storage, including the virtual machines, disks, and snapshots. Proceed with caution.",
      });

  // 无法删除提示，没有"跳过并继续"
  const NoNextModalActionTips = (
    <DialogWeak
      visible={visible}
      setVisible={setVisible}
      type="warning"
      title={String(
        intl.formatMessage({
          id: "primaryStorage.title.modal.cannot.delete.primaryStorage",
          defaultMessage: "Cannot Delete Data Storage",
        }),
      )}
      onConfirm={() => setVisible(false)}
      footer={
        <Button variant="primary" onClick={() => setVisible(false)}>
          {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
        </Button>
      }
      description={intl.formatMessage({
        id: "primaryStorage.modal.cannot.delete.alert.info",
        defaultMessage:
          "Cannot delete the data storage, because it is attached to a cluster. Detach it from the cluster and try again.",
      })}
    />
  );

  // 无法删除提示，有"跳过并继续"
  const WithNextModalActionTips = (
    <DialogBase
      visible={visible}
      setVisible={setVisible}
      title={String(
        intl.formatMessage({
          id: "hint",
          defaultMessage: "Notice",
        }),
      )}
      footer={
        <>
          <Button key="back" variant="link" onClick={() => setVisible(false)}>
            {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
          </Button>
          <Button
            key="submit"
            variant="primary"
            onClick={() => setNextVisible(true)}
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
        id: "primaryStorage.modal.cannot.delete.alert.info",
        defaultMessage:
          "Cannot delete the data storage, because it is attached to a cluster. Detach it from the cluster and try again.",
      })}
    </DialogBase>
  );

  // 下一步 删除弹窗
  const DeleteModalActionCon = (
    <DialogP0Smart
      visible={nextVisible}
      setVisible={setNextVisible}
      bannerMessage={alertMessage}
      title={intl.formatMessage({
        id: "primaryStorage.modal.title.confirm.delete.primaryStorage",
        defaultMessage: "Delete Data Storage?",
      })}
      resourceType={intl.formatMessage({
        id: "primaryStorage",
        defaultMessage: "Data Storage",
      })}
      resourceNames={noAttachedClusterList.map((r) => r.name ?? r.uuid)}
      linkedResourceMessage={linkedResourceMessage}
      onConfirm={onOk}
      needValidate={needValidate}
    />
  );

  /**
   * 存在已加载集群的主存储
   * 1. 提示 -> 确定：无法进行下一步删除操作，所选主存储都加载了集群
   * 2. 提示 -> 下一步：可以进行下一步删除操作，所选主存储存在加载集群的
   *
   */
  if (attachedClusterList.length > 0) {
    if (selectedList.length === attachedClusterList.length) {
      return (
        <>
          {NoNextModalActionTips}
          {DeleteModalActionCon}
        </>
      );
    }
    return (
      <>
        {WithNextModalActionTips}
        {DeleteModalActionCon}
      </>
    );
  }

  // 不存在已加载集群的主存储，可直接删除
  return (
    <DialogP0Smart
      visible={visible}
      setVisible={setVisible}
      bannerMessage={alertMessage}
      title={intl.formatMessage({
        id: "primaryStorage.modal.title.confirm.delete.primaryStorage",
        defaultMessage: "Delete Data Storage?",
      })}
      resourceType={intl.formatMessage({
        id: "primaryStorage",
        defaultMessage: "Data Storage",
      })}
      resourceNames={noAttachedClusterList.map((r) => r.name ?? r.uuid)}
      linkedResourceMessage={linkedResourceMessage}
      onConfirm={onOk}
      needValidate={needValidate}
    />
  );
};

export default Action;
