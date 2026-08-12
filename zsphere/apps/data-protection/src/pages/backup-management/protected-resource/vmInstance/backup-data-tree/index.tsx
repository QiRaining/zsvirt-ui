import { gql, useLazyQuery } from "@apollo/client";
import { Text, Spin, RadioGroup } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Input, Select } from "@zstack/zsphere-components";
import { ActionWrapper, Empty } from "@zstack/zsphere-components";
import type { Condition, IQuery } from "@zstack/zsphere-types";
import { Op, VmInstanceState } from "@zstack/zsphere-types";
import type { ZSVBackupStorage as IZSVBackupStorage } from "@zstack/zsphere-types/graphql";
import { bus, formatStorage } from "@zstack/zsphere-utils";
import { useDebounceFn, useSize, usePersistFn } from "ahooks";
import { Tree } from "antd";
import { groupBy, flatten, sortBy } from "lodash-es";
import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useImperativeHandle,
} from "react";
import { useIntl } from "react-intl";

import {
  backupDataTreeList,
  backupDataList,
} from "../../../../../gql/protected-resource.gql";
import BackupAddonVmNumAlert from "../../components/BackupAddonVmNumAlert";
import { findNode } from "../../utils";
import { useActionConfig as useBackupDataActionConfig } from "../backup-data-details/config";
// import { useActionConfig as useVmActionConfig } from "@zstack/virtualization-resource/src/pages/vm/config";
import { ResourceTreeNodeTitle } from "./tree-node";

import style from "./style.module.less";

const vmStateQuery = gql`
  query vmInstance($uuid: String!) {
    vmInstance(uuid: $uuid) {
      uuid
      state
    }
  }
`;

interface IProps {
  source?: IZSVBackupStorage;
  store: any;
  setStore: (store: any) => void;
  treeRef?: React.Ref<any>;
}

export type IBackupStorageType = "local" | "remote";

enum DisplayType {
  count = "count",
  size = "size",
}

const BackupDataTree: React.FC<IProps> = ({
  source,
  store,
  setStore,
  treeRef,
}) => {
  const intl = useIntl();

  //source 存在 证明是在备份存储详情
  const [backupStorageType, setBackupStorageType] =
    useState<IBackupStorageType>(
      source?.backupStorageType === "remotebackup" ? "remote" : "local",
    );
  const [treeData, setTreeData] = useState<any[]>([]);
  const [selectedKeys, setSelectKeys] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [prevSelectedNode, setPrevSelectedNode] = useState<any>();
  const [displayType, setDisplayType] = useState<DisplayType>(
    DisplayType.count,
  );
  const [search, setSearch] = useState<string>("");

  // const vmActionConfig = useVmActionConfig();
  const backupDataActionConfig = useBackupDataActionConfig();

  const treeContainerRef = useRef<HTMLDivElement>(null);
  const treeDataRef = useRef<any[]>([]);

  const treeContainerSize = useSize(treeContainerRef);

  const defaultQuery: IQuery = useMemo(() => {
    const conditions: any = [
      {
        key: "status",
        op: Op.eq,
        value: "Ready",
      },
      {
        key: "_VolumeBackupStorageRefReadyStatus_",
        op: Op.eq,
        value:
          backupStorageType === "local"
            ? "__UnknownLocalBackupStorageUuid__"
            : "__UnknownRemoteBackupStorageUuid__",
      },
    ];

    const resourceConditions = [
      {
        key: "_VolumeBackupStorageRefReadyStatus_",
        op: Op.eq,
        value:
          backupStorageType === "local"
            ? "__UnknownLocalBackupStorageUuid__"
            : "__UnknownRemoteBackupStorageUuid__",
      },
      {
        key: "backupStorage.__systemTag__",
        op: Op.in,
        values:
          backupStorageType === "local"
            ? ["onlybackup", "allowbackup"]
            : ["remotebackup"],
      },
    ];

    const vmConditions: Condition[] = [
      {
        key: "__BackupTaskType__",
        op: Op.in,
        values:
          backupStorageType === "local"
            ? ["BackupTaskNoData"]
            : ["BackupTaskNoDataRemote"],
      },
    ];

    if (source?.uuid) {
      const extraCondition = {
        key: "backupStorage.uuid",
        op: Op.eq,
        value: source.uuid,
      };
      conditions.push(extraCondition);
      resourceConditions.push(extraCondition);
      vmConditions.push({
        key: "__backupStorageUuid__",
        op: Op.eq,
        value: source.uuid,
      });
    }

    return {
      conditions,
      sortBy: "createDate",
      sortDirection: "desc",
      resourceType: "VmInstance",
      resourceConditions,
      resourceSortBy: displayType,
      resourceSortDirection: "desc",
      vmConditions,
    };
  }, [backupStorageType, displayType, source]);

  const onCompleted = usePersistFn((backupData) => {
    if (backupData) {
      const backupResourceDataList = (
        backupData?.backupResourceDataList?.list ?? []
      ).concat(
        (backupData?.vmInstanceList?.list ?? []).map((vmInstance: any) => ({
          uuid: vmInstance.uuid,
          count: 0,
          size: 0,
          name: vmInstance.name,
          state: vmInstance.state,
        })),
      );
      const backupDataMap = groupBy(
        backupData?.backupDataList?.list ?? [],
        (item) => item.vmInstanceUuid,
      );
      let selectedNode: any;
      let transformTreeData = backupResourceDataList.map(
        (resourceData: any) => {
          const items = backupDataMap[resourceData.uuid] ?? [];
          const children: any[] = [];
          items.forEach((item, index) => {
            const node = {
              ...item,
              index,
              type: "backupData",
              key: item.uuid,
              title: "", // 清除浏览器自带的 tooltip
              titleNode: item.name,
            };
            if (node.key === prevSelectedNode?.key) {
              selectedNode = node;
            }
            children.push(node);
          });
          const vmName =
            resourceData.vmInstance?.name ||
            items[0]?.attachedVmName ||
            resourceData.name ||
            resourceData.uuid;
          const state =
            resourceData.state ||
            resourceData.vmInstance?.state ||
            VmInstanceState.Destroyed;
          let titleNode = vmName;
          if (state === VmInstanceState.Destroyed) {
            titleNode = (
              <div className={style.title}>
                <Text>{vmName}</Text>
                <span>
                  （
                  {intl.formatMessage({
                    id: "deleted",
                    defaultMessage: "Deleted",
                  })}
                  ）
                </span>
              </div>
            );
          }
          const node = {
            children,
            uuid: resourceData.uuid,
            name: vmName,
            state,
            size: resourceData.size ?? 0,
            count: resourceData.count ?? 0,
            type: "vm",
            title: "", // 清除浏览器自带的 tooltip
            titleNode,
            key: resourceData.uuid,
          };
          if (node.key === prevSelectedNode?.key) {
            selectedNode = node;
          }
          return node;
        },
      );
      transformTreeData = sortBy(transformTreeData, [
        displayType,
        (node) => node.state !== VmInstanceState.Destroyed,
        "key",
      ]).reverse();

      if (!selectedNode && prevSelectedNode?.vmInstanceUuid) {
        selectedNode = transformTreeData.find(
          (item: any) => item.key === prevSelectedNode.vmInstanceUuid,
        );
      }

      //删除情况下，选中项不存在，默认选中第一个
      const _store = selectedNode
        ? { ...selectedNode, backupStorageType }
        : { ...transformTreeData[0], backupStorageType };

      setTreeData(transformTreeData);
      treeDataRef.current = transformTreeData;
      setSelectKeys(
        selectedNode ? [selectedNode.key] : [transformTreeData[0]?.key],
      );
      setStore(_store);
    }
  });

  const [query, { loading, refetch }] = useLazyQuery(backupDataTreeList, {
    fetchPolicy: "no-cache",
    onCompleted,
  });

  useEffect(() => {
    setStore({ ...store, backupStorageType });
    //backupStorageType变化时，清空搜索条件
    setSearch("");
  }, [backupStorageType, displayType]);

  useEffect(() => {
    query({ variables: defaultQuery });
  }, [defaultQuery]);

  useEffect(() => {
    const cb = async () => {
      if (refetch) {
        const { data } = await refetch({ variables: defaultQuery });
        onCompleted(data);
      }
    };
    bus.addListener("action:refetch:BackupData", cb);
    return () => bus.removeListener("action:refetch:BackupData", cb);
  }, [defaultQuery, refetch, onCompleted]);

  const { run: searchRun } = useDebounceFn(
    (inputVal) => {
      const filteredItems = inputVal
        ? treeDataRef.current.filter(
            ({ name, key }) =>
              name.toLowerCase().includes(inputVal.toLowerCase()) ||
              inputVal === key,
          )
        : treeDataRef.current;
      setTreeData(filteredItems);
      const foundNode = findNode(filteredItems, prevSelectedNode?.key ?? "");
      setSelectKeys(
        foundNode?.key ? [foundNode.key] : [filteredItems?.[0]?.key],
      );
      setStore(
        foundNode?.key
          ? { ...foundNode, backupStorageType }
          : { ...filteredItems[0], backupStorageType },
      );
    },
    { wait: 200 },
  );

  //搜索
  const handleChangeSearchValue = (e: string) => {
    setSearch(e);
    searchRun(e);
  };

  useEffect(() => {
    setExpandedKeys([...expandedKeys, selectedKeys[0]]);
  }, [selectedKeys[0]]);

  const onSelect = usePersistFn((key: string, node: any) => {
    if (selectedKeys.includes(key)) {
      return;
    }
    setSelectKeys([key]);
    setPrevSelectedNode(node);
    setStore({ ...node, backupStorageType });
  });

  useImperativeHandle(treeRef, () => {
    return {
      selectNode: (key: string) => {
        handleChangeSearchValue("");
        const node = flatten(
          treeDataRef.current.map((item) => item.children || []),
        ).find((item) => item.key === key);
        if (node) {
          onSelect(key, node);
        }
      },
    };
  }, []);

  const renderNode = (nodeData: any) => {
    if (nodeData.type === "vm") {
      return (
        <ResourceTreeNodeTitle
          {...nodeData}
          title={nodeData.name}
          query={vmStateQuery}
          transform={(data) =>
            (data as { vmInstance?: { state?: string } })?.vmInstance?.state
          }
          itemKey={nodeData.key}
          extra={
            <div className={style.extra}>
              {displayType === "count"
                ? nodeData.count
                : formatStorage(nodeData.size, 2)}
            </div>
          }
        />
      );
    }
    return (
      <div
        className={style.backupDataNode}
        data-type="backupData"
        data-key={nodeData.key}
      >
        <Text>{nodeData.titleNode}</Text>
        {nodeData.index === 0 && (
          <div className={style.tag}>
            {intl.formatMessage({ id: "latest", defaultMessage: "Latest" })}
          </div>
        )}
      </div>
    );
  };

  const renderTree = useMemo(() => {
    if (loading) {
      return <Spin spinning={loading} />;
    }

    return (
      <>
        {treeData.length === 0 ? (
          <div
            className="flex items-center justify-center"
            style={{ height: "100%" }}
          >
            <Empty
              className={style.empty}
              type="Table"
              description={intl.formatMessage({
                id: "no.data",
                defaultMessage: "No Data",
              })}
            />
          </div>
        ) : (
          <Tree.DirectoryTree
            expandedKeys={expandedKeys}
            onExpand={setExpandedKeys as any}
            height={treeContainerSize.height}
            selectedKeys={selectedKeys}
            titleRender={(nodeData) => renderNode(nodeData)}
            showIcon={false}
            itemHeight={32}
            blockNode
            showLine={false}
            treeData={treeData}
            onSelect={(keys, info) =>
              onSelect(keys[0] as string, info.selectedNodes[0])
            }
            switcherIcon={<Icon type="arrow-down-fill" />}
            expandAction="doubleClick"
            onRightClick={({ event, node }) => {
              event.preventDefault();
              onSelect(node.key as string, node);
            }}
          />
        )}
      </>
    );
  }, [expandedKeys, intl, loading, selectedKeys, treeContainerSize, treeData]);

  return (
    <div className={style.container}>
      {!source && (
        <div style={{ marginBottom: 4 }}>
          <BackupAddonVmNumAlert />
          <RadioGroup
            value={backupStorageType}
            onValueChange={(value) =>
              setBackupStorageType(value as IBackupStorageType)
            }
            variant="outline"
            options={[
              {
                value: "local",
                label: intl.formatMessage({
                  id: "local.backup",
                  defaultMessage: "Local Backup",
                }),
              },
              {
                value: "remote",
                label: intl.formatMessage({
                  id: "remote.backup",
                  defaultMessage: "Remote Backup",
                }),
              },
            ]}
          />
        </div>
      )}
      <div className={style.toolbar}>
        <Input
          value={search}
          onChange={(e) => handleChangeSearchValue(e.target.value)}
          suffix={<Icon type="search" />}
          placeholder={intl.formatMessage({
            id: "search.vm.name.or.uuid",
            defaultMessage: "Search by VM Name or UUID",
          })}
        />
        <Select width={160} value={displayType} onChange={setDisplayType}>
          <Select.Option value={DisplayType.count}>
            {intl.formatMessage({
              id: "display.backup.by.count",
              defaultMessage: "By Backup Count",
            })}
          </Select.Option>
          <Select.Option value={DisplayType.size}>
            {intl.formatMessage({
              id: "display.backup.by.size",
              defaultMessage: "By Backup Size",
            })}
          </Select.Option>
        </Select>
      </div>

      <div className={style.treeContainer}>
        <div ref={treeContainerRef}>
          {/*ActionWrapper:目录树的右键操作*/}
          <ActionWrapper
            view={(_list, type) => {
              if (type === "vm") {
                return "sub.virtualization.protectedResource";
              }
              if (backupStorageType === "local") {
                return "main.local";
              }
              return "main.remote";
            }}
            position="directory"
            actionConfig={{
              // vm: vmActionConfig,
              backupData: { ...backupDataActionConfig, gql: backupDataList },
            }}
          >
            {renderTree}
          </ActionWrapper>
        </div>
      </div>
    </div>
  );
};

export default BackupDataTree;
