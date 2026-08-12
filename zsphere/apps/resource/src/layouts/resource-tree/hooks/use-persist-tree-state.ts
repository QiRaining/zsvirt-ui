/**
 * 重新实现getTreeStatus与setTreeStatusInLocal, 使其与state无关，减少树的重复渲染，提高性能
 * 用纯的localStorage来存储树的状态, 防止React的useState更新造成的重复渲染
 */
import { VirRscTreeType } from "../types";

interface ITreeStatus {
  expandedKeys: any[] | null;
  selectedKey: string;
  selectedResource: string;
}

const initLocalStorageData = {
  //默认展开根级别
  expandedKeys: ["-1"],
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

export const getTreeStatus = ({
  key,
}: {
  key: VirRscTreeType;
}): ITreeStatus => {
  const stored = localStorage.getItem(`${key}`);
  if (!stored) {
    // 如果 localStorage 中没有数据，初始化并返回默认值
    localStorage.setItem(`${key}`, JSON.stringify(initLocalStorageData));
    return { ...initLocalStorageData };
  }
  const parsed = JSON.parse(stored);
  // 确保返回的对象包含所有必要的字段，防止部分数据丢失
  // 特别处理 expandedKeys 为 null 的情况，确保至少包含根节点
  const result = {
    ...initLocalStorageData,
    ...parsed,
  };
  if (result.expandedKeys === null) {
    result.expandedKeys = ["-1"];
  }
  return result;
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
  expandedKeys?: string[];
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
