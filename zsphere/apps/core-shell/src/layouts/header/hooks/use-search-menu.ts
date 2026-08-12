import { getMenuTree } from "@zstack/zsphere-config";
import { escapeRegExp } from "@zstack/zsphere-utils";
import { useMemo } from "react";
import { useIntl } from "react-intl";

// 缓存正则表达式，避免在搜索时重复创建
const formatSearchWord = (str: string = "") => {
  return str?.toLocaleLowerCase()?.replace(/ /g, "") || "";
};

const useSearchMenu = () => {
  const intl = useIntl();

  // 使用 useMemo 缓存菜单树，避免重复计算
  const menu = useMemo(() => {
    return getMenuTree("root", intl);
  }, [intl]);

  // 使用 useMemo 缓存映射关系，避免重复计算
  const { menuMap, namespaceMap } = useMemo(() => {
    const menuMap = new Map<string, any[]>();
    const namespaceMap = new Map<string, any[]>();

    const travelMenuAndMapResourceType = (
      node: any,
      res: any[],
      menuMapParam: Map<string, any[]>,
      namespaceMapParam: Map<string, any[]>,
    ) => {
      if (Array.isArray(node)) {
        for (let i = 0; i < node.length; i += 1) {
          travelMenuAndMapResourceType(
            node[i],
            res,
            menuMapParam,
            namespaceMapParam,
          );
        }
      } else if (node) {
        if (node?.resourceType) {
          // 确保 resourceType 是数组
          const resourceTypes = Array.isArray(node.resourceType)
            ? node.resourceType
            : node.resourceType.split(",");

          resourceTypes.forEach((item: string) => {
            if (item && typeof item === "string") {
              menuMapParam.set(item, [...res, node]);
            }
          });
        }

        if (node?.namespace) {
          namespaceMapParam.set(node.namespace, [...res, node]);
        }

        if (node?.children?.length) {
          travelMenuAndMapResourceType(
            node.children,
            [...res, node],
            menuMapParam,
            namespaceMapParam,
          );
        }

        if (node?.tabs?.length) {
          travelMenuAndMapResourceType(
            node.tabs,
            [...res, node],
            menuMapParam,
            namespaceMapParam,
          );
        }
      }
    };

    // 只在菜单变化时重新构建映射
    travelMenuAndMapResourceType(menu, [], menuMap, namespaceMap);

    return { menuMap, namespaceMap };
  }, [menu]);

  const searchMenuByStr = (
    node: any,
    str: string,
    res: any[] = [],
    buffer: any[] = [],
    level: number = 0,
  ) => {
    if (!str?.trim()) {
      return;
    }

    // 预先编译正则表达式，避免重复创建
    const searchPattern = formatSearchWord(str);
    const reg = new RegExp(escapeRegExp(searchPattern));

    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i += 1) {
        searchMenuByStr(node[i], str, res, buffer, level + 1);
      }
    } else if (node) {
      if (node?.key === "unclassified") {
        return;
      }

      // 检查搜索条件
      const nameMatch = reg.test(
        formatSearchWord(intl.formatMessage({ id: node?.i18nKey })),
      );
      const hasValidPath =
        node?.path ||
        (node.source === "system" &&
          !node?.path &&
          node.parentKey &&
          level <= 2) ||
        (node?.url && node?.showType === "page");
      const sourceCondition =
        (node?.source === "system" && buffer.length >= 1) ||
        node?.source !== "system";
      const isVisible = node.visible !== false; // 默认为 true

      if (nameMatch && hasValidPath && sourceCondition && isVisible) {
        res.push([...buffer, node]);
      }

      if (node?.children?.length && !node?.isTab) {
        searchMenuByStr(node.children, str, res, [...buffer, node], level);
      }
    }
  };

  // 缓存返回的函数，避免不必要的重新创建
  const getCurrentBreadList = (val: string = "") => {
    return menuMap.get(val) ?? [];
  };

  const getCurrentBreadListByNamespace = (namespace: string) => {
    return namespaceMap.get(namespace) ?? [];
  };

  const getCurrentOrder = (val: string = "") => {
    const index = [...menuMap.keys()].indexOf(val);
    return index !== -1 ? index : 10000;
  };

  const searchMenu = (val: string = "") => {
    if (!val?.trim()) {
      return [];
    }

    const res: any[] = [];
    searchMenuByStr(menu, val, res);
    return res;
  };

  return {
    getCurrentBreadList,
    getCurrentBreadListByNamespace,
    getCurrentOrder,
    searchMenu,
  };
};

export default useSearchMenu;
