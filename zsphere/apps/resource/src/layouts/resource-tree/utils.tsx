import { getMenuTree } from "@zstack/zsphere-config";
import type { ActionTaskResult } from "@zstack/zsphere-types/graphql";
import { find as _find } from "lodash-es";
import React, { useEffect } from "react";
import type { IntlShape } from "react-intl";
import type { Subject } from "rxjs";
import { filter } from "rxjs/operators";

import type { VirtualizationDirDataNode } from "./types";
import { LeftNavType } from "./types";

//需要拿父级uuid才能插入
export const updateExpandedKeys = (
  originKey: any,
  newKey: string,
  parentUuid: string,
  remove: boolean,
) => {
  const recursionAdd = (list: any, theNewKey: any, parentKey: string) => {
    for (let i = 0; i <= list.length - 1; i += 1) {
      if (list[i].key === parentKey) {
        const flag =
          list[i]?.children.filter((t: any) => t.key === theNewKey)?.length ===
          0;
        if (flag) {
          list[i].children = [{ key: theNewKey, children: [] }].concat(
            list[i].children || [],
          );
        }
        break;
      } else if (list[i].key !== parentKey && list[i].children) {
        recursionAdd(list[i].children, theNewKey, parentKey);
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

export const getAllTreeKeysAfterRemoveNode = (tree: any, uuid: string) => {
  const result: string[] = [];

  const recursionDelete = (list: any[], key: string) => {
    for (let i = 0; i <= list.length - 1; i += 1) {
      //有对应key

      if (list[i].key !== key) {
        result.push(list[i].key);
        if (list[i]?.children) {
          recursionDelete(list[i].children, key);
        }
      }
    }
  };

  recursionDelete(tree, uuid);

  return result;
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

export const getAllParent = (treeData: any, nodeKey: string) => {
  const nodeParentArray = [] as any;

  function getNodeRoute(tree: any, key: string) {
    for (let index = 0; index < tree?.length; index++) {
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

export const findnode = (tree: any, uuid: string) => {
  let result = null;
  const getTreeItem = (data: any, id: string) => {
    data.map((item: any) => {
      if (item.key === id) {
        result = item; // 结果赋值
      } else if (item.children) {
        getTreeItem(item.children, id);
      }
    });
  };
  getTreeItem(tree, uuid);

  return result;
};

export const changeResourceDirViewOptions = (
  intl: any,
  activeMenuKey: LeftNavType,
) => {
  if (activeMenuKey === LeftNavType.ClusterHost) {
    return [
      {
        value: "cluster",
        label: intl.formatMessage({
          id: "vm.director.by.cluster",
          defaultMessage: "Display By Cluster",
        }),
        iconType: "tree",
      },
      {
        value: "group",
        label: intl.formatMessage({
          id: "vm.director.by.group",
          defaultMessage: "Group View",
        }),
        iconType: "folder",
      },
    ];
  }

  return [
    {
      value: "cluster",
      iconType: "expend",
      label: intl.formatMessage({
        id: "vm.director.by.cluster",
        defaultMessage: "Display By Cluster",
      }),
    },
    {
      value: "group",
      iconType: "folder",
      label: intl.formatMessage({
        id: "vm.director.by.group",
        defaultMessage: "Group View",
      }),
    },
  ];
};

export const getMenuName = (key: any, intl: any) => {
  const virtualizationMenu = getMenuTree("root", intl);
  const vrMenu = _find(virtualizationMenu as any, {
    key: "virtualization.resource",
  });
  const menu = _find(vrMenu?.children as any, { key });
  return (
    intl.formatMessage({
      id: menu?.i18nKey,
      defaultMessage: menu?.name ?? "",
    }) ?? ("" as string)
  );
};

export type TreeData<T> = T & {
  children?: TreeData<T>[];
};

export interface VisitFnContext<T> {
  current: T;
  depth: number;
  shouldInclude: boolean;
}

export type VisitFn<T> = (ctx: VisitFnContext<T>) => boolean | void;

export function updateTreeData<T>(
  trees: TreeData<T>[],
  visits: VisitFn<TreeData<T>>[],
  depth = 1,
): TreeData<T>[] {
  const result: TreeData<T>[] = [];
  trees.forEach((root) => {
    const children = root.children
      ? updateTreeData(root.children, visits, depth + 1)
      : [];
    const newRoot = { ...root, children, isLeaf: !children.length };
    let shouldInclude = true;
    visits.forEach((visit) => {
      const current =
        visit?.({ current: newRoot, depth, shouldInclude }) ?? true;
      shouldInclude = shouldInclude && current;
    });
    if (shouldInclude) {
      result.push(newRoot);
    }
  });
  return result;
}

export const findKey =
  (result: { value: boolean }, key: string | null | undefined) =>
  ({ current, shouldInclude }: VisitFnContext<VirtualizationDirDataNode>) => {
    if (key && !result.value && shouldInclude && current.key === key) {
      result.value = true;
    }
  };

export interface IFilterByOptions<T extends { titleNode?: React.ReactNode }> {
  field: (current: TreeData<T>) => string;
  keyword: string;
  className?: string;
}

export function filterBy<
  T extends { key: string; titleNode?: React.ReactNode },
>({ field, keyword, className }: IFilterByOptions<T>) {
  return ({ current }: VisitFnContext<TreeData<T>>) => {
    if (!keyword) {
      return true;
    }
    const fieldValue = field(current);
    const valueIncluded = fieldValue.includes(keyword);
    if (valueIncluded && className) {
      current.titleNode = highlightText(fieldValue, keyword, className);
    }
    return (
      valueIncluded ||
      (current.key === keyword &&
        current.key !== "-1" &&
        current.key !== "-2") ||
      !!current.children?.length
    );
  };
}

export function highlightText(
  text: string,
  keyword: string,
  className: string,
) {
  const [before, ...after] = text.split(keyword);
  return (
    <span>
      {before}
      <span className={className}>{keyword}</span>
      {after.join(keyword)}
    </span>
  );
}

export const collectExpandableKeys =
  (result: Set<string>) =>
  ({ current }: VisitFnContext<VirtualizationDirDataNode>) => {
    if (current.children?.length) {
      result.add(current.key);
    }
  };

export const collectKeysByDepth =
  (result: Set<string>, maxDepth: number) =>
  ({ current, depth }: VisitFnContext<VirtualizationDirDataNode>) => {
    if (depth <= maxDepth && current.children?.length) {
      result.add(current.key);
    }
  };

export const keySetLessThanOrEqual = (lhs: Set<string>, rhs: Set<string>) => {
  return lhs.size <= rhs.size && [...lhs].every((key) => rhs.has(key));
};

export function getName(intl: IntlShape, current: VirtualizationDirDataNode) {
  return current.key.startsWith("-2")
    ? intl.formatMessage({
        id: "virtualization.default.dir",
        defaultMessage: "Default Group",
      })
    : (current.name ?? "");
}

//监听组织架构/成员操作事件
export const useSubscribeOrgTreeChange: (params: any) => void = ({
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
