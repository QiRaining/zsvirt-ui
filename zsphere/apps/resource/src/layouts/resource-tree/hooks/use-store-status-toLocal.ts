import { useLocalStorageState } from "ahooks";

import { NavView, VirRscTreeType } from "../types";

interface ITreeStatus {
  expandedKeys: any[];
  selectedKey: string;
  selectedResource: string;
}

const initLocalStorageData = {
  //默认展开根级别
  expandedKeys: ["-1"],
  selectedKey: "-1",
  selectedResource: "root-node",
} as ITreeStatus;

//useLocalStorageState 存储 展开、选中key
export const useTreeInfoInLocalStorage = () => {
  const [clusterHostTreeStatus, setClusterHostTreeStatus] =
    useLocalStorageState(`${VirRscTreeType.ClusterHost}`, initLocalStorageData);

  const [dirTreeStatus, setDirTreeStatus] = useLocalStorageState(
    `${VirRscTreeType.Directory}`,
    initLocalStorageData,
  );

  const [dataStorageTreeStatus, setDataStorageTreeStatus] =
    useLocalStorageState(`${VirRscTreeType.DataStorage}`, initLocalStorageData);

  const [networkTreeStatus, setNetworkTreeStatus] = useLocalStorageState(
    `${VirRscTreeType.Network}`,
    initLocalStorageData,
  );

  const [templateVmTreeStatus, setTemplateVmTreeStatus] = useLocalStorageState(
    `${VirRscTreeType.TemplateVm}`,
    initLocalStorageData,
  );

  //记住最后一个视角
  const [lastSelectedTree, setLastSelectedTree] = useLocalStorageState(
    "lastSelectedTree",
    {
      treeKey: VirRscTreeType.ClusterHost as VirRscTreeType,
    },
  );

  const setTreeStatusInLocal = ({
    treeKey,
    resource,
    key, //selectedKey
    expandedKeys,
  }: {
    treeKey: VirRscTreeType;
    resource?: string;
    key?: string;
    expandedKeys?: any[];
  }) => {
    let data = getTreeStatus({ key: treeKey });

    if (resource) {
      data = { ...data, selectedResource: resource };
    }
    if (key) {
      data = { ...data, selectedKey: key };
    }
    if (expandedKeys) {
      data = { ...data, expandedKeys };
    }

    if (treeKey === VirRscTreeType.ClusterHost) {
      setClusterHostTreeStatus(data);
    }

    if (treeKey === VirRscTreeType.Directory) {
      setDirTreeStatus(data);
    }

    if (treeKey === VirRscTreeType.DataStorage) {
      setDataStorageTreeStatus(data);
    }
    if (treeKey === VirRscTreeType.TemplateVm) {
      setTemplateVmTreeStatus(data);
    }

    if (treeKey === VirRscTreeType.Network) {
      setNetworkTreeStatus(data);
    }
  };

  const getTreeStatus = ({ key }: { key: VirRscTreeType }) => {
    switch (key) {
      case VirRscTreeType.ClusterHost:
        return clusterHostTreeStatus;
      case VirRscTreeType.Directory:
        return dirTreeStatus;
      case VirRscTreeType.DataStorage:
        return dataStorageTreeStatus;
      case VirRscTreeType.Network:
        return networkTreeStatus;
      case VirRscTreeType.TemplateVm:
        return templateVmTreeStatus;
      default:
        return initLocalStorageData;
    }
  };

  return {
    dirTreeStatus,
    setDirTreeStatus,
    clusterHostTreeStatus,
    setClusterHostTreeStatus,
    dataStorageTreeStatus,
    setDataStorageTreeStatus,
    networkTreeStatus,
    setNetworkTreeStatus,
    templateVmTreeStatus,
    setTemplateVmTreeStatus,
    setTreeStatusInLocal,
    lastSelectedTree,
    setLastSelectedTree,
    getTreeStatus,
  };
};

const initLeftNavData = {
  "virtualization.cluster.host": NavView.Resource,
  "virtualization.network": NavView.Resource,
  "virtualization.template.vm": NavView.Resource,
  "virtualization.data.storage": NavView.Resource,
};

export const useTreeView = () => {
  const [view, setView] = useLocalStorageState(
    `virRscNavView`,
    initLeftNavData,
  );
  return {
    view,
    setView,
  };
};
