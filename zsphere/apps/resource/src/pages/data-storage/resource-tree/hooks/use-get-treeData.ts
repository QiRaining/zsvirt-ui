import { useLazyQuery } from "@apollo/client";
import type { IconTypes } from "@zstack/icon";
import { fiberChannelLunList } from "@zstack/virtualization-resource/src/gql/fiber-channel-lun.gql";
import { fiberChannelStorageList } from "@zstack/virtualization-resource/src/gql/fiber-channel-storage.gql";
import { iscsiLunList } from "@zstack/virtualization-resource/src/gql/iscsi-lun.gql";
import { iscsiServerList } from "@zstack/virtualization-resource/src/gql/iscsi-server.gql";
import { nvmeLunList } from "@zstack/virtualization-resource/src/gql/nvme-lun.gql";
import { nvmeServerList } from "@zstack/virtualization-resource/src/gql/nvme-server.gql";
import type {
  TreeResourceType,
  VirtualizationDirDataNode,
} from "@zstack/zsphere-types";
import type { IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type {
  IscsiServerList,
  IscsiTargetInventory,
  NvmeServerList,
  NvmeTargetInventory,
} from "@zstack/zsphere-types/graphql";

import { updateTreeData } from "../../../../layouts/utils";
import { ROOT_UUID } from "./constant";
import type { TreeNodeOptions } from "./types";

type NavigationType = LeftNavType | TopTabType;

enum TopTabType {
  IscsiServer = "virtualization.iscsi.server",
  FiberChannelStorage = "virtualization.fiber.channel.storage",
  NvmeServer = "virtualization.nvme.server",
}

export const useGetTreeData = (
  onLoadKey: string,
  defaultQuery: IQuery = {},
  activeMenuKey: TopTabType,
  setLoading: (loading: boolean) => void,
  setIscsiServerTreeData: Function,
  setFiberChannelStorageTreeData: Function,
  setNvmeServerTreeData: Function,
) => {
  // 创建基础树节点
  const createTreeNode = (
    item: any,
    resourceType: TreeResourceType,
    options: TreeNodeOptions,
  ): VirtualizationDirDataNode => {
    const nodeName = item.name || item.iqn || item.nqn;

    return {
      title: nodeName,
      name: nodeName,
      key: item.uuid,
      parentUuid: options.parentUuid || ROOT_UUID,
      isLeaf: options.isLeaf ?? true,
      hideIcon: !options.icon,
      resourceType,
      children: options.children || [],
      attr: { ...item, iconType: options.icon },
    };
  };

  // 处理子节点
  const processChildren = (
    items: any[],
    resourceType: TreeResourceType,
    parentUuid: string,
  ): VirtualizationDirDataNode[] => {
    return (
      items.map((item) =>
        createTreeNode(item, resourceType, {
          parentUuid,
          isLeaf: true,
          hideIcon: true,
        }),
      ) || []
    );
  };

  // 处理列表数据转换为树形结构
  const handleList = (
    list: any[],
    resourceType: TreeResourceType,
    icon?: IconTypes,
  ) => {
    return list.map((item) => {
      let children: VirtualizationDirDataNode[] = [];
      let isLeaf = true;

      switch (resourceType) {
        case "iscsi-server":
          isLeaf = !item.iscsiTargets?.length;
          children =
            item.iscsiTargets?.map((iscsiTarget: IscsiTargetInventory) => ({
              ...createTreeNode(iscsiTarget, "iscsi-iqn", {
                parentUuid: item.uuid,
                isLeaf: !iscsiTarget.iscsiLuns?.length,
                children: processChildren(
                  iscsiTarget.iscsiLuns || [],
                  "iscsi-lun",
                  iscsiTarget?.uuid ?? "-1",
                ),
              }),
            })) || [];
          break;

        case "nvme-server":
          isLeaf = !item.nvmeTargets?.length;
          // 有挂载的集群才才是构建树
          children = item?.nvmeClusterRefs?.length
            ? item.nvmeTargets?.map((nvmeTarget: NvmeTargetInventory) => ({
                ...createTreeNode(nvmeTarget, "nvme-nqn", {
                  parentUuid: item.uuid,
                  isLeaf: !nvmeTarget.nvmeLuns?.length,
                  children: processChildren(
                    nvmeTarget.nvmeLuns || [],
                    "nvme-lun",
                    nvmeTarget?.uuid ?? "-1",
                  ),
                }),
              })) || []
            : [];
          break;

        case "fiber-channel-storage":
          isLeaf = !item.fiberChannelLuns?.length;
          children = processChildren(
            item.fiberChannelLuns || [],
            "fiber-channel-lun",
            item.uuid,
          );
          break;

        case "iscsi-iqn":
        case "iscsi-lun":
        case "fiber-channel-lun":
        case "nvme-nqn":
        case "nvme-lun":
          isLeaf = true;
          break;
      }

      return createTreeNode(item, resourceType, {
        icon,
        isLeaf,
        children,
        parentUuid: resourceType.includes("lun") ? onLoadKey : ROOT_UUID,
      });
    });
  };

  const [
    getIscsiServer,
    { data: iscsiServerListData, loading: iscsiServerListLoading },
  ] = useLazyQuery<{ iscsiServerList: IscsiServerList }>(iscsiServerList, {
    fetchPolicy: "no-cache",
    variables: defaultQuery,
    onCompleted(data) {
      const list = data?.iscsiServerList?.list ?? [];
      const treeData = handleList(list, "iscsi-server", "storage");
      setIscsiServerTreeData(treeData);
      setLoading(false);
    },
  });

  const [getLunList, { data: lunListData, loading: lunListLoading }] =
    useLazyQuery(iscsiLunList, {
      fetchPolicy: "no-cache",
      onCompleted(data) {
        const list = data?.iscsiLunList?.list ?? [];
        const newList = handleList(list, "iscsi-lun");
        setIscsiServerTreeData((origin: VirtualizationDirDataNode[]) =>
          updateTreeData(origin || [], onLoadKey, newList, false),
        );
        setLoading(false);
      },
    });

  const [
    getFiberChannelStorageList,
    {
      data: fiberChannelStorageListData,
      loading: fiberChannelStorageListLoading,
    },
  ] = useLazyQuery(fiberChannelStorageList, {
    fetchPolicy: "no-cache",
    variables: defaultQuery,
    onCompleted(data) {
      const list = data?.fiberChannelStorageList?.list ?? [];
      const newList = handleList(list, "fiber-channel-storage", "storage");
      setFiberChannelStorageTreeData(
        updateTreeData(newList, -1, newList, false),
      );
      setLoading(false);
    },
  });

  const [getFiberChannelLunListList, { data: _fiberChannelLunListData }] =
    useLazyQuery(fiberChannelLunList, {
      fetchPolicy: "no-cache",
      onCompleted(data) {
        const list = data?.fiberChannelLunList?.list ?? [];
        const newList = handleList(list, "fiber-channel-lun");
        setFiberChannelStorageTreeData((origin: VirtualizationDirDataNode[]) =>
          updateTreeData(origin || [], onLoadKey, newList, false),
        );
        setLoading(false);
      },
    });

  const [
    getNvmeServer,
    { data: _nvmeServerListData, loading: nvmeServerListLoading },
  ] = useLazyQuery<{ nvmeServerList: NvmeServerList }>(nvmeServerList, {
    fetchPolicy: "no-cache",
    variables: defaultQuery,
    onCompleted(data) {
      const list = data?.nvmeServerList?.list ?? [];
      const treeData = handleList(list, "nvme-server", "storage");
      setNvmeServerTreeData(treeData);
      setLoading(false);
    },
  });

  const [getNvmeLunList, { data: _nvmeLunListData }] = useLazyQuery(
    nvmeLunList,
    {
      fetchPolicy: "no-cache",
      onCompleted(data) {
        const list = data?.nvmeLunList?.list ?? [];
        const newList = handleList(list, "nvme-lun");
        setNvmeServerTreeData((origin: VirtualizationDirDataNode[]) =>
          updateTreeData(origin || [], onLoadKey, newList, false),
        );
        setLoading(false);
      },
    },
  );

  const loadTreeData = ({
    key,
    flag,
  }: {
    key: string;
    flag: TreeResourceType;
    activeMenuKey?: NavigationType;
  }) => {
    const queryMap: any = {
      "iscsi-server": () => getIscsiServer({ variables: defaultQuery }),
      "iscsi-iqn": () =>
        getLunList({
          variables: {
            conditions: [
              {
                key: "iscsiTargetUuid",
                op: Op.eq,
                value: key,
              },
            ],
          },
        }),
      "fiber-channel-storage": () =>
        getFiberChannelLunListList({
          variables: {
            conditions: [
              {
                key: "fiberChannelStorageUuid",
                value: key,
                op: Op.eq,
              },
            ],
          },
        }),
      "nvme-server": () => getNvmeServer({ variables: defaultQuery }),
      "nvme-nqn": () =>
        getNvmeLunList({
          variables: {
            conditions: [
              {
                key: "nvmeTargetUuid",
                value: key,
                op: Op.eq,
              },
            ],
          },
        }),
    };

    queryMap[flag]?.();
  };

  const currentActiveMenuLoadingMap = {
    [TopTabType.IscsiServer]: iscsiServerListLoading,
    [TopTabType.NvmeServer]: nvmeServerListLoading,
    [TopTabType.FiberChannelStorage]: fiberChannelStorageListLoading,
  };

  return {
    getIscsiServer,
    iscsiServerListData,
    iscsiServerListLoading,
    getLunList,
    lunListData,
    lunListLoading,
    getFiberChannelStorageList,
    fiberChannelStorageListData,
    fiberChannelStorageListLoading,
    getNvmeServer,
    loadTreeData,
    currentActiveMenuLoading: currentActiveMenuLoadingMap[activeMenuKey],
  };
};
