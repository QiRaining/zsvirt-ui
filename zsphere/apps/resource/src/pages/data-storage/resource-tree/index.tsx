import { Button, Text } from "@zstack/design";
import { Icon, type IconName } from "@zstack/icon";
import DirectoryTree from "@zstack/virtualization-resource/src/layouts/resource-tree/components/tree";
import { useActionConfig as useFiberChannelStorageActionConfig } from "@zstack/virtualization-resource/src/pages/fiber-channel-storage/config";
import { useActionConfig as useIscsiServerActionConfig } from "@zstack/virtualization-resource/src/pages/iscsi-server/config";
import { Action, Empty, Spin, useAuth } from "@zstack/zsphere-components";
import { useSubscribeOrgTreeChange } from "@zstack/zsphere-hooks";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import type {
  TreeResourceType,
  VirtualizationDirDataNode,
} from "@zstack/zsphere-types";
import type { IQuery } from "@zstack/zsphere-types";
import { getAllTreeKeys } from "@zstack/zsphere-utils";
import { useMount } from "ahooks";
import type { TreeProps } from "antd";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { IntlShape } from "react-intl";
import { useIntl } from "react-intl";

import AddIscsiServerModal from "../../iscsi-server/create";
import AddNvmeServerModal from "../../nvme-server/action/create";
import useNvmeServerActionConfig from "../../nvme-server/config/useActionConfig";
import TreeInput from "./components/input";
import { initData } from "./hooks/constant";
import type { IResourceType } from "./hooks/types";
import { useGetTreeData } from "./hooks/use-get-treeData";
import { handleResourceChange } from "./hooks/utils";
import { flattenTree } from "./utils";

import style from "./style.module.less";

enum TopTabType {
  IscsiServer = "virtualization.iscsi.server",
  FiberChannelStorage = "virtualization.fiber.channel.storage",
  NvmeServer = "virtualization.nvme.server",
}

const flexNoneStyle = { flex: "none" } as const;
const buttonStyle = { padding: 0, fontSize: 12 } as const;
const spaceStyle = { marginBottom: 8 } as const;
const rowHeightStyle = { height: "100%" } as const;

// TODO 这个破烂文件待重构
// 先糊上 后面必须重构!!!
// 主要是Tree的部分

const iconTypeMap: Map<string, string> = new Map([
  ["zone", "building"],
  ["cluster", "server-1"],
  ["host", "disk-2"],
  ["vm", "monitor"],
  ["l2-network", "server-4"],
  ["l3-network", "d-portgroup"],
  ["backup-storage", "server"],
  ["primary-storage", "storage"],
  ["root-node", "editor"],
  ["directory", "folder"],
  ["vm-template", "file-paste"],
]);

interface TreeNodeTitleProps {
  title?: string;
  titleNode?: React.ReactNode;
  itemKey: string;
  level?: number;
  isSelected?: boolean;
  type?: TreeResourceType;
  state?: string;
  iconType?: string;
  extra?: React.ReactNode;
  hideIcon?: boolean;
}

const LocalTreeNodeTitle: React.FC<TreeNodeTitleProps> = React.memo(
  ({ titleNode, itemKey, iconType, type = "vm", extra, hideIcon = false }) => {
    const icon = useMemo(() => {
      if (type === "image") {
        return iconType ? (
          <Icon type={iconType as IconName} width={16} height={16} />
        ) : null;
      }

      if (iconType) {
        return <Icon type={iconType as IconName} width={16} height={16} />;
      }

      const mappedIconType = iconTypeMap.get(type);
      return mappedIconType ? (
        <Icon type={mappedIconType as IconName} width={16} height={16} />
      ) : null;
    }, [iconType, type]);

    return (
      <div
        className={style.treeTitleContainer}
        data-type={type}
        data-key={itemKey}
      >
        <div className={style.titlePart}>
          {!hideIcon && (
            <div style={flexNoneStyle} title="">
              {icon}
            </div>
          )}
          <div className={style.title}>
            <Text>{titleNode}</Text>
          </div>
        </div>
        <div className={style.extraWrapper}>{extra}</div>
      </div>
    );
  },
);

LocalTreeNodeTitle.displayName = "LocalTreeNodeTitle";

export function getName(intl: IntlShape, current: VirtualizationDirDataNode) {
  return current.key.startsWith("-2")
    ? intl.formatMessage({
        id: "virtualization.default.dir",
        defaultMessage: "Default Group",
      })
    : (current.name ?? "");
}

interface IProps {
  show?: boolean;
  height: number; //树容器的高度
  currentResource?: IResourceType;
  setCurrentResource: Function;
  setDetailVisible: (visible: boolean) => void;
  activeMenuKey: TopTabType;
  source?: any;
  ref?: any;
  defaultQuery: IQuery;
}
/**
 * Todo:
 * 1. 根据url，展开树，并定位
 * 2. 状态实时变更(UpdateTrees)
 * 3. 把四个子树的状态写入localStorage（选中key done，还差expanedKeys）
 * **/

const ResourceTree: React.FC<IProps> = ({
  defaultQuery,
  _height,
  currentResource,
  setCurrentResource,
  setDetailVisible,
  activeMenuKey = TopTabType.IscsiServer,
  source,
}) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const configs: Record<TopTabType, any> = {
    [TopTabType.IscsiServer]: useIscsiServerActionConfig(),
    [TopTabType.FiberChannelStorage]: useFiberChannelStorageActionConfig(),
    [TopTabType.NvmeServer]: useNvmeServerActionConfig(),
  };

  const [loading, setLoading] = useState<boolean>(true);
  const refCurrentResource = useRef(currentResource);
  const refIsSetDefaultExpand = useRef<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");
  const [filteredTreeData, setFilteredTreeData] = useState<
    VirtualizationDirDataNode[]
  >([]);
  const [_autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [_expandedKeys, setExpandedKeys] = useState<string[]>(["-1"]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(["-1"]);
  const [_loadedKeys, setLoadedKeys] = useState<string[]>(["-1"]);
  const [onLoadKey, setOnLoadKey] = useState<string>("-1");
  const [addIscsiServerVisible, setAddIscsiServerVisible] =
    useState<boolean>(false);
  const [addNvmeServerVisible, setAddNvmeServerVisible] =
    useState<boolean>(false);

  //Data part
  const [treeData, setTreeData] =
    useState<VirtualizationDirDataNode[]>(initData);
  const [iscsiServerTreeData, setIscsiServerTreeData] =
    useState<VirtualizationDirDataNode[]>(initData);
  const [fiberChannelStorageTreeData, setFiberChannelStorageTreeData] =
    useState<VirtualizationDirDataNode[]>(initData);
  const [nvmeServerTreeData, setNvmeServerTreeData] =
    useState<VirtualizationDirDataNode[]>(initData);

  // fetch data
  const {
    getIscsiServer,
    getNvmeServer,
    getFiberChannelStorageList,
    currentActiveMenuLoading,
    loadTreeData,
  } = useGetTreeData(
    onLoadKey,
    defaultQuery,
    activeMenuKey,
    setLoading,
    setIscsiServerTreeData,
    setFiberChannelStorageTreeData,
    setNvmeServerTreeData,
  );

  // 1. mount 时拉取数据
  useMount(() => {
    getNvmeServer();
    getIscsiServer();
    getFiberChannelStorageList();
  });

  //  2. 更新 treeData
  useEffect(() => {
    const treeDataMap = {
      [TopTabType.IscsiServer]: iscsiServerTreeData,
      [TopTabType.FiberChannelStorage]: fiberChannelStorageTreeData,
      [TopTabType.NvmeServer]: nvmeServerTreeData,
    };

    const _treeData = treeDataMap[activeMenuKey] || [];

    setTreeData(_treeData);
    setFilteredTreeData(_treeData);
  }, [
    iscsiServerTreeData,
    fiberChannelStorageTreeData,
    nvmeServerTreeData,
    activeMenuKey,
  ]);

  // 3. 首次访问资源树，设置默认展开和选中的节点, 以 treeData 的第一项作为默认值
  useEffect(() => {
    if (treeData.length === 0) {
      return;
    }
    if (refIsSetDefaultExpand.current === true) {
      return;
    }

    // menu tab 切换时 treeData 更新后，不再设置默认展开的key，以内存中缓存的为主
    refIsSetDefaultExpand.current = true;

    const head = treeData[0];
    const defaultSelectedResource = head.resourceType || "";
    const defaultSelectedKey = head.key;

    // 依据每颗树的头节点获取整棵树的所有 key，用于展开其所有子结点
    const defaultExpandedKeys = treeData.reduce<string[]>((allkeys, node) => {
      return allkeys.concat(getAllTreeKeys([node]));
    }, []);

    // 设置展开和选中的 Key
    setExpandedKeys(defaultExpandedKeys);

    if (currentResource?.uuid) {
      // 已有初始值
      setDetailVisible(true);
      return;
    }

    setSelectedKeys([defaultSelectedKey]);

    // 当切换存储类型（issci fc nvme）时，treeData会更新，需要更新 currentResource，显示右侧对应的详情数据
    setCurrentResource({
      uuid: defaultSelectedKey,
      resource: defaultSelectedResource,
    });
  }, [treeData]);

  // 配合第四个 effect 使用
  useEffect(() => {
    refCurrentResource.current = currentResource;
    setSelectedKeys(currentResource?.uuid ? [currentResource.uuid] : ["-1"]);
  }, [currentResource]);

  // 4. 删除当前 treeNode 时
  useEffect(() => {
    if (treeData.length === 0) {
      return;
    }

    const currentUuid = refCurrentResource.current?.uuid;
    const hasCurrentUuid = treeData.some((node) => node.key === currentUuid);

    if (!hasCurrentUuid) {
      const head = treeData[0];
      if (!head) {
        return;
      }

      const defaultSelectedResource = {
        uuid: head.key,
        resource: head.resourceType,
      };
      const defaultSelectedKey = head.key;

      setCurrentResource(defaultSelectedResource);
      setSelectedKeys([defaultSelectedKey]);
    }
  }, [treeData]);

  // 5. 订阅消息，更新 treeData
  useActionSubscribe({
    resourceTypeList: ["IscsiServer", "FiberChannelStorage", "NvmeServer"],
    onFinish: () => {
      const fetchMap = {
        [TopTabType.IscsiServer]: getIscsiServer,
        [TopTabType.FiberChannelStorage]: getFiberChannelStorageList,
        [TopTabType.NvmeServer]: getNvmeServer,
      };
      fetchMap[activeMenuKey]?.();
    },
  });

  //只处理activeKey变化，清空searchText的值
  useEffect(() => {
    setSearchText("");
  }, [activeMenuKey]);

  // 6. 订阅消息，更新树目录
  useSubscribeOrgTreeChange({
    resourceTypeList: ["iscsi-server", "nvme-server"],
    onFinish: (e: any) => {
      try {
        if (e?.type === "iscsi-server" || e?.type === "nvme-server") {
          const inventory = JSON.parse(e?.inventory);
          if (e?.type === "iscsi-server") {
            handleResourceChange(
              "iscsi-server",
              inventory,
              activeMenuKey,
              selectedKeys,
              setSelectedKeys,
              loadTreeData,
            );
          }
          if (e?.type === "nvme-server") {
            handleResourceChange(
              "nvme-server",
              inventory,
              activeMenuKey,
              selectedKeys,
              setSelectedKeys,
              loadTreeData,
            );
          }
        }
      } catch {
        // console.error('Error', error)
      }
    },
  });
  // 处理选中树节点
  const handleTreeNodeSelected = (keys: string[], info: any) => {
    const { resourceType: selectedRT, key } = info.node;
    //点击同一个树节点，return

    setCurrentResource({
      uuid: key,
      resource: selectedRT,
    });

    setSelectedKeys([key]);
  };

  /**
   * 处理展开/折叠
   * 1. 如果折叠，节点和对应节点的子key全部去掉
   * 2. 如果展开，loadData并插入到对应节点下
   *
   * 需要同步处理antTree的expandedKeys与loadedKeys
   */
  const _handleTreeNodeExpand: TreeProps["onExpand"] = (keys, info) => {
    const { expanded } = info;
    //放入缓存后处理
    if (!expanded) {
      setLoadedKeys(keys as string[]);
    }
    setExpandedKeys(keys as string[]);
    setAutoExpandParent(false);
  };

  // 处理 => 点击展开树节点时，加载子结点数据
  const _handleLoadData = async (node: VirtualizationDirDataNode) => {
    const { resourceType: flag, key } = node;
    //Antd onLoadTreeKey
    setOnLoadKey(key);
    //加载树对应节点下的数据
    loadTreeData({
      activeMenuKey,
      key,
      flag: flag as TreeResourceType,
    });
  };

  // 子结点加载完后，设置已加载的 key
  const _handleLoadedKeys: TreeProps["onLoad"] = (_loadedKeys) => {
    setLoadedKeys(_loadedKeys as string[]);
  };

  const { refetchFunction, menuList, viewMap } = useMemo(() => {
    const fetchMap = {
      [TopTabType.IscsiServer]: getIscsiServer,
      [TopTabType.FiberChannelStorage]: getFiberChannelStorageList,
      [TopTabType.NvmeServer]: getNvmeServer,
    };
    const currentConfig = configs[activeMenuKey];

    return {
      refetchFunction: fetchMap[activeMenuKey],
      menuList: currentConfig.list,
      viewMap: currentConfig.viewMap,
    };
  }, [activeMenuKey, configs]);

  const memoizedSelectedList = useMemo(() => [source], [source]);

  const storageAction = useMemo(
    () => (
      <Action
        view="sub.virtualization.zone"
        viewMap={viewMap}
        menuList={menuList}
        position="toolbar"
        source={source}
        refetch={() => refetchFunction()}
        selectedList={memoizedSelectedList}
      />
    ),
    [source, activeMenuKey, memoizedSelectedList],
  );

  const handleSearch = useCallback(
    (inputValue: string) => {
      setSearchText(inputValue);
      try {
        if (!inputValue) {
          if (treeData && treeData.length > 0) {
            const head = treeData[0];
            const defaultSelectedResource = head.resourceType || "";
            const defaultSelectedKey = head.key;
            setCurrentResource({
              uuid: defaultSelectedKey,
              resource: defaultSelectedResource,
            });
            setFilteredTreeData(treeData);
            setExpandedKeys(
              flattenTree(treeData as any).map((item) => item.key) as string[],
            );
            setAutoExpandParent(false);
          } else {
            setCurrentResource({
              uuid: undefined,
              resource: undefined,
            });
            setFilteredTreeData([]);
            setExpandedKeys([]);
            setAutoExpandParent(false);
          }
          return;
        }

        const filterTree = (
          nodes: VirtualizationDirDataNode[],
        ): VirtualizationDirDataNode[] => {
          return nodes.reduce((acc: VirtualizationDirDataNode[], node) => {
            const isMatch = getName(intl, {
              key: node.key,
              name: node.title,
              title: node.title,
            })!
              .toLowerCase()
              .includes(inputValue.toLowerCase());

            const childrenMatch = node.children
              ? filterTree(node.children)
              : [];

            if (isMatch || childrenMatch.length > 0) {
              acc.push({
                ...node,
                children: childrenMatch,
              });
            }

            return acc;
          }, []);
        };

        const filteredData = filterTree(treeData);
        setFilteredTreeData(filteredData);
        if (filteredData.length === 0) {
          setCurrentResource({
            uuid: undefined,
            resource: undefined,
          });
        }
        setAutoExpandParent(true);
      } catch {
        // console.error('Error in handleSearch:', error)
      }
    },
    [intl, treeData],
  );

  const canAddIscsi = hasAuth({
    type: "action",
    authKey: "virtualization.add.iscsi.server",
    resource: "iscsi.server",
  });

  const canAddNvme = hasAuth({
    type: "action",
    authKey: "virtualization.add.nvmeStorage",
    resource: "nvme",
  });

  const emptyDesc = useMemo(() => {
    if (activeMenuKey === TopTabType.FiberChannelStorage) {
      return intl.formatMessage({
        id: "no.data",
        defaultMessage: "No Data",
      });
    }
    if (activeMenuKey === TopTabType.IscsiServer) {
      return canAddIscsi
        ? intl.formatMessage(
            {
              id: "common.no.iscsi.storage.data",
              defaultMessage: "No iSCSI storage available. {add}",
            },
            {
              add: (
                <Button
                  variant="link"
                  onClick={() => setAddIscsiServerVisible(true)}
                  style={buttonStyle}
                >
                  {intl.formatMessage({
                    id: "go.to.add",
                    defaultMessage: "Add",
                  })}
                </Button>
              ),
            },
          )
        : intl.formatMessage({
            id: "common.no.iscsi.storage.data.empty",
            defaultMessage: "No iSCSI Storage Available",
          });
    }
    return canAddNvme
      ? intl.formatMessage(
          {
            id: "common.no.nvme.storage.data",
            defaultMessage: "No NVMe storage available. {add}",
          },
          {
            add: (
              <Button
                variant="link"
                onClick={() => setAddNvmeServerVisible(true)}
                style={buttonStyle}
              >
                {intl.formatMessage({
                  id: "go.to.add",
                  defaultMessage: "Add",
                })}
              </Button>
            ),
          },
        )
      : intl.formatMessage({
          id: "common.no.nvme.storage.data.empty",
          defaultMessage: "No NVMe Storage Available",
        });
  }, [activeMenuKey, intl, canAddIscsi, canAddNvme]);

  return (
    <>
      <div className={style.directory}>
        <div className="flex items-center gap-1" style={spaceStyle}>
          <Button
            onClick={() => {
              refetchFunction();
            }}
            variant="secondary"
            icon={<Icon type="refresh" />}
          />
          {storageAction}
          <TreeInput
            searchText={searchText}
            handleSearch={handleSearch}
            activeMenuKey={activeMenuKey}
          />
        </div>
        <Spin
          spinning={loading || currentActiveMenuLoading}
          wrapperClassName={style.spin}
        >
          <div className={style.treeWrapper}>
            {filteredTreeData.length === 0 ? (
              <div
                className="flex items-center justify-center"
                style={rowHeightStyle}
              >
                <Empty type="Table" description={emptyDesc} />
              </div>
            ) : (
              <DirectoryTree.Tree
                treeInfo={{
                  treeData: filteredTreeData,
                  selectionInfo: {
                    selectedKey: selectedKeys[0],
                    treeHasSelectedKey: !!selectedKeys[0],
                  },
                  expandableKeySet: new Set<string>(),
                  defaultExpandedKeys: new Set<string>(),
                }}
                selectedKey={selectedKeys[0]}
                onTreeNodeSelect={handleTreeNodeSelected}
              />
            )}
          </div>
        </Spin>
      </div>
      <AddIscsiServerModal
        view=""
        selectedList={memoizedSelectedList}
        source={source}
        position="header"
        visible={addIscsiServerVisible}
        setVisible={setAddIscsiServerVisible}
      />
      <AddNvmeServerModal
        view=""
        selectedList={memoizedSelectedList}
        source={source}
        position="header"
        visible={addNvmeServerVisible}
        setVisible={setAddNvmeServerVisible}
      />
    </>
  );
};

export default ResourceTree;
