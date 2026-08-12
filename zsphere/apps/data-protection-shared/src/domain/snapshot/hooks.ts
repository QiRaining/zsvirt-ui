import { gql, useLazyQuery } from "@apollo/client";
import type { IconTypes } from "@zstack/icon";
import type { VirtualizationDirDataNode } from "@zstack/zsphere-types";
import { createContext } from "react";

import type { DisplayLocationType, ISnapShotContext } from "./types";
import { transformData } from "./utils";

export const SnapshotContext = createContext<ISnapShotContext>({
  store: {},
  setStore: () => {},
});

const getZSVSnapshotGroupVMList = gql`
  query getZSVSnapshotGroupVMList($conditions: [Condition!], $sortBy: String) {
    zsvSnapshotGroupList(conditions: $conditions, sortBy: $sortBy) {
      total
      list {
        volumeUuid
        count
        size
        vm {
          uuid
          name
          state
          rootVolumeUuid
          type
          attachedShareableVolumeUuidList
          haveScsiLun
          zoneUuid
          allVolumes {
            uuid
            name
            primaryStorageUuid
            size
            actualSize
            isShareable
            type
            installPath
            primaryStorage {
              type
              uuid
            }
          }
        }
      }
    }
  }
`;

const getZSVSnapshotTree = gql`
  query getZSVSnapshotTree($conditions: [Condition!]) {
    zsvVolumeSnapshotTree(conditions: $conditions) {
      list {
        uuid
        volumeUuid
        tree
        current
        volume {
          uuid
          name
          state
          vmInstance {
            uuid
            name
            state
            type
          }
        }
        primaryStorageUuid
      }
    }
  }
`;

export const updateTreeData = (
  list: VirtualizationDirDataNode[],
  key: React.Key,
  children: VirtualizationDirDataNode[],
  loadStatus: boolean,
): VirtualizationDirDataNode[] =>
  list.map((node) => {
    if (node.key === key) {
      return {
        ...node,
        expandLoading: loadStatus,
        children,
      };
    }
    if (node.children) {
      return {
        ...node,
        children: updateTreeData(node.children, key, children, loadStatus),
      };
    }
    return node;
  });

export const useGetData = (
  setVmData: Function,
  setSnapshotData: Function,
  setLoading: Function,
  displayLocation?: DisplayLocationType,
) => {
  const transformList = (list: any[], resourceType: any, icon: IconTypes) => {
    const newList = list.map((t: any) => {
      const parentUuid = "-1";
      const { vm } = t || {};
      return {
        title: vm?.name,
        key: vm?.uuid,
        snapshotCount: t?.count,
        snapshotSize: t?.size,
        volumeUuid: vm?.rootVolumeUuid,
        allVolumes: vm?.allVolumes,
        attachedShareableVolumeUuidList: vm?.attachedShareableVolumeUuidList,
        state: vm?.state,
        haveScsiLun: vm?.haveScsiLun,
        attr: {
          state: vm?.state,
          rootVolumeUuid: vm?.rootVolumeUuid,
          iconType: icon,
        },
        children: [],
        parentUuid,
        resourceType,
      };
    });
    return newList as any[];
  };

  const [
    getSnapshotTree,
    { data: snapShotTreeData, loading: snapShotTreeLoading },
  ] = useLazyQuery(getZSVSnapshotTree, {
    fetchPolicy: "no-cache",
    onCompleted(data) {
      const treeList: any = [];
      const snapshotTreeList = data?.zsvVolumeSnapshotTree?.list ?? [];
      if (snapshotTreeList.length) {
        snapshotTreeList.forEach((item: any) => {
          treeList.push({
            current: item.current,
            tree: JSON.parse(item?.tree),
          });
        });
      }

      const transformTree = transformData(treeList);
      setSnapshotData(transformTree);
    },
  });

  const [getVmList, { data: vmListData, loading: vmListLoading }] =
    useLazyQuery(getZSVSnapshotGroupVMList, {
      fetchPolicy: "no-cache",
      onCompleted(data) {
        const vmList = data?.zsvSnapshotGroupList?.list?.filter(
          (t: any) => t.vm,
        );
        const list = transformList(vmList, "vm", "monitor");
        setVmData(updateTreeData(list, "-1", list, false));
        setLoading(false);
      },
    });
  const loading =
    displayLocation === "detail" ? snapShotTreeLoading : vmListLoading;

  return {
    getVmList,
    vmListData,
    getSnapshotTree,
    snapShotTreeData,
    loading,
    snapShotTreeLoading,
  };
};
