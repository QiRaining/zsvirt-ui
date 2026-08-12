import { gql, useLazyQuery } from "@apollo/client";
import { Button } from "@zstack/design";
import { DELETE_L2_NETWORKS } from "@zstack/virtualization-resource/src/gql/l2-network.gql";
import { DialogBase, DialogP0Smart } from "@zstack/zsphere-design-biz";
import { useAction, useSensitiveJudge } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { l2NetworkType, WithMemoryByResourceType } from "@zstack/zsphere-types";
import type { L2Network } from "@zstack/zsphere-types/graphql";
import { differenceBy } from "lodash-es";
import React, { useState, useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

const GET_MEMORY_SNAP_BY_L2NetWork_List = gql`
  query getMemorySnapshotByResource(
    $uuids: [String!]!
    $type: WithMemoryByResourceType!
  ) {
    getMemorySnapshotByResource(uuids: $uuids, type: $type) {
      memorySnapshotList {
        name
      }
      withMemorySnapShotResourceList {
        uuid
        name
      }
    }
  }
`;

const Action: React.FC<IActionWrapperProps<L2Network>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const needValidate = useSensitiveJudge();
  const [nextVisible, setNextVisible] = useState(false);
  const [query, { data, loading }] = useLazyQuery(
    GET_MEMORY_SNAP_BY_L2NetWork_List,
    {
      fetchPolicy: "no-cache",
    },
  );
  useEffect(() => {
    if (visible) {
      query({
        variables: {
          uuids: selectedList?.map((item) => item?.uuid) ?? [],
          type: WithMemoryByResourceType.L2NetworkVO,
        },
      });
    }
  }, [visible]);

  const { memorySnapshotList = [], withMemorySnapShotResourceList = [] } =
    data?.getMemorySnapshotByResource ?? [];
  const portGroupUuids =
    withMemorySnapShotResourceList?.map((item: { uuid: any }) => item.uuid) ||
    [];
  const newList = useMemo(
    () =>
      differenceBy(
        selectedList,
        (portGroupUuids ?? []).map((uuid: any) => ({ uuid })),
        "uuid",
      ),
    [selectedList, portGroupUuids],
  );
  const onOk = () => {
    setVisible(false);

    doAction({
      mutation: DELETE_L2_NETWORKS,
      payload: newList.map((item) => ({
        uuid: item.uuid,
        l2NetworkType: l2NetworkType.VirtualSwitch,
      })),
      name: intl.formatMessage({
        id: "delete.l2Network",
        defaultMessage: "Delete Distributed Switch",
      }),
      total: newList.length ?? 1,
      type: "L2Network",
      onFinish: () => setSelectedList?.([]),
    });
  };

  const deleteL2NetworkTitle = intl.formatMessage({
    id: "l2network.modal.delete.alert.warning.with.snap.memory",
    defaultMessage: "Cannot Delete Distributed Switch",
  });

  const withNextModalMessage = intl.formatMessage({
    id: "l2network.delete.message.warning.with.next.modal",
    defaultMessage:
      "You cannot deleta the distributed switch when it is the default distributed switch or its distributed port groups are captured by a memory snapshot.",
  });
  const singleSnapMemoryMessage = intl.formatMessage({
    id: "l2network.modal.delete.all.snap.memory.network.tips",
    defaultMessage:
      "You cannot delete a distributed switch if distributed pot groups under the distributed switch are captured by a VM memory snapshot. Delete the snapshot and try again.",
  });
  const allSnapMemoryMessage = intl.formatMessage({
    id: "l2network.modal.delete.all.snap.memory.network.tips",
    defaultMessage:
      "You cannot delete a distributed switch if distributed pot groups under the distributed switch are captured by a VM memory snapshot. Delete the snapshot and try again.",
  });

  const selectNextMessage = intl.formatMessage(
    {
      id: "l2network.modal.delete.blocked.count.message",
      defaultMessage: "You cannot perform this operation on these {count} items:",
    },
    { count: memorySnapshotList?.length },
  );

  const deleteAlertMessage = intl.formatMessage({
    id: "delete.l2Network.alert",
    defaultMessage:
      "Deleting the distributed switch will remove its associated distributed port groups and detach the NICs of the corresponding virtual machines. Proceed with caution.",
  });

  const deleteTitle = intl.formatMessage({
    id: "l2Network.modal.title.confirm.delete.l2Network",
    defaultMessage: "Delete Distributed Switch?",
  });

  const deleteResourceName = intl.formatMessage({
    id: "l2Network",
    defaultMessage: "Distributed Switch",
  });

  const WithNextModalActionTips = (
    <DialogBase
      visible={visible}
      setVisible={setVisible}
      title={String(deleteL2NetworkTitle)}
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
      {withNextModalMessage}
    </DialogBase>
  );
  if (loading) {
    return <></>;
  }

  // 单选 - 被内存快照引用
  if (selectedList?.length == 1 && memorySnapshotList?.length) {
    return (
      <DialogBase
        visible={visible}
        setVisible={setVisible}
        title={String(deleteL2NetworkTitle)}
        footer={
          <Button variant="primary" onClick={() => setVisible(false)}>
            {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
          </Button>
        }
      >
        {singleSnapMemoryMessage}
      </DialogBase>
    );
  }

  // 多选
  if (selectedList?.length > 1 && memorySnapshotList?.length) {
    // 如果所有交换机都不能删除，显示DialogBase
    if (withMemorySnapShotResourceList?.length === selectedList?.length) {
      return (
        <DialogBase
          visible={visible}
          setVisible={setVisible}
          title={String(deleteL2NetworkTitle)}
          footer={
            <Button variant="primary" onClick={() => setVisible(false)}>
              {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
            </Button>
          }
        >
          {allSnapMemoryMessage}
        </DialogBase>
      );
    }
    // 如果部分交换机可以删除，显示跳过逻辑
    return (
      <>
        {WithNextModalActionTips}
        <DialogP0Smart
          onConfirm={onOk}
          visible={nextVisible}
          setVisible={setVisible}
          title={deleteTitle}
          bannerMessage={deleteAlertMessage}
          resourceType={deleteResourceName}
          resourceNames={newList.map((r) => r.name ?? r.uuid)}
          needValidate={needValidate}
        />
      </>
    );
  }

  return (
    <DialogP0Smart
      visible={visible}
      setVisible={setVisible}
      bannerMessage={deleteAlertMessage}
      title={deleteTitle}
      resourceType={deleteResourceName}
      resourceNames={(selectedList ?? []).map((r) => r.name ?? r.uuid)}
      onConfirm={onOk}
      needValidate={needValidate}
    />
  );
};

export default Action;
