import { gql, useLazyQuery } from "@apollo/client";
import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { SnapshotType } from "@zstack/zsphere-types";
import type {
  VolumeSnapshot as IVolumeSnapshot,
  VolumeSnapshotGroup as IVolumeSnapshotGroup,
} from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import React, { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const deleteVolumeSnapshot = gql`
  mutation deleteVolumeSnapshot($input: DeleteVolumeSnapshotInput!) {
    deleteVolumeSnapshot(input: $input) {
      actionId
    }
  }
`;

const getSnapshotDeleteNeedSize = gql`
  query getSnapshotDeleteNeedSize($volumeUuid: String, $snapShotUuid: String) {
    getSnapshotDeleteNeedSize(
      volumeUuid: $volumeUuid
      snapShotUuid: $snapShotUuid
    ) {
      deleteNeedSize
    }
  }
`;

interface IProps extends IActionWrapperProps<
  IVolumeSnapshot | IVolumeSnapshotGroup
> {
  view: "main" | "sub.vm" | "sub.volume" | "sub.single" | "sub.group";
}

export interface ILocation {
  fromGroupDetail?: boolean;
  uuid?: string;
}

const DeleteAction: React.FC<IProps> = ({
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
  view,
}) => {
  const isSubSingleAction = /sub.*single/i.test(view);

  const intl = useIntl();

  const doAction = useAction();

  const [psNeedSize, setPSNeedSize] = useState(0);

  const [getSize] = useLazyQuery(getSnapshotDeleteNeedSize, {
    fetchPolicy: "network-only",
    onCompleted(data) {
      setPSNeedSize(data?.getSnapshotDeleteNeedSize?.deleteNeedSize);
    },
  });

  //获取删除快照需要的额外容量
  useEffect(() => {
    const prestSnapShot = selectedList.sort((pre, cur) => {
      return (
        new Date(pre.createDate as any).valueOf() -
        new Date(cur.createDate as any).valueOf()
      );
    })?.[0] as any;

    //快照组详情特殊处理
    const inDetailPrestSnapShot = Array.from(
      (selectedList?.[0] as any)?.volumeSnapshotRefs || [],
    )?.sort((pre: any, cur: any) => {
      return (
        new Date(pre.createDate as any).valueOf() -
        new Date(cur.createDate as any).valueOf()
      );
    })?.[0] as any;

    getSize({
      variables: {
        volumeUuid:
          prestSnapShot?.volumeUuid ||
          prestSnapShot?.vmInstance?.rootVolumeUuid,
        snapShotUuid:
          inDetailPrestSnapShot?.volumeSnapshotUuid || prestSnapShot?.uuid,
      },
    });
  }, [getSize, selectedList]);

  const vmName = intl.formatMessage({
    id: "vmInstance",
    defaultMessage: "Virtual Machine",
  });

  const containCephPS = useMemo(() => {
    return selectedList.some((t: any) => {
      const primaryStorageType =
        t?.vmInstance?.primaryStorage?.type || t?.primaryStorage?.type;
      return primaryStorageType === "Ceph";
    });
  }, [selectedList]);

  /**
   * zsv
   * 1. 需要区分是否是Ceph存储
   */

  const alarmMsg = useMemo(() => {
    //
    if (containCephPS) {
      return {
        title: intl.formatMessage({
          id: "is.ok.delete.virtual.machine.snapshot",
          defaultMessage: "Delete Snapshot?",
        }),
        alertMessage: intl.formatMessage(
          {
            id: "delete.containCephPS.volume.snapshotGroup.tip",
            defaultMessage: `1. Snapshots created on ZCE distributed storage are independent and do not have a tree-like structure. Deleting one snapshot will not affect other snapshots.
2. Deleting the current snapshot may consume I/O resources. Do not restart the management node service.`,
          },
          { psSize: formatStorage(psNeedSize) },
        ),
      };
    }
    return {
      title: intl.formatMessage({
        id: "is.ok.delete.virtual.machine.snapshot",
        defaultMessage: "Delete Snapshot?",
      }),
      alertMessage: intl.formatMessage(
        {
          id: "delete.volume.multiple.snapshotGroup.tip",
          defaultMessage: `1. Deleting the current snapshot also deletes snapshots on its branch. Please exercise caution.

2. Deleting the current snapshot consumes I/O bandwidth. Do not restart the management node service at this time.

3. The snapshot data is committed before it is deleted. This process occupies {psSize} of the data storage. If the data storage capacity is insufficient, you might fail to delete the snapshot.`,
        },
        { psSize: formatStorage(psNeedSize) },
      ),
    };
  }, [containCephPS, intl, psNeedSize]);

  const onOk = () => {
    setVisible(false);

    // 单个快照删除，都视为单盘快照删除，调用BatchDeleteVolumeSnapshot
    const type = isSubSingleAction
      ? SnapshotType.Single
      : selectedList[0].snapshotType;
    let uuids = selectedList.map((item) => item.uuid).reverse();
    if (type === SnapshotType.Group) {
      uuids = selectedList.map(
        (item) => (item as IVolumeSnapshot).groupUuid! || item.uuid,
      );
    }
    doAction({
      mutation: deleteVolumeSnapshot,
      payload: {
        uuids,
        type,
      },
      middleState: {
        type: "VolumeSnapshot",
        field: "status",
        data: { status: "Deleting" },
        uuids: selectedList.map((item) => item.uuid).reverse(),
      },
      name: intl.formatMessage(
        {
          id: "delete.vm.snapshot",
          defaultMessage: "Delete {vmName} Snapshot",
        },
        { vmName },
      ),
      total: 1,
      type: "snapshotList",
      onFinish: () => {},
    });
    setSelectedList?.([]);
  };

  return (
    <DialogP1
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
      title={alarmMsg.title}
      bannerMessage={
        <ReactMarkdown>{alarmMsg.alertMessage as string}</ReactMarkdown>
      }
      resourceType={intl.formatMessage({
        id: "snapshotGroup",
        defaultMessage: "Snapshot Group",
      })}
      resourceNames={selectedList.map((r) => r.name)}
    />
  );
};

export default DeleteAction;
