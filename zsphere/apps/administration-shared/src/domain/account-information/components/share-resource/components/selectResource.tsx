import { Button, RadioGroup } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Input, Spin } from "@zstack/zsphere-components";
import { DialogBase } from "@zstack/zsphere-design-biz";
import type { VirtualizationDirDataNode } from "@zstack/zsphere-types";
import { HostState } from "@zstack/zsphere-types";
import { getName, VirtualizationDirItemType } from "@zstack/zsphere-utils";
import { Tree } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import ShareType from "../../share-type";
import { useGetResourceTree, useShareResourceMeta } from "../hooks";
import type { IResource, IResourceType } from "../type";
import { flattenTree, highlightText } from "../utils";
import Empty from "./empty";
import TreeNodeTitle from "./TreeNodeTitle";

import styles from "./style.module.less";

const STYLE_SHARE_TYPE = { color: "var(--neutral-500)" } as const;
const STYLE_MARGIN_BOTTOM = { marginBottom: 8 } as const;
const STYLE_SEARCH_INPUT = { width: 320, marginRight: 8 } as const;

enum ViewType {
  hostView = "hostView",
  directoryView = "directoryView",
}

interface IProps {
  initialSelectedKeys: string[];
  resourceType: IResourceType;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onOk: (resourceList: IResource[]) => void;
}

const ModalTreeSelector: React.FC<IProps> = ({
  initialSelectedKeys = [],
  resourceType,
  visible,
  setVisible,
  onOk,
}) => {
  const intl = useIntl();
  const [treeData, setTreeData] = useState<VirtualizationDirDataNode[]>([]);
  const [viewType, setViewType] = useState<ViewType>(ViewType.hostView);
  const [searchText, setSearchText] = useState<string>("");
  const [checkedKeys, setCheckedKeys] =
    useState<React.Key[]>(initialSelectedKeys);
  const [resourceList, setResourceList] = useState<
    { uuid: string; name: string }[]
  >([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [filteredTreeData, setFilteredTreeData] = useState<
    VirtualizationDirDataNode[]
  >([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const { getResourceTree } = useGetResourceTree(setTreeData, setLoading);
  const { getTitleByType, getTargetTypes } = useShareResourceMeta(intl);

  //选择虚拟机 有两个视图
  const realResourceType = useMemo(
    () => (viewType === ViewType.directoryView ? "directory" : resourceType),
    [viewType, resourceType],
  );

  //初始化处理
  useEffect(() => {
    if (visible) {
      getResourceTree(realResourceType);
      setCheckedKeys(initialSelectedKeys);
    }
  }, [visible, realResourceType, initialSelectedKeys]);

  useEffect(() => {
    if (treeData.length > 0) {
      setFilteredTreeData(treeData);
      //默认展开所有节点
      const allKeys = flattenTree(treeData).map((item) => item.key);
      setExpandedKeys(allKeys);
      setAutoExpandParent(true);
    }
  }, [treeData]);

  const handleSearch = useCallback(
    (inputValue: string) => {
      setSearchText(inputValue);
      setIsSearching(!!inputValue);
      if (!inputValue) {
        setFilteredTreeData(treeData);
        setExpandedKeys(flattenTree(treeData).map((item) => item.key));
        setAutoExpandParent(false);
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

          const childrenMatch = node.children ? filterTree(node.children) : [];

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
      setAutoExpandParent(true);
    },
    [intl, treeData],
  );

  const handleExpand = (expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  const handleViewChange = useCallback((value: string) => {
    setViewType(value as ViewType);
    setCheckedKeys([]);
    setSearchText("");
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTreeData([]);
    setFilteredTreeData([]);
    setCheckedKeys([]);
    setSearchText("");
    getResourceTree(realResourceType);
  };

  const onCheck = (keys: any, info: any) => {
    /**
     * resourceType 为：vm, vm-template, image, l2-network, l3-network
     */
    const checkedNodes = info.checkedNodes
      .filter((it: any) => it.resourceType === resourceType)
      .map((it: any) => {
        return {
          uuid: it.key,
          name: it.title,
        };
      });

    setResourceList(checkedNodes);
    setCheckedKeys(keys);
  };

  const renderTitle = useMemo(
    () => getTitleByType(resourceType),
    [resourceType, getTitleByType],
  );

  const renderEmpty = () => {
    if (searchText) {
      return (
        <div className={styles.noResultContainer}>
          <div className={styles.noResultIcon}>
            <Icon type="inbox" size={24} />
          </div>
          <p className={styles.noResultText}>
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

  const handleOk = () => {
    onOk(resourceList);
    setCheckedKeys([]);
    setResourceList([]);
    setVisible(false);
  };

  //自渲染树节点
  const directoryItem = (nodeData: any) => {
    const {
      name: title,
      level,
      key,
      resourceType: nodeResourceType = VirtualizationDirItemType.VM,
      state,
      status,
      iconType,
      shareType,
    } = nodeData;

    const iconStatus = [
      HostState.Maintenance,
      HostState.PreMaintenance,
    ].includes(state)
      ? state
      : status;

    const extra = () => {
      if (resourceType === "l3-network" && nodeResourceType === "l2-network") {
        return null;
      }

      return [
        "vm",
        "image",
        "vm-template",
        "l2-network",
        "l3-network",
      ].includes(nodeResourceType) ? (
        <span style={STYLE_SHARE_TYPE}>
          <ShareType type={shareType} />
        </span>
      ) : null;
    };

    return (
      <TreeNodeTitle
        itemKey={key}
        type={nodeResourceType}
        title={title}
        titleNode={highlightText(
          getName(intl, { key, name: title, title }) as string,
          searchText,
        )}
        level={level}
        state={iconStatus}
        iconType={iconType}
        extra={extra()}
      />
    );
  };

  const renderTree = () => {
    return (
      <div className={styles.tree}>
        <Tree
          checkable
          switcherIcon={<Icon type="arrow-ios-down" />}
          titleRender={(nodeData) => directoryItem(nodeData)}
          onExpand={handleExpand}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
          onCheck={onCheck}
          checkedKeys={checkedKeys}
          treeData={filteredTreeData}
        />
      </div>
    );
  };

  const renderContent = () => {
    if (isSearching && filteredTreeData.length === 0) {
      return renderEmpty();
    }
    const targetTypes = getTargetTypes(resourceType);
    const flatNodes = flattenTree(filteredTreeData);
    const dataSource = flatNodes.filter((node) =>
      targetTypes.includes((node as any).resourceType),
    );
    return <Empty dataSource={dataSource}>{renderTree()}</Empty>;
  };

  return (
    <DialogBase
      title={renderTitle}
      visible={visible}
      setVisible={setVisible}
      onCancel={() => {
        setSearchText("");
        setCheckedKeys([]);
        setResourceList([]);
        setExpandedKeys([]);
        setTreeData([]);
        setVisible(false);
      }}
      onOk={handleOk}
      widthClassName="w-150"
    >
      <div className={styles.modalContainer}>
        {resourceType === "vm" && (
          <div>
            <RadioGroup
              onValueChange={handleViewChange}
              value={viewType}
              variant="button"
              style={STYLE_MARGIN_BOTTOM}
              options={[
                {
                  value: ViewType.hostView,
                  label: intl.formatMessage({
                    id: "vm.director.by.host",
                    defaultMessage: "Host View",
                  }),
                },
                {
                  value: ViewType.directoryView,
                  label: intl.formatMessage({
                    id: "vm.director.by.group",
                    defaultMessage: "Group View",
                  }),
                },
              ]}
            />
          </div>
        )}
        <div className="flex items-center gap-1" style={STYLE_MARGIN_BOTTOM}>
          <Button
            variant="secondary"
            onClick={handleRefresh}
            icon={<Icon type="refresh" />}
          />
          <Input
            placeholder={intl.formatMessage({
              id: "resource.tree.search.placeholder",
              defaultMessage: "Search by resource name",
            })}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
            style={STYLE_SEARCH_INPUT}
            suffix={<Icon type="search" />}
          />
        </div>

        <div className={styles["tree-body-container"]}>
          <Spin className={styles.spin} spinning={loading}>
            {renderContent()}
          </Spin>
        </div>
      </div>
    </DialogBase>
  );
};

export default ModalTreeSelector;
