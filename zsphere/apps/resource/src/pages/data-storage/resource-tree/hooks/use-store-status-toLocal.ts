import type {
  NavigationType,
  VirtualizationDirDataNode,
} from "@zstack/zsphere-types";
import { useLocalStorageState } from "ahooks";

import { initLocalStorageData } from "./constant";

enum TopTabType {
  IscsiServer = "virtualization.iscsi.server",
  FiberChannelStorage = "virtualization.fiber.channel.storage",
  NvmeServer = "virtualization.nvme.server",
}

export const updateExpandedKeys = (
  originKey: any,
  newKey: string,
  parentUuid: string,
  remove: boolean,
) => {
  const recursionAdd = (list: any, theNewKey: any, parentUuid: string) => {
    for (let i = 0; i <= list.length - 1; i += 1) {
      if (list[i].key === parentUuid) {
        const flag =
          list[i]?.children.filter((t: any) => t.key === theNewKey)?.length ===
          0;
        if (flag) {
          list[i].children = [{ key: theNewKey, children: [] }].concat(
            list[i].children || [],
          );
        }
        break;
      } else if (list[i].key !== parentUuid && list[i].children) {
        recursionAdd(list[i].children, theNewKey, parentUuid);
      }
    }
  };
  const recursionDelete = (list: any[], key: React.Key) => {
    for (let i = 0; i <= list.length - 1; i += 1) {
      //有对应key
      const flag =
        list[i]?.children.filter((t: any) => t.key === key)?.length !== 0;
      if (list[i].children && flag) {
        list[i].children = list[i].children.filter((t: any) => t.key !== key);
        break;
      } else if (list[i].children && !flag) {
        recursionDelete(list[i].children, key);
      }
    }
  };

  if (remove) {
    if (newKey === "-1") {
      originKey = [];
    } else {
      recursionDelete(originKey, newKey);
    }
  } else if (newKey === "-1") {
    originKey = [{ key: "-1", children: [], resouceType: "root-node" }];
  } else {
    recursionAdd(originKey, newKey, parentUuid);
  }

  return originKey;
};

//useLocalStorageState 存储 展开、选中key
export const useTreeInfoInLocalStorage = () => {
  const [iscsiServerTreeStatus, setIscsiServerTreeStatus] =
    useLocalStorageState(`${TopTabType.IscsiServer}`, initLocalStorageData);

  const [fiberChannelStorageTreeStatus, setFiberChannelStorageTreeStatus] =
    useLocalStorageState(
      `${TopTabType.FiberChannelStorage}`,
      initLocalStorageData,
    );

  const [NvmeServerTreeStatus, setNvmeServerTreeStatus] = useLocalStorageState(
    `${TopTabType.NvmeServer}`,
    initLocalStorageData,
  );

  //记住最后一个视角
  const [lastSelectedTree, setLastSelectedTree] = useLocalStorageState(
    "lastSelectedTree",
    {
      activeMenuKey: TopTabType.IscsiServer as NavigationType,
    },
  );

  const setTreeStatusInLocal = ({
    activeMenuKey,
    resource,
    key, // selectedKey
    expandedKeys,
  }: {
    activeMenuKey: NavigationType;
    resource?: string;
    key?: string;
    expandedKeys?: string[];
  }) => {
    let data = getTreeStatus({ key: activeMenuKey });

    if (resource || key || (expandedKeys && expandedKeys.length > 0)) {
      data = {
        ...data,
        ...(resource ? { selectedResource: resource } : {}),
        ...(key ? { selectedKey: key } : {}),
        ...(expandedKeys && expandedKeys.length > 0 ? { expandedKeys } : {}),
      };
    }

    switch (activeMenuKey) {
      case TopTabType.IscsiServer:
        setIscsiServerTreeStatus(data);
        break;
      case TopTabType.FiberChannelStorage:
        setFiberChannelStorageTreeStatus(data);
        break;
      case TopTabType.NvmeServer:
        setNvmeServerTreeStatus(data);
        break;
    }
  };

  const getTreeStatus = ({ key }: { key: NavigationType }) => {
    let data = initLocalStorageData;
    switch (key) {
      case TopTabType.IscsiServer:
        data = iscsiServerTreeStatus;
        break;
      case TopTabType.FiberChannelStorage:
        data = fiberChannelStorageTreeStatus;
        break;
      case TopTabType.NvmeServer:
        data = NvmeServerTreeStatus;
        break;
    }

    return data;
  };

  const setLocalStorageAfterExpand = ({
    active,
    node,
    remove = false,
  }: {
    active: NavigationType;
    node: VirtualizationDirDataNode;
    remove: boolean;
  }) => {
    const data = getTreeStatus({ key: active })?.expandedKeys ?? [];

    const expandedKeys = updateExpandedKeys(
      data,
      node.key,
      node.parentUuid as string,
      remove,
    );

    //需要拿到原本的expandedKey

    setTreeStatusInLocal({
      activeMenuKey: active,
      expandedKeys,
    });
  };

  return {
    iscsiServerTreeStatus,
    setIscsiServerTreeStatus,
    setTreeStatusInLocal,
    lastSelectedTree,
    setLastSelectedTree,
    getTreeStatus,
    setLocalStorageAfterExpand,
  };
};
