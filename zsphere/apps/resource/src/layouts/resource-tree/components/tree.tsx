import { gql } from "@apollo/client";
import { Icon } from "@zstack/icon";
import { ActionWrapper } from "@zstack/zsphere-components";
import { HostState } from "@zstack/zsphere-types";
import { useSize } from "ahooks";
import { Tree } from "antd";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { getAllParent, VirtualizationDirItemType } from "../../utils";
import { useResourceActionConfig } from "../hooks/use-get-actionConfig";
import { getTreeStatus, setTreeStatus } from "../hooks/use-persist-tree-state";
import type { TreeInfo, VirRscTreeType } from "../types";
import { keySetLessThanOrEqual } from "../utils";
import TreeNodeTitle, { ResourceTreeNodeTitle } from "./tree-node";

import style from "./style.module.less";

// Lazy-load baremetal action config bridge — gracefully degrades when zsv_baremetal is unavailable
const BaremetalActionConfigBridge = React.lazy(() =>
  import("zsv_baremetal/action-config-bridge").catch(() => ({
    default: () => null,
  })),
);

const renderSwitcherIcon = ({
  expanded,
  isLeaf,
}: {
  expanded: boolean;
  isLeaf: boolean;
}) => {
  if (isLeaf) {
    return null;
  }
  return <Icon type={expanded ? "arrow-down-fill" : "arrow-right-fill"} />;
};

const vmStateQuery = gql`
  query vmInstance($uuid: String!) {
    vmInstance(uuid: $uuid) {
      uuid
      state
    }
  }
`;

const hostStatusQuery = gql`
  query host($uuid: String!) {
    host(uuid: $uuid) {
      uuid
      status
      state
    }
  }
`;

const bmChassisStateQuery = gql`
  query baremetalChassisList($uuid: CondtionValue!) {
    baremetalChassisList(
      conditions: [{ key: "uuid", value: $uuid }]
      replyWithCount: true
    ) {
      list {
        uuid
        state
      }
    }
  }
`;

const bmInstanceStateQuery = gql`
  query baremetalInstance($uuid: String!) {
    baremetalInstance(uuid: $uuid) {
      uuid
      state
    }
  }
`;

interface IDirectoryTreeProps {
  selectedKey?: string | null;
  onTreeNodeSelect: any;
  onRightClick?: any;
  treeInfo: TreeInfo;
  treeKey?: VirRscTreeType | null;
  persistTreeStatus?: boolean;
  controllerRef?: React.Ref<{
    expandAll: () => void;
    collapseAll: () => void;
  }>;
  onTreeAllExpandedChange?: (allExpanded: boolean) => void;
}

const DirectoryTree: React.FC<IDirectoryTreeProps> = ({
  selectedKey,
  treeInfo,
  treeKey,
  persistTreeStatus,
  controllerRef,
  onTreeAllExpandedChange,
  ...props
}) => {
  const treeRef = useRef(null);
  const innerRef = useRef<any>(null);
  const size = useSize(treeRef);
  const genKey = () => Math.random().toString(16).substring(2);
  const treeElementKey = useRef<string>(genKey());
  const { view, actionConfigs, defaultQuery } = useResourceActionConfig();

  // Baremetal action configs loaded asynchronously via bridge component
  const [baremetalConfigs, setBaremetalConfigs] = useState<Record<
    string,
    any
  > | null>(null);

  const mergedActionConfigs = useMemo(() => {
    if (!baremetalConfigs) {
      return actionConfigs;
    }
    return {
      ...actionConfigs,
      ...baremetalConfigs,
    };
  }, [actionConfigs, baremetalConfigs]);

  const [expandedKeys, setExpandedKeys] = useState<string[]>(() => {
    let result: Set<string>;
    if (persistTreeStatus && treeKey) {
      const initTreeStatus: string[] | null = getTreeStatus({
        key: treeKey,
      }).expandedKeys;
      result = initTreeStatus
        ? new Set(initTreeStatus)
        : treeInfo.defaultExpandedKeys;
    } else {
      result = treeInfo.defaultExpandedKeys;
    }
    if (selectedKey) {
      const parentKeys = getAllParent(treeInfo.treeData, selectedKey);
      result = new Set([...result, ...parentKeys]);
      if (treeInfo.expandableKeySet.has(selectedKey)) {
        result.add(selectedKey);
      }
    }
    return [...result];
  });

  useEffect(() => {
    if (persistTreeStatus && treeKey) {
      setTreeStatus({ treeKey, expandedKeys });
    }
  }, [expandedKeys, persistTreeStatus, treeKey]);

  const treeAllExpanded = useRef<boolean>();

  useEffect(() => {
    const allExpanded = keySetLessThanOrEqual(
      treeInfo.expandableKeySet,
      new Set(expandedKeys),
    );
    if (allExpanded !== treeAllExpanded.current) {
      treeAllExpanded.current = allExpanded;
      onTreeAllExpandedChange?.(allExpanded);
    }
  }, [expandedKeys, treeInfo]);

  useEffect(() => {
    if (selectedKey) {
      setExpandedKeys((prev) => {
        const keys = new Set([
          ...prev,
          ...getAllParent(treeInfo.treeData, selectedKey),
        ]);
        if (treeInfo.expandableKeySet.has(selectedKey)) {
          keys.add(selectedKey);
        }
        return [...keys];
      });
      const timerId = setTimeout(() => {
        innerRef.current?.scrollTo({ key: selectedKey, align: "auto" });
      }, 500);
      return () => clearTimeout(timerId);
    }
  }, [selectedKey, treeInfo]);

  useImperativeHandle(controllerRef, () => {
    return {
      expandAll: () => {
        setExpandedKeys([...treeInfo.expandableKeySet]);
      },
      collapseAll: () => {
        setExpandedKeys([]);
      },
    };
  }, [treeInfo]);

  //自渲染树节点
  const directoryItem = useCallback((nodeData: any) => {
    const {
      name: title,
      titleNode,
      level,
      key,
      resourceType = VirtualizationDirItemType.VM,
      state,
      status,
      iconType,
    } = nodeData;

    const nodeProps = {
      iconType,
      type: resourceType,
      itemKey: key,
      level,
      title,
      titleNode,
    };

    let iconStatus = [HostState.Maintenance, HostState.PreMaintenance].includes(
      state,
    )
      ? state
      : status;

    if (resourceType === VirtualizationDirItemType.baremetalChassis) {
      iconStatus = state === "Enabled" ? "running" : "stopped";
    }

    if (resourceType === VirtualizationDirItemType.VM) {
      return (
        <ResourceTreeNodeTitle
          query={vmStateQuery}
          transform={(data) => data?.vmInstance?.state}
          state={state}
          {...nodeProps}
        />
      );
    }
    if (resourceType === VirtualizationDirItemType.baremetalInstance) {
      return (
        <ResourceTreeNodeTitle
          query={bmInstanceStateQuery}
          transform={(data) => data?.baremetalInstance?.state}
          state={state}
          {...nodeProps}
        />
      );
    }
    if (resourceType === VirtualizationDirItemType.baremetalChassis) {
      return (
        <ResourceTreeNodeTitle
          query={bmChassisStateQuery}
          transform={(data) => {
            const value = data?.baremetalChassisList?.list?.[0]?.state;
            return value && (value === "Enabled" ? "running" : "stopped");
          }}
          state={iconStatus}
          {...nodeProps}
        />
      );
    }
    if (resourceType === VirtualizationDirItemType.Host) {
      return (
        <ResourceTreeNodeTitle
          query={hostStatusQuery}
          transform={(data) =>
            [HostState.Maintenance, HostState.PreMaintenance].includes(
              data?.host?.state,
            )
              ? data?.host?.state
              : data?.host?.status
          }
          state={iconStatus}
          {...nodeProps}
        />
      );
    }

    return <TreeNodeTitle state={iconStatus} {...nodeProps} />;
  }, []);

  return (
    <div className={style.tree} ref={treeRef}>
      {/*Baremetal action config bridge — loads configs from zsv_baremetal*/}
      <Suspense fallback={null}>
        <BaremetalActionConfigBridge onConfigReady={setBaremetalConfigs} />
      </Suspense>
      {/*ActionWrapper:目录树的右键操作*/}
      <ActionWrapper
        view={view}
        position="directory"
        actionConfig={mergedActionConfigs}
        defaultQuery={defaultQuery}
      >
        {treeInfo.treeData.length > 0 && (
          <Tree.DirectoryTree
            key={treeElementKey.current}
            ref={innerRef}
            height={size.height}
            titleRender={directoryItem}
            onRightClick={(e) => props?.onRightClick?.(e?.node?.key)}
            showIcon={false}
            itemHeight={32}
            blockNode
            showLine={false}
            treeData={treeInfo.treeData}
            onSelect={props?.onTreeNodeSelect}
            onExpand={(keys) => setExpandedKeys(keys as any)}
            switcherIcon={renderSwitcherIcon}
            expandedKeys={expandedKeys}
            expandAction="doubleClick"
            selectedKeys={selectedKey ? [selectedKey] : []}
            {...props}
          />
        )}
      </ActionWrapper>
    </div>
  );
};

export default {
  Tree: (props: IDirectoryTreeProps) => (
    <DirectoryTree {...props} persistTreeStatus />
  ),
  SearchTree: (props: IDirectoryTreeProps) => {
    const treeInfo = useMemo(
      () => ({
        ...props.treeInfo,
        defaultExpandedKeys: props.treeInfo.expandableKeySet,
      }),
      [props.treeInfo],
    );
    return (
      <DirectoryTree
        {...props}
        treeKey={null}
        persistTreeStatus={false}
        treeInfo={treeInfo}
      />
    );
  },
};
