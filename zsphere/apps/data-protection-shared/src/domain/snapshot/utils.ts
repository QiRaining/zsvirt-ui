import { isEmpty, get, filter, flatMapDeep } from "lodash-es";

const transformData = (data: any = []) => {
  if (isEmpty(data)) {
    return [];
  }

  const transformNode = (node: any = {}, current?: boolean) => {
    const { inventory = {}, children = [] } = node;
    const { group = {} } = inventory;
    const transformedNode = {
      ...inventory,
      key: inventory?.groupUuid || inventory?.uuid,
      title: get(group, "name", inventory.name),
      description: get(group, "description"),
      parentUuid: inventory.parentUuid || "-1",
      group,
      current,
      children: children
        .filter((childNode: any) => !isEmpty(childNode.inventory))
        .map((childNode: any) => transformNode(childNode, current)),
    };

    return transformedNode;
  };

  return data.map((it: any) => transformNode(it.tree, it.current));
};

// 组合 tree
const mergeTrees = (vmTree: any[], snapshotTree: any[]) => {
  if (isEmpty(vmTree) || isEmpty(snapshotTree)) {
    return [];
  }

  return vmTree.map((vmItem) => {
    const updatedSnapshotTree = snapshotTree.map((snapshotItem) => {
      if (vmItem.attr?.rootVolumeUuid === snapshotItem?.volumeUuid) {
        return {
          ...snapshotItem,
          parentUuid: vmItem.key,
          group: {
            ...snapshotItem.group,
            vmName: vmItem.title,
          },
        };
      }
      return snapshotItem;
    });

    const children = filter(updatedSnapshotTree, { parentUuid: vmItem.key });
    return { ...vmItem, children };
  });
};

//收集展开的key
const extractKeys = (treeData: any): any[] => {
  return flatMapDeep(treeData, (node) => {
    const keys = node?.hasOwnProperty("key") ? [node.key] : [];
    const children = node?.children || [];
    return keys?.concat(extractKeys(children));
  });
};

export { extractKeys, mergeTrees, transformData };
