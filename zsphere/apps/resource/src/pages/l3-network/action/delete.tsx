import { gql, useLazyQuery } from "@apollo/client";
import { Button } from "@zstack/design";
import { DELETE_L2_NETWORKS } from "@zstack/virtualization-resource/src/gql/l2-network.gql";
import { DialogBase, DialogP0, DialogWeak } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { l2NetworkType, WithMemoryByResourceType } from "@zstack/zsphere-types";
import type { L3Network as IL3Network } from "@zstack/zsphere-types/graphql";
import { differenceBy } from "lodash-es";
import React, { useState, useMemo, useEffect } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";

const GET_MEMORY_SNAP_BY_L3NetWork_List = gql`
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
const Action: React.FC<
  IActionWrapperProps<IL3Network> & { refetchType?: string }
> = ({
  refetchType,
  position,
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const navigate = useNavigate();
  const [nextVisible, setNextVisible] = useState(false);
  const _current = selectedList[0];
  const [query, { data, loading }] = useLazyQuery(
    GET_MEMORY_SNAP_BY_L3NetWork_List,
    {
      fetchPolicy: "no-cache",
    },
  );
  useEffect(() => {
    if (visible) {
      query({
        variables: {
          uuids: selectedList?.map((item) => item?.uuid) ?? [],
          type: WithMemoryByResourceType.L3NetworkVO,
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
  const flat = {
    actionName: intl.formatMessage({
      id: "delete.flatNetwork",
      defaultMessage: "Delete Distributed Port Group",
    }),
    title: intl.formatMessage({
      id: "l3Network.modal.title.confirm.delete.flatNetwork",
      defaultMessage: "Delete Distributed Port Group?",
    }),
    alertMessage: intl.formatMessage({
      id: "flatNetwork.modal.delete.alert.danger",
      defaultMessage: `Deleting a distributed port group detaches the VM NICs that are using this network.`,
    }),
    resourceName: intl.formatMessage({
      id: "flatNetwork",
      defaultMessage: "Flat Network",
    }),
    needConfirm: true,
  };

  const { actionName, alertMessage, resourceName, needConfirm, title } = flat;
  // typeMap[(l3NetworkType as 'flow') || 'flat']

  const onOk = async () => {
    setVisible(false);

    doAction({
      mutation: DELETE_L2_NETWORKS,
      payload: newList.map(({ uuid }) => ({
        uuid,
        l2NetworkType: l2NetworkType.PortGroup,
      })),
      name: actionName,
      total: newList.length ?? 1,
      type: refetchType ?? "L3Network",
      onFinish: () => setSelectedList?.([]),
    });

    if (
      position === "header" &&
      localStorage.getItem("currentEnv") !== `"virtualization"`
    ) {
      navigate(-1);
    }
  };
  const deleteNetWorkTitle = React.useMemo(() => {
    return intl.formatMessage({
      id: "flat.network.modal.delete.alert.warning.with.snap.memory",
      defaultMessage: "Cannot Delete Distributed Port Group",
    });
  }, [intl]);

  const snapMemoryMessage = React.useMemo(() => {
    return intl.formatMessage({
      id: "l3network.modal.delete.snap.memory.network.single",
      defaultMessage:
        "You cannot delete a distributed port group if it is captured by a VM memory snapshot. Delete the snapshot and try again.",
    });
  }, [intl]);

  const WithNextModalMessage = React.useMemo(() => {
    return intl.formatMessage({
      id: "flat.network.delete.message.warning.with.next.modal",
      defaultMessage:
        "Some flat networks are referenced by a VM memory snapshot. Delete the snapshot and try again.",
    });
  }, [intl]);

  const selectMessage = intl.formatMessage({
    id: "volume.modal.delete.following.snapshot.first",
    defaultMessage: "Delete the following snapshots first:",
  });
  const selectNextMessage = intl.formatMessage(
    {
      id: "l3network.modal.delete.blocked.count.message",
      defaultMessage: "You cannot perform this operation on these {count} items:",
    },
    { count: memorySnapshotList?.length },
  );
  if (loading) {
    return <></>;
  }

  // 无法删除提示，有"跳过并继续"
  const WithNextModalActionTips = (
    <DialogBase
      visible={visible}
      setVisible={setVisible}
      title={String(deleteNetWorkTitle)}
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
      {WithNextModalMessage}
    </DialogBase>
  );

  //无法删除提示
  const ModalActionTips = (
    <DialogWeak
      visible={visible}
      setVisible={setVisible}
      type="warning"
      title={String(deleteNetWorkTitle)}
      onConfirm={() => setVisible(false)}
      description={snapMemoryMessage}
    />
  );
  //单选-被内存快照云主机引用
  if (selectedList.length === 1 && memorySnapshotList?.length) {
    return <>{ModalActionTips}</>;
  }

  //多选
  if (selectedList.length > 1 && memorySnapshotList?.length) {
    // 如果所有端口组都不能删除，显示DialogWeak
    if (withMemorySnapShotResourceList.length === selectedList.length) {
      return (
        <DialogWeak
          visible={visible}
          setVisible={setVisible}
          type="warning"
          title={String(deleteNetWorkTitle)}
          onCancel={() => setVisible(false)}
          onConfirm={() => setVisible(false)}
          description={intl.formatMessage({
            id: "l3network.modal.delete.all.snap.memory.network.tips",
            defaultMessage:
              "You cannot delete a distributed port group if it is captured by a VM memory snapshot. Delete the snapshot and try again.",
          })}
        />
      );
    }
    return (
      <>
        {WithNextModalActionTips}
        <DialogP0
          onConfirm={onOk}
          visible={nextVisible}
          setVisible={setVisible}
          title={title}
          bannerMessage={alertMessage}
          resourceType={resourceName}
          resourceNames={newList.map((r) => r.name ?? r.uuid)}
          guide={intl.formatMessage({ id: "delete", defaultMessage: "Delete" })}
        />
      </>
    );
  }

  return (
    <DialogP0
      onConfirm={onOk}
      visible={visible}
      setVisible={setVisible}
      title={title}
      bannerMessage={alertMessage}
      resourceType={resourceName}
      resourceNames={selectedList.map((r) => r.name ?? r.uuid)}
      guide={intl.formatMessage({ id: "delete", defaultMessage: "Delete" })}
    />
  );
};

export default Action;
