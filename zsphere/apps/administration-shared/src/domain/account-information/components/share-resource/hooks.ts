import type { OperationVariables, QueryLazyOptions } from "@apollo/client";
import { useLazyQuery, gql } from "@apollo/client";
import type { VirtualizationDirDataNode } from "@zstack/zsphere-types";
import type { ResourceShare } from "@zstack/zsphere-types/graphql";
import React, { useCallback } from "react";
import type { IntlShape } from "react-intl";

import type { IResourceType } from "./type";
import { flattenTree, updateTreeWithShareTypes } from "./utils";

const initData: VirtualizationDirDataNode = {
  title: "",
  name: window.location.hostname,
  key: "-1",
  children: [],
  isLeaf: false,
  resourceType: "root-node",
};

const getClusterHostTree = gql`
  fragment SpecialTree on SpecialTree {
    uuid
    name
    title
    resourceType
    status
    state
    extraAttrib {
      type
      value
    }
    isLeaf
    key
    children {
      uuid
      name
      title
      resourceType
      status
      state
      iconType
      extraAttrib {
        type
        value
      }
      isLeaf
      key
    }
  }
  query getClusterHostTree {
    clusterHostTreeList {
      list {
        uuid
        name
        title
        resourceType
        status
        state
        isLeaf
        key
        children {
          uuid
          name
          title
          resourceType
          status
          state
          key
          children {
            ...SpecialTree
          }
        }
      }
    }
  }
`;

const getDirectoryTree = gql`
  fragment SpecialTree on SpecialTree {
    uuid
    name
    title
    resourceType
    status
    state
    extraAttrib {
      type
      value
    }
    isLeaf
    key
    children {
      uuid
      name
      title
      resourceType
      status
      state
      iconType
      extraAttrib {
        type
        value
      }
      isLeaf
      key
    }
  }
  query getDirectoryTree {
    directoryTreeList {
      list {
        uuid
        name
        title
        resourceType
        status
        state
        isLeaf
        key
        children {
          uuid
          name
          title
          resourceType
          status
          state
          key
          children {
            uuid
            name
            title
            resourceType
            status
            state
            key
            extraAttrib {
              type
              value
            }
            children {
              ...SpecialTree
            }
          }
        }
      }
    }
  }
`;

const getNetworkTree = gql`
  fragment SpecialTree on SpecialTree {
    uuid
    name
    title
    resourceType
    status
    state
    extraAttrib {
      type
      value
    }
    isLeaf
    key
    children {
      uuid
      name
      title
      resourceType
      status
      state
      iconType
      extraAttrib {
        type
        value
      }
      isLeaf
      key
    }
  }
  query getNetworkTree {
    networkTreeList {
      list {
        uuid
        name
        title
        resourceType
        status
        state
        isLeaf
        key
        children {
          ...SpecialTree
        }
      }
    }
  }
`;

const getL2NetworkTree = gql`
  fragment SpecialTree on SpecialTree {
    uuid
    name
    title
    resourceType
    status
    state
    extraAttrib {
      type
      value
    }
    isLeaf
    key
    children {
      uuid
      name
      title
      resourceType
      status
      state
      iconType
      extraAttrib {
        type
        value
      }
      isLeaf
      key
    }
  }
  query getL2NetworkTree {
    l2NetworkTreeList {
      list {
        uuid
        name
        title
        resourceType
        status
        state
        isLeaf
        key
        children {
          ...SpecialTree
        }
      }
    }
  }
`;

const getTemplateVMTreeList = gql`
  fragment SpecialTree on SpecialTree {
    uuid
    name
    title
    resourceType
    status
    state
    extraAttrib {
      type
      value
    }
    isLeaf
    key
    children {
      uuid
      name
      title
      resourceType
      status
      state
      iconType
      extraAttrib {
        type
        value
      }
      isLeaf
      key
    }
  }
  query getTemplateVMTreeList {
    templateVMTreeList {
      list {
        uuid
        name
        title
        resourceType
        status
        state
        isLeaf
        key
        children {
          ...SpecialTree
        }
      }
    }
  }
`;

const getVMTemplateTreeList = gql`
  fragment SpecialTree on SpecialTree {
    uuid
    name
    title
    resourceType
    status
    state
    extraAttrib {
      type
      value
    }
    isLeaf
    key
    children {
      uuid
      name
      title
      resourceType
      status
      state
      iconType
      extraAttrib {
        type
        value
      }
      isLeaf
      key
    }
  }
  query getVMTemplateTreeList {
    vmTemplateTreeList {
      list {
        uuid
        name
        title
        resourceType
        status
        state
        isLeaf
        key
        children {
          ...SpecialTree
        }
      }
    }
  }
`;

const getL3NetworkTree = getNetworkTree;

const RESOURCE_SHARE_LIST = gql`
  query resourceShareList($uuids: [String!]!) {
    resourceShareList(uuids: $uuids) {
      resourceUuid
      shareType
    }
  }
`;

const transformTreeData = (children: VirtualizationDirDataNode[]) => {
  const treeData: VirtualizationDirDataNode[] = [
    { ...initData, isLeaf: !children.length, children },
  ];
  return treeData;
};

export const useGetResourceTree = (
  setTreeData: (tree: VirtualizationDirDataNode[]) => void,
  setLoading: (loading: boolean) => void,
): {
  getResourceTree: (
    resourceType: IResourceType,
    variables?: QueryLazyOptions<OperationVariables>,
  ) => void;
} => {
  const latestChildrenRef = React.useRef<VirtualizationDirDataNode[]>([]);

  const [queryShareType] = useLazyQuery(RESOURCE_SHARE_LIST, {
    onCompleted: (shareData) => {
      const shareMap: Map<string, string> = new Map(
        shareData.resourceShareList.map((share: ResourceShare) => [
          share.resourceUuid,
          share.shareType,
        ]),
      );
      const updatedChildren = updateTreeWithShareTypes(
        latestChildrenRef.current,
        shareMap,
      );
      setTreeData(transformTreeData(updatedChildren));
      setLoading(false);
    },
    onError: () => {
      setTreeData(transformTreeData(latestChildrenRef.current));
      setLoading(false);
    },
  });

  const handleQueryCompletion = (
    data: Record<string, { list?: VirtualizationDirDataNode[] }>,
    listKey: string,
  ) => {
    const _children: VirtualizationDirDataNode[] = data?.[listKey]?.list ?? [];
    latestChildrenRef.current = _children;
    const uuids = flattenTree(_children).map((child) => child.key);
    queryShareType({
      variables: { uuids },
    });
  };

  const [_getClusterHostTree] = useLazyQuery(getClusterHostTree, {
    onCompleted: (data) => handleQueryCompletion(data, "clusterHostTreeList"),
    onError: () => setLoading(false),
  });

  const [_getDirectoryTree] = useLazyQuery(getDirectoryTree, {
    onCompleted: (data) => handleQueryCompletion(data, "directoryTreeList"),
  });

  const [_getTemplateVMTreeList] = useLazyQuery(getTemplateVMTreeList, {
    onCompleted: (data) => handleQueryCompletion(data, "templateVMTreeList"),
  });

  const [_getVMTemplateTreeList] = useLazyQuery(getVMTemplateTreeList, {
    onCompleted: (data) => handleQueryCompletion(data, "vmTemplateTreeList"),
  });

  const [_getL2NetworkTree] = useLazyQuery(getL2NetworkTree, {
    onCompleted: (data) => handleQueryCompletion(data, "l2NetworkTreeList"),
  });

  const [_getL3NetworkTree] = useLazyQuery(getL3NetworkTree, {
    onCompleted: (data) => handleQueryCompletion(data, "networkTreeList"),
  });

  const getResourceTree = (
    resourceType: IResourceType,
    variables?: QueryLazyOptions<OperationVariables>,
  ) => {
    switch (resourceType) {
      case "vm":
        return _getClusterHostTree(variables);
      case "directory":
        return _getDirectoryTree(variables);
      case "image":
        return _getTemplateVMTreeList(variables);
      case "vm-template":
        return _getVMTemplateTreeList(variables);
      case "l2-network":
        return _getL2NetworkTree(variables);
      case "l3-network":
        return _getL3NetworkTree(variables);
    }
  };

  return {
    getResourceTree,
  };
};

const TARGET_TYPES_MAP: Readonly<
  Record<IResourceType | "directory", readonly string[]>
> = {
  vm: ["vm"],
  directory: ["vm"],
  image: ["image"],
  "vm-template": ["vm-template"],
  "l2-network": ["l2-network"],
  "l3-network": ["l3-network"],
} as const;

export const useShareResourceMeta = (intl: IntlShape) => {
  const getTitleByType = useCallback(
    (resourceType: IResourceType | "directory"): string => {
      switch (resourceType) {
        case "vm":
        case "directory":
          return intl.formatMessage({
            id: "shared.resource.by.vm",
            defaultMessage: "Share Virtual Machine",
          });
        case "image":
          return intl.formatMessage({
            id: "shared.resource.by.image",
            defaultMessage: "Share Image",
          });
        case "vm-template":
          return intl.formatMessage({
            id: "shared.resource.by.template",
            defaultMessage: "Share Template",
          });
        case "l2-network":
          return intl.formatMessage({
            id: "shared.resource.by.l2network",
            defaultMessage: "Share Distributed Switch",
          });
        case "l3-network":
          return intl.formatMessage({
            id: "shared.resource.by.l3network",
            defaultMessage: "Share Distributed Port Group",
          });
        default:
          return "";
      }
    },
    [intl],
  );

  const getTargetTypes = useCallback(
    (type: IResourceType | "directory"): readonly string[] =>
      TARGET_TYPES_MAP[type] ?? [type],
    [],
  );

  return { getTitleByType, getTargetTypes };
};
