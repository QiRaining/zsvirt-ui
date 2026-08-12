import type { DocumentNode } from "@apollo/client";
import { useQuery } from "@apollo/client";
import { Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Input, Spin, useRegisterCommand } from "@zstack/zsphere-components";
import {
  toResourceTreeQueryVariables,
  useVirtualizationResourceStore,
  type ResourceTreeSettingsFormValues,
} from "@zstack/zsphere-platform-store";
import { ActionTaskState } from "@zstack/zsphere-types";
import type { ActionTaskResult } from "@zstack/zsphere-types/graphql";
import { omit } from "lodash-es";
import qs from "qs";
import React, { useMemo, useRef, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { useLocation, useNavigate } from "react-router";
import { useShallow } from "zustand/react/shallow";

import {
  getBareMetalTreeList,
  getClusterHostTree,
  getDataStorageTreeList,
  getDirectoryTree,
  getNetworkTree,
  getTemplateVMTreeList,
  getVMTemplateTreeList,
} from "../../gql/tree.gql";
import { useUrlParamsWatcher } from "../hooks/use-url-params-watcher";
import { getAllParentNode, getTreeKey } from "../utils";
import DirectoryTree from "./components/tree";
import {
  getTreeStatus,
  setTreeStatus as setTreeStatusInLocal,
} from "./hooks/use-persist-tree-state";
import TreeViewName from "./tree-view-name";
import type {
  NavView,
  TreeInfo,
  TreeResourceType,
  VirtualizationDirDataNode,
} from "./types";
import { LeftNavType, VirRscTreeType } from "./types";
import {
  collectExpandableKeys,
  collectKeysByDepth,
  findKey,
  getName,
  updateTreeData,
  useSubscribeOrgTreeChange,
} from "./utils";

import style from "./style.module.less";

/*
 * 这是拉全量数据的版本
 * */

export const initData: VirtualizationDirDataNode = {
  title: "",
  name: window.location.hostname,
  key: "-1",
  children: [],
  isLeaf: false,
  resourceType: "root-node",
};

interface IProps {
  leftNav?: LeftNavType; // 主机与虚机、镜像存储、数据存储、网络
  lastResource?: string;
}

const selector = (state: any) => ({
  setCurrentResource: state.setCurrentResource,
});

const treeResourceTypes: Set<TreeResourceType> = new Set([
  "root-node",
  "zone",
  "cluster",
  "host",
  "vm",
  "primary-storage",
  "iscsi-server",
  "iscsi-iqn",
  "iscsi-lun",
  "fiber-channel-lun",
  "nvme-lun",
  "l2-network",
  "l3-network",
  "security-group",
  "backup-storage",
  "image",
  "directory",
  "vm-template",
  "baremetal-chassis",
  "baremetal-instance",
  "baremetal-cluster",
]);

interface IProps {
  activeKey: LeftNavType;
}

const ResourceTree: React.FC<IProps> = ({ activeKey }) => {
  const navigate = useNavigate();

  // 使用 useUrlParamsWatcher 而非 useLocation 来读取 URL 参数
  // 原因：React Router v7 的 navigate() 被包裹在 startTransition 中，
  // 当详情页的 useSuspenseQuery suspend 时，useLocation() 返回的是旧的 location，
  // 导致 selectedKey 不更新，树的选中状态不跟随 URL 变化。
  // useUrlParamsWatcher 通过拦截 history.pushState/replaceState 直接读取浏览器 URL，
  // 不受 React transition 的延迟影响。
  const { navView, searchString, pathname } = useUrlParamsWatcher();
  const search = qs.parse(searchString, { ignoreQueryPrefix: true });

  const leftNav = activeKey ?? LeftNavType.ClusterHost;

  let resourceUuid = (search.uuid as string) || null;
  let resourceType = pathname.split("/")[2];
  // , 安全组详情页保留左侧树结构, 树的层级保留在zone
  if (pathname.split("/")[2] === "security-group") {
    resourceUuid = (search?.zoneUuid as string) || "-1";
    resourceType = search?.zoneUuid ? "zone" : "root-node";
  }
  const selectedKey =
    resourceUuid && resourceUuid !== "-2" ? resourceUuid : null;

  const treeInView = useMemo(() => {
    return getTreeKey(leftNav, navView);
  }, [leftNav, navView]);

  useEffect(() => {
    if (!treeResourceTypes.has(resourceType as any)) {
      return;
    }

    // 从 URL 获取 leftnav 参数，确保只有当 URL 中的 leftnav 与当前组件的 leftNav 匹配时才保存状态
    // 这可以防止切换 view 时，旧的 selectedKey 被错误地保存到新 view 的 localStorage 中
    const urlParams = qs.parse(searchString, { ignoreQueryPrefix: true });
    const urlLeftNav = urlParams.leftnav as LeftNavType;
    const urlNavView = urlParams.navView as NavView;

    // 只有当 URL 中的 leftnav 和 navView 都与当前组件状态匹配时才继续
    // 这可以防止切换 view 时，旧组件的 useEffect 使用过时的 treeInView 覆盖错误的 localStorage key
    if (urlLeftNav !== leftNav || urlNavView !== navView) {
      return;
    }

    if (!selectedKey) {
      const treeStatus = getTreeStatus({ key: treeInView });
      // URL 驱动：使用 React Router 的 navigate
      navigate({
        pathname: `/virtualization-resource/${treeStatus.selectedResource}/detail`,
        search: `?uuid=${treeStatus.selectedKey}&leftnav=${leftNav}&navView=${navView}`,
      });
      return;
    }

    setTreeStatusInLocal({
      treeKey: treeInView,
      key: selectedKey,
      resource: resourceType,
    });
  }, [
    selectedKey,
    resourceType,
    treeInView,
    leftNav,
    navView,
    navigate,
    searchString,
  ]);

  const onNodeSelect = (
    key: string,
    resource: string,
    searchValue?: string,
  ) => {
    // URL 驱动：直接导航到目标 URL，其他组件会根据 URL 自动更新
    navigate(
      {
        pathname: `/virtualization-resource/${resource}/detail`,
        search: `?uuid=${key}&leftnav=${leftNav}&navView=${navView}`,
      },
      {
        state: searchValue ? { navSearch: searchValue } : undefined,
      },
    );
  };

  const onNodeDelete = (path: VirtualizationDirDataNode[], idx: number) => {
    const newKey = path[idx - 1]?.key ?? "-1";
    const resource = path[idx - 1]?.resourceType ?? "root-node";
    // URL 驱动：使用 React Router 的 navigate
    navigate({
      pathname: `/virtualization-resource/${resource}/detail`,
      search: `?uuid=${newKey}&leftnav=${leftNav}&navView=${navView}`,
    });
  };

  const onSelectedKeyMismatch = () => {
    // 在视图切换过程中，URL 可能还没有更新完成，或者旧树组件还在渲染
    // 需要检查 URL 对应的 treeKey 是否与当前期望的 treeKey 一致
    const currentSearch = qs.parse(window.location.search, {
      ignoreQueryPrefix: true,
    });
    const currentUrlNavView = currentSearch.navView as NavView;
    const currentUrlLeftNav = currentSearch.leftnav as LeftNavType;
    const normalizedUrlNavView = currentUrlNavView?.endsWith("$")
      ? (currentUrlNavView.slice(0, -1) as NavView)
      : currentUrlNavView;

    // 计算 URL 对应的 treeKey
    const urlTreeKey =
      currentUrlLeftNav && normalizedUrlNavView
        ? getTreeKey(currentUrlLeftNav, normalizedUrlNavView)
        : null;

    // 如果 URL 对应的 treeKey 与当前组件渲染的树的 treeKey 不一致，跳过 mismatch 处理
    // 这可以防止在视图切换过程中，旧树组件错误地触发 mismatch
    if (urlTreeKey !== treeInView) {
      return;
    }

    if (selectedKey !== "-1") {
      // URL 驱动：使用 React Router 的 navigate
      navigate({
        pathname: "/virtualization-resource/root-node/detail",
        search: `?uuid=-1&leftnav=${leftNav}&navView=${navView}`,
      });
    }
  };

  const onNavViewChange = (newNavView: NavView) => {
    if (newNavView === navView) {
      return;
    }
    sessionStorage.setItem(`${leftNav}-virRscNavView`, newNavView);

    const newTreeKey = getTreeKey(leftNav, newNavView);
    const newTreeStatus = getTreeStatus({ key: newTreeKey });

    // URL 驱动：使用 React Router 的 navigate
    // 切换视图时，需要同时更新 pathname 和 uuid，确保导航到正确的资源页面
    navigate({
      pathname: `/virtualization-resource/${newTreeStatus.selectedResource}/detail`,
      search: `?uuid=${newTreeStatus.selectedKey}&leftnav=${leftNav}&navView=${newNavView}`,
    });
  };

  const treeViewName = (
    <TreeViewName
      leftNav={leftNav}
      navView={navView}
      onNavViewChange={onNavViewChange}
    />
  );

  if (!treeResourceTypes.has(resourceType as any)) {
    return null;
  }

  switch (treeInView) {
    case VirRscTreeType.ClusterHost:
      return (
        <ClusterHostTree
          selectedKey={selectedKey}
          onNodeSelect={onNodeSelect}
          treeViewName={treeViewName}
          onNodeDelete={onNodeDelete}
          onSelectedKeyMismatch={onSelectedKeyMismatch}
        />
      );
    case VirRscTreeType.Directory:
      return (
        <VmGroupTree
          selectedKey={selectedKey}
          onNodeSelect={onNodeSelect}
          treeViewName={treeViewName}
          onNodeDelete={onNodeDelete}
          onSelectedKeyMismatch={onSelectedKeyMismatch}
        />
      );
    case VirRscTreeType.DataStorage:
      return (
        <DataStorageTree
          selectedKey={selectedKey}
          onNodeSelect={onNodeSelect}
          treeViewName={treeViewName}
          onNodeDelete={onNodeDelete}
          onSelectedKeyMismatch={onSelectedKeyMismatch}
        />
      );
    case VirRscTreeType.Network:
      return (
        <NetworkTree
          selectedKey={selectedKey}
          onNodeSelect={onNodeSelect}
          treeViewName={treeViewName}
          onNodeDelete={onNodeDelete}
          onSelectedKeyMismatch={onSelectedKeyMismatch}
        />
      );
    case VirRscTreeType.TemplateVm:
      return (
        <TemplateVmTree
          selectedKey={selectedKey}
          onNodeSelect={onNodeSelect}
          treeViewName={treeViewName}
          onNodeDelete={onNodeDelete}
          onSelectedKeyMismatch={onSelectedKeyMismatch}
        />
      );
    case VirRscTreeType.VmTemplate:
      return (
        <VmTemplateTree
          selectedKey={selectedKey}
          onNodeSelect={onNodeSelect}
          treeViewName={treeViewName}
          onNodeDelete={onNodeDelete}
          onSelectedKeyMismatch={onSelectedKeyMismatch}
        />
      );
    case VirRscTreeType.BareMetal:
      return (
        <BareMetalTree
          selectedKey={selectedKey}
          onNodeSelect={onNodeSelect}
          treeViewName={treeViewName}
          onNodeDelete={onNodeDelete}
          onSelectedKeyMismatch={onSelectedKeyMismatch}
        />
      );
  }
};

export default ResourceTree;

interface ITreeProps {
  gql: DocumentNode;
  gqlKey: string;
  selectedKey?: string | null;
  defaultExpandedDepth: number;
  treeKey: VirRscTreeType;
  needRefetch: (result: ActionTaskResult) => boolean;
  onNodeSelect?: (
    key: string,
    resourceType: string,
    searchValue?: string,
  ) => void;
  treeViewName: React.ReactNode;
  onNodeDelete?: (path: VirtualizationDirDataNode[], idx: number) => void;
  onSelectedKeyMismatch?: () => void;
  searchPlaceholder?: string;
}

function Tree({
  gql,
  gqlKey,
  selectedKey,
  defaultExpandedDepth,
  treeKey,
  needRefetch,
  onNodeSelect,
  treeViewName,
  searchPlaceholder,
  onNodeDelete,
  onSelectedKeyMismatch,
}: ITreeProps) {
  const intl = useIntl();
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const treeSortSettings = useVirtualizationResourceStore(
    useShallow(
      (state): ResourceTreeSettingsFormValues => state.resourceTreeSettings,
    ),
  );
  const treeSortVariables = useMemo(
    () => toResourceTreeQueryVariables(treeSortSettings),
    [treeSortSettings],
  );

  // 获取 URL 中的 leftnav 和 navView 参数，用于判断当前树是否是活跃的树
  const search = qs.parse(location.search, { ignoreQueryPrefix: true });
  const urlLeftNav = search.leftnav as LeftNavType;
  let urlNavView = search.navView as NavView;
  if (urlNavView?.endsWith("$")) {
    urlNavView = urlNavView.slice(0, -1) as NavView;
  }
  // 计算 URL 对应的 treeKey
  const urlTreeKey =
    urlLeftNav && urlNavView ? getTreeKey(urlLeftNav, urlNavView) : null;

  useEffect(() => {
    const navSearch = (location.state as { navSearch?: string })?.navSearch;
    if (navSearch) {
      setSearchValue(navSearch);
      setTimeout(() => {
        navigate(location.pathname + location.search, {
          replace: true,
          state: omit(location.state || {}, "navSearch"),
        });
      });
    } else {
      setSearchValue("");
    }
  }, [selectedKey, location, navigate]);

  const { data, loading, refetch } = useQuery(gql, {
    variables: treeSortVariables,
    fetchPolicy: "no-cache",
  });

  const treeInfo = useMemo<TreeInfo>(() => {
    const children: VirtualizationDirDataNode[] = data?.[gqlKey]?.list ?? [];
    let treeData: VirtualizationDirDataNode[] = [
      { ...initData, isLeaf: !children.length, children },
    ];
    const expandableKeySet = new Set<string>();
    const defaultExpandedKeys = new Set<string>();
    const treeHasSelectedKey = { value: false };
    const searchValueLowerCase = searchValue?.toLowerCase();

    treeData = updateTreeData(treeData, [
      collectExpandableKeys(expandableKeySet),
      collectKeysByDepth(defaultExpandedKeys, defaultExpandedDepth),
      ({ current }) => {
        if (!searchValue) {
          return true;
        }
        const name = getName(intl, current);
        const nameIndex = name.toLowerCase().indexOf(searchValueLowerCase);
        const nameIncluded = nameIndex !== -1;
        const uuidIncluded =
          current.key === searchValue &&
          current.key !== "-1" &&
          current.key !== "-2";
        const childrenIncluded = !!current.children?.length;
        const extraAttribIncluded = current.extraAttrib?.some(
          ({ value }) => value === searchValueLowerCase,
        );

        if (nameIncluded) {
          current.titleNode = (
            <span>
              {name.slice(0, nameIndex)}
              <span className={style.highlight}>
                {name.slice(nameIndex, nameIndex + searchValue.length)}
              </span>
              {name.slice(nameIndex + searchValue.length)}
            </span>
          );
        }

        return (
          nameIncluded ||
          uuidIncluded ||
          extraAttribIncluded ||
          childrenIncluded
        );
      },
      findKey(treeHasSelectedKey, selectedKey),
      ({ current }) => {
        if (!current.titleNode) {
          current.titleNode = getName(intl, current);
        }
        current.title = "";
      },
    ]);

    return {
      treeData,
      expandableKeySet,
      defaultExpandedKeys,
      selectionInfo: {
        selectedKey,
        treeHasSelectedKey: treeHasSelectedKey.value,
      },
    };
  }, [data, gqlKey, defaultExpandedDepth, intl, searchValue, selectedKey]);

  useEffect(() => {
    // 只有当当前树是 URL 对应的活跃树时，才检查 selectedKey 是否匹配
    // 这可以防止切换 view 时，旧树组件错误地触发 mismatch
    const isActiveTree = urlTreeKey === treeKey;

    // 额外检查：确保 selectedKey 是属于当前树的
    // 在视图切换过程中，URL 可能已经更新为新视图，但 selectedKey 还是旧视图的值
    // 此时不应该触发 mismatch，因为新视图的数据还在加载中
    const savedTreeStatus = getTreeStatus({ key: treeKey });
    const isSelectedKeyFromCurrentTree =
      selectedKey === savedTreeStatus.selectedKey ||
      selectedKey === "-1" ||
      !selectedKey;

    // 额外检查：确保 URL 中的 selectedKey (uuid) 也是属于当前树的
    // 这可以防止在视图切换过程中，旧视图的 selectedKey 被错误地用于 mismatch 检查
    const urlUuid = search.uuid as string;
    const isUrlUuidFromCurrentTree =
      urlUuid === savedTreeStatus.selectedKey || urlUuid === "-1" || !urlUuid;

    // 关键检查：确保 URL 中的 navView 与当前期望的 treeKey 一致
    // 这可以防止在视图切换过程中，URL 还没更新完成时错误地触发 mismatch
    // 因为 navigate() 是异步的，URL 的更新可能滞后于 React 状态的更新
    const expectedTreeKeyFromUrl =
      urlLeftNav && urlNavView ? getTreeKey(urlLeftNav, urlNavView) : null;
    const isUrlNavViewConsistent = expectedTreeKeyFromUrl === treeKey;

    if (
      onSelectedKeyMismatch &&
      isActiveTree &&
      isUrlNavViewConsistent &&
      isSelectedKeyFromCurrentTree &&
      isUrlUuidFromCurrentTree &&
      !loading &&
      !searchValue &&
      !treeInfo.selectionInfo.treeHasSelectedKey
    ) {
      onSelectedKeyMismatch();
    }
  }, [
    treeInfo.selectionInfo.treeHasSelectedKey,
    loading,
    urlTreeKey,
    treeKey,
    selectedKey,
    search.uuid,
    urlLeftNav,
    urlNavView,
  ]);

  useSubscribeOrgTreeChange({
    resourceTypeList: [
      "BaremetalChassis",
      "BaremetalInstance",
      "Zone",
      "VmInstance",
      "Cluster",
      "HostVO",
      "PrimaryStorageVO",
      "IscsiServer",
      "BackupStorage",
      "RemoteBackupStorage",
      "Image",
      "L2Network",
      "L3Network",
      "VmTemplate",
      "DirectoryGroup",
      "VolumeSnapshotGroup",
      "DRSAdvice",
    ],

    onFinish: (result: ActionTaskResult) => {
      if (needRefetch(result)) {
        refetch();
        if (!loading && selectedKey && onNodeDelete) {
          const inventory = result.inventory
            ? JSON.parse(result.inventory)
            : {};
          if (inventory.actionType === "delete") {
            const key: string = inventory.uuid ?? inventory.id;
            const path: VirtualizationDirDataNode[] = getAllParentNode(
              treeInfo.treeData,
              selectedKey,
            );
            const idx = path.findIndex((val) => val.key === key);
            if (idx !== -1) {
              onNodeDelete(path, idx);
            }
          }
        }
      }
    },
  });

  const { setCurrentResource } = useVirtualizationResourceStore(
    useShallow(selector),
  );

  //
  const handleSetCurrentResource = (
    currentResourceType: string,
    uuid: string,
    name: string,
    iconType?: string,
  ) => {
    try {
      const type = currentResourceType;
      const availableTypes = [
        "vm",
        "host",
        "cluster",
        "zone",
        "directory",
        "root-node",
        "backup-storage",
        "image",
        "primary-storage",
        "l2-network",
        "l3-network",
        "vm-template",
        "bm-chassis",
        "bm-instance",
      ];
      if (availableTypes.includes(type)) {
        setCurrentResource({
          uuid,
          name,
          iconType,
        });
      }
    } catch {
      // currently do nothing
    }
  };

  const handleNodeSelection = (
    key: string,
    name: string,
    resourceType: string,
    iconType?: string,
  ) => {
    handleSetCurrentResource(resourceType, key, name, iconType);
    onNodeSelect?.(key, resourceType, searchValue);
  };

  const [allExpanded, setAllExpanded] = useState(false);
  const treeController = useRef<{
    expandAll: () => void;
    collapseAll: () => void;
  }>(null);

  const renderTree = (val: TreeInfo) => {
    const TreeComp = searchValue
      ? DirectoryTree.SearchTree
      : DirectoryTree.Tree;
    return (
      <TreeComp
        treeInfo={val}
        treeKey={treeKey}
        selectedKey={selectedKey}
        onTreeNodeSelect={(keys: string[], info: any) => {
          const { key, name, resourceType, iconType } = info.selectedNodes[0];
          handleNodeSelection(key, name, resourceType, iconType);
        }}
        onRightClick={(e: any) => {
          const { key, name, resourceType } = e.node;
          handleNodeSelection(key, name, resourceType);
        }}
        controllerRef={treeController}
        onTreeAllExpandedChange={setAllExpanded}
      />
    );
  };

  const renderEmpty = () => {
    if (searchValue) {
      return (
        <div className={style.noResultContainer}>
          <div className={style.noResultIcon}>
            <Icon type="inbox" size={24} />
          </div>
          <p className={style.noResultText}>
            {intl.formatMessage({
              id: "treeview.search.no.result",
              defaultMessage: "No search results found.",
            })}
          </p>
        </div>
      );
    }
    return null;
  };

  const [toggleTreeExpandCollapse, commandInfo] = useRegisterCommand({
    id: "expand.collapse.left.nav.tree",
    fn: () => {
      if (allExpanded) {
        treeController.current?.collapseAll();
      } else {
        treeController.current?.expandAll();
      }
    },
  });

  const expandBtnTitle = allExpanded
    ? intl.formatMessage({
        id: "vm.director.collapseAll",
        defaultMessage: "Fold Up All",
      })
    : intl.formatMessage({
        id: "vm.director.expandAll",
        defaultMessage: "Expand all",
      });

  return (
    <div className={style.directory}>
      <div className={style["tree-name-container"]}>
        {treeViewName}
        <div className={style.expandIconWrapper}>
          <Tooltip
            placement="top"
            title={
              expandBtnTitle + (commandInfo ? ` (${commandInfo.keyLabel})` : "")
            }
          >
            <Icon
              className={style.icon}
              type={allExpanded ? "fold-1" : "expand-3"}
              size={16}
              onClick={() => toggleTreeExpandCollapse()}
            />
          </Tooltip>
        </div>
      </div>
      <div className={style.searchWrapper}>
        <Input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={
            searchPlaceholder ??
            intl.formatMessage({
              id: "resource.tree.search.placeholder.name.or.uuid",
              defaultMessage: "Search by Resource Name or UUID",
            })
          }
          suffix={<Icon type="search" />}
          allowClear
        />
      </div>
      <div className={style["tree-body-container"]}>
        <Spin spinning={loading} className={style.spin}>
          {loading || !treeInfo.treeData.length
            ? renderEmpty()
            : renderTree(treeInfo)}
        </Spin>
      </div>
    </div>
  );
}

type TreeProps = Pick<
  ITreeProps,
  | "selectedKey"
  | "treeViewName"
  | "onNodeSelect"
  | "onNodeDelete"
  | "onSelectedKeyMismatch"
>;

function ClusterHostTree(props: TreeProps) {
  const intl = useIntl();
  return (
    <Tree
      gql={getClusterHostTree}
      gqlKey="clusterHostTreeList"
      defaultExpandedDepth={3}
      treeKey={VirRscTreeType.ClusterHost}
      needRefetch={(e) => {
        if (
          (e.state === ActionTaskState.fail ||
            e.state === ActionTaskState.exception) &&
          e.type === "VmInstance" &&
          e.listenerType === "createInstance"
        ) {
          return true;
        }
        return (
          [
            "VmInstance",
            "Cluster",
            "HostVO",
            "Zone",
            "VmTemplate",
            "VolumeSnapshotGroup",
            "DRSAdvice",
          ].indexOf(e.type ?? -1) !== -1 && e.state === "success"
        );
      }}
      searchPlaceholder={intl.formatMessage({
        id: "resource.tree.search.placeholder.name.or.ip.or.uuid",
        defaultMessage: "Search by name/IP/MAC/UUID",
      })}
      {...props}
    />
  );
}

function VmGroupTree(props: TreeProps) {
  const intl = useIntl();
  return (
    <Tree
      gql={getDirectoryTree}
      gqlKey="directoryTreeList"
      defaultExpandedDepth={2}
      treeKey={VirRscTreeType.Directory}
      needRefetch={(e) =>
        ["DirectoryGroup", "Zone", "VmInstance"].indexOf(e.type ?? -1) !== -1 &&
        e.state === ActionTaskState.success
      }
      searchPlaceholder={intl.formatMessage({
        id: "resource.tree.search.placeholder.name.or.ip.or.uuid",
        defaultMessage: "Search by name/IP/MAC/UUID",
      })}
      {...props}
    />
  );
}

function DataStorageTree(props: TreeProps) {
  return (
    <Tree
      gql={getDataStorageTreeList}
      gqlKey="dataStorageTreeList"
      defaultExpandedDepth={2}
      treeKey={VirRscTreeType.DataStorage}
      needRefetch={(e) =>
        ["PrimaryStorageVO", "IscsiServer", "Zone", "HostVO"].indexOf(
          e.type ?? -1,
        ) !== -1 && e.state === ActionTaskState.success
      }
      {...props}
    />
  );
}

function NetworkTree(props: TreeProps) {
  return (
    <Tree
      gql={getNetworkTree}
      gqlKey="networkTreeList"
      defaultExpandedDepth={2}
      treeKey={VirRscTreeType.Network}
      needRefetch={(e) =>
        ["L2Network", "L3Network", "Zone"].indexOf(e.type ?? -1) !== -1 &&
        e.state === ActionTaskState.success
      }
      {...props}
    />
  );
}

function TemplateVmTree(props: TreeProps) {
  return (
    <Tree
      gql={getTemplateVMTreeList}
      gqlKey="templateVMTreeList"
      defaultExpandedDepth={2}
      treeKey={VirRscTreeType.TemplateVm}
      needRefetch={(e) =>
        ["BackupStorage", "RemoteBackupStorage", "Image", "Zone"].indexOf(
          e.type ?? -1,
        ) !== -1 && e.state === ActionTaskState.success
      }
      {...props}
    />
  );
}

function VmTemplateTree(props: TreeProps) {
  return (
    <Tree
      gql={getVMTemplateTreeList}
      gqlKey="vmTemplateTreeList"
      defaultExpandedDepth={2}
      treeKey={VirRscTreeType.TemplateVm}
      needRefetch={(e) =>
        ["VmTemplate", "Zone", "VmInstance"].indexOf(e.type ?? -1) !== -1 &&
        e.state === ActionTaskState.success
      }
      {...props}
    />
  );
}

function BareMetalTree(props: TreeProps) {
  return (
    <Tree
      gql={getBareMetalTreeList}
      gqlKey="bareMetalTreeList"
      defaultExpandedDepth={2}
      treeKey={VirRscTreeType.BareMetal}
      needRefetch={(e) =>
        ["Zone", "Cluster", "BaremetalInstance", "BaremetalChassis"].indexOf(
          e.type ?? -1,
        ) !== -1 && e.state === ActionTaskState.success
      }
      {...props}
    />
  );
}
