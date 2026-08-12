import type {
  ActionTaskResult,
  VMGroupDirectory,
} from "@zstack/zsphere-types/graphql";
import { useEffect } from "react";
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

export const formatGroupName = (
  name: string | undefined,
  key: string | undefined,
  intl: any,
) => {
  if (key === "-1") {
    return intl.formatMessage({ id: "all.vm", defaultMessage: "All" });
  }
  if (key === "-2") {
    return intl.formatMessage({ id: "no.group", defaultMessage: "Default" });
  }
  return name;
};

export const changeViewOptions = (intl: any) => {
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
  intl: any,
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

export const searchPlaceHolder = (viewType: string, intl: any): string => {
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
