/**
 * 重新实现getTreeStatus与setTreeStatusInLocal, 使其与state无关，减少树的重复渲染，提高性能
 * 用纯的localStorage来存储树的状态, 防止React的useState更新造成的重复渲染
 */
import { VirRscTreeType } from "@zstack/zsphere-types";

interface ITreeStatus {
  expandedKeys: any[] | null;
  selectedKey: string;
  selectedResource: string;
}

const initLocalStorageData = {
  expandedKeys: null,
  selectedKey: "-1",
  selectedResource: "root-node",
} as ITreeStatus;

export const initTreeStatus = () => {
  for (const key in VirRscTreeType) {
    const value = VirRscTreeType[key as keyof typeof VirRscTreeType];
    if (value) {
      if (!localStorage.getItem(`${value}`)) {
        localStorage.setItem(`${value}`, JSON.stringify(initLocalStorageData));
      }
    }
  }
};

export const getTreeStatus = ({ key }: { key: VirRscTreeType }) => {
  return JSON.parse(localStorage.getItem(`${key}`) || "{}");
};

export const setTreeStatus = ({
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
  localStorage.setItem(`${treeKey}`, JSON.stringify(data));
};

export const usePersistTreeStatus = () => {
  return { getTreeStatus, initTreeStatus, setTreeStatus };
};
