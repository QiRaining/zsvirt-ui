import { LeftNavType, NavView, VirRscTreeType } from "@zstack/zsphere-types";
import type {
  ActionTaskResult,
  VMGroupDirectory,
} from "@zstack/zsphere-types/graphql";
import { useEffect } from "react";
import type { IntlShape } from "react-intl";
import type { Subject } from "rxjs";
import { filter } from "rxjs/operators";

export const getTreeList = (
  list: VMGroupDirectory[],
  key: string,
): VMGroupDirectory[] => {
  return list
    .filter((item) => {
      return item?.parentUuid === key;
    })
    .map((item: VMGroupDirectory) => {
      const children = getTreeList(list, item.key);
      if (children.length < 1) {
        return { ...item };
      }
      return { ...item, children };
    });
};

export const formatGroupName = (name: string, key: string, intl: IntlShape) => {
  if (key === "-1") {
    return intl.formatMessage({ id: "all.vm", defaultMessage: "All" });
  }
  if (key === "-2") {
    return intl.formatMessage({ id: "no.group", defaultMessage: "Default" });
  }
  return name;
};

export const formatName = (name: string, key: string, intl: IntlShape) => {
  if (key === "-1") {
    return intl.formatMessage({
      id: "virtualization.data.center",
      defaultMessage: " Data Center",
    });
  }
  return name;
};

export const changeViewOptions = (intl: IntlShape) => {
  return [
    {
      value: "group",
      label: intl.formatMessage({
        id: "vm.director.by.group",
        defaultMessage: "Group View",
      }),
    },
    {
      value: "cluster",
      label: intl.formatMessage({
        id: "vm.director.by.cluster",
        defaultMessage: "Display By Cluster",
      }),
    },
  ];
};

export const oneKeyExpandTooltip = (
  expandedDirKeys: string[],
  intl: IntlShape,
): string => {
  return expandedDirKeys.length !== 0
    ? intl.formatMessage({
        id: "fold.all",
        defaultMessage: "Collapse All",
      })
    : intl.formatMessage({
        id: "expand.all",
        defaultMessage: "Expand All",
      });
};

export const searchPlaceHolder = (
  viewType: string,
  intl: IntlShape,
): string => {
  return viewType === "group"
    ? intl.formatMessage({
        id: "search.vm.group.name",
        defaultMessage: "Search by group name",
      })
    : intl.formatMessage({
        id: "search.group.by.host.name",
        defaultMessage: "Search by host name",
      });
};

export const useSubscribeTreeChange: (params: any) => void = ({
  resourceTypeList = [],
  onProgress,
  onFinish,
}) => {
  const actionRespSubject = window.g_action_subscribe as Subject<{
    data: ActionTaskResult;
    type: "progress" | "finish";
  }>;
  useEffect(() => {
    if (resourceTypeList.length === 0) {
      return;
    }
    const subscription = actionRespSubject
      .pipe(
        filter(({ data }) => {
          const { type: resourceType } = data;
          if (resourceType) {
            return resourceTypeList.includes(resourceType);
          }
          return false;
        }),
      )
      .subscribe(({ data, type }) => {
        if (type === "progress") {
          onProgress?.(data);
        }
        if (type === "finish") {
          onFinish?.(data);
        }
      });
    return () => subscription.unsubscribe();
  }, [actionRespSubject, onFinish, onProgress, resourceTypeList]);
};

export const treeFilterByName = (tree: any, func: Function) => {
  return tree
    .map((node: any) => ({ ...node }))
    .filter((node: any) => {
      node.children = node.children && treeFilterByName(node.children, func);
      return func(node) || (node.children && node.children.length);
    });
};

export const getAllParent = (treeData: any, nodeKey: string) => {
  const nodeParentArray = [] as any;

  function getNodeRoute(tree: any, key: string) {
    for (let index = 0; index < tree.length; index++) {
      if (tree[index].children) {
        const endRecursiveLoop = getNodeRoute(tree[index].children, key);
        if (endRecursiveLoop) {
          nodeParentArray.push(tree[index].key);
          return true;
        }
      }
      if (tree[index].key === key) {
        nodeParentArray.push(tree[index].key);
        return true;
      }
    }
  }

  getNodeRoute(treeData, nodeKey); //查找id为112的节点路径
  const res = nodeParentArray.reverse();
  return res;
};

export const getAllParentNode = (treeData: any, nodeKey: string) => {
  const nodeArray = [] as any;

  function getNodeRoute(tree: any, key: string) {
    for (let index = 0; index < tree.length; index++) {
      if (tree[index].children) {
        const endRecursiveLoop = getNodeRoute(tree[index].children, key);
        if (endRecursiveLoop) {
          nodeArray.push(tree[index]);
          return true;
        }
      }
      if (tree[index].key === key) {
        nodeArray.push(tree[index]);
        return true;
      }
    }
  }

  getNodeRoute(treeData, nodeKey);
  const res = nodeArray.reverse();
  return res;
};

export const tree2list = (tree: any) => {
  const list = [];
  const queue = [...tree];
  while (queue.length) {
    const node = queue.shift();
    const children = node.children;
    if (children) {
      queue.push(...children);
    }
    list.push(node);
  }
  return list;
};

export enum VirtualizationDirItemType {
  Host = "host",
  Cluster = "cluster",
  VM = "vm",
  Zone = "zone",
  Root = "root",
  baremetalChassis = "baremetal-chassis",
  baremetalInstance = "baremetal-instance",
}

export enum VirtualizationDirViewType {
  Hardware = "hardware",
  DataCenter = "dataCenter",
}

export type TreeResourceType =
  | "root-node"
  | "zone"
  | "cluster"
  | "host"
  | "vm"
  | "primary-storage"
  | "iscsi-server"
  | "iscsi-iqn"
  | "iscsi-lun"
  | "fiber-channel-storage"
  | "fiber-channel-lun"
  | "l2-network"
  | "l3-network"
  | "backup-storage"
  | "image"
  | "directory"
  | "nvme-server"
  | "nvme-nqn"
  | "nvme-lun"
  | "baremetal-chassis"
  | "baremetal-cluster"
  | "baremetal-instance";

export interface VirtualizationDirDataNode {
  title: string;
  name?: string;
  key: string;
  iconType?: string;
  isLeaf?: boolean;
  resourceType?: TreeResourceType;
  attr?: any;
  parentUuid?: string | React.Key;
  children?: VirtualizationDirDataNode[];
  loadStatus?: boolean;
  hideIcon?: boolean;
}

/**
 * 处理树节点更新
 * done：
 * 1. 展开更新树结构
 *
 * todo：
 * 1.操作后的树节点替换
 * */
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

/**
 * 处理树节点更新
 * done：
 * 1. 展开更新树结构
 *
 * todo：
 * 1.操作后的树节点替换
 * \
 *
 *
 * 不应该影响原有Tree的展开数据
 * */
export const updateTreeDataAfterAction = (
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

export const getTreeKey = (leftNav: LeftNavType, navView: NavView) => {
  let treeKey = VirRscTreeType.ClusterHost;

  if (leftNav === LeftNavType.ClusterHost && navView === NavView.Group) {
    treeKey = VirRscTreeType.Directory;
  }

  if (leftNav === LeftNavType.ClusterHost && navView === NavView.Resource) {
    treeKey = VirRscTreeType.ClusterHost;
  }

  if (leftNav === LeftNavType.TemplateVm && navView === NavView.Template) {
    treeKey = VirRscTreeType.VmTemplate;
  }

  if (leftNav === LeftNavType.TemplateVm && navView === NavView.Resource) {
    treeKey = VirRscTreeType.TemplateVm;
  }

  if (leftNav === LeftNavType.DataStorage) {
    treeKey = VirRscTreeType.DataStorage;
  }
  if (leftNav === LeftNavType.Network) {
    treeKey = VirRscTreeType.Network;
  }
  if (leftNav === LeftNavType.BareMetal) {
    treeKey = VirRscTreeType.BareMetal;
  }
  return treeKey;
};

export const getAllTreeKeys = (tree: any[]) => {
  const result: string[] = [];

  if (tree.length === 0) {
    return [];
  }

  const nodes = tree[0];

  function traverse(node: any) {
    if (node && node.key) {
      result.push(node.key);
    }

    if (node && node.children) {
      for (let i = 0; i < node.children.length; i++) {
        traverse(node.children[i]);
      }
    }
  }

  traverse(nodes);

  return result;
};
