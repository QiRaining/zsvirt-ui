import { gql, useLazyQuery } from "@apollo/client";
import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Input, Spin } from "@zstack/zsphere-components";
import { DialogBase } from "@zstack/zsphere-design-biz";
import { Op } from "@zstack/zsphere-types";
import { Tree } from "antd";
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";

import { useFormatHardwareInfos } from "../../../baremetal-chassis/config/useColumnConfig";

import styles from "./style.module.less";

const spaceStyle: React.CSSProperties = { marginBottom: 8 };
const iconLightStyle: React.CSSProperties = {
  color: "var(--neutral-700)",
  fontSize: 16,
};
const inputSearchStyle: React.CSSProperties = { width: 320, marginRight: 8 };
const iconDarkStyle: React.CSSProperties = {
  color: "var(--neutral-600)",
  fontSize: 16,
};

const BAREMETAL_CHASSIS_LIST = gql`
  query baremetalChassisList($conditions: [Condition!]) {
    baremetalChassisList(
      start: 0
      limit: 1000
      replyWithCount: true
      conditions: $conditions
    ) {
      total
      list {
        uuid
        name
        cluster {
          uuid
          name
        }
        hardwareInfos {
          uuid
          type
          content
          chassisUuid
          createDate
          lastOpDate
        }
        state
        status
      }
    }
  }
`;

export interface IResource {
  uuid: string;
  name: string;
}

interface IProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onOk: (resourceList: IResource[]) => void;
  initialSelectedKeys?: string[];
  getCurrentSelected?: () => IResource[];
}

const BaremetalChassisTreeSelector: React.FC<IProps> = ({
  visible,
  setVisible,
  onOk,
  initialSelectedKeys = [],
  getCurrentSelected,
}) => {
  const intl = useIntl();
  const { getCpuNum, getMemorySizeSize } = useFormatHardwareInfos();
  const fallbackText = intl.formatMessage({
    id: "no.get",
    defaultMessage: "Nothing obtained",
  });

  const normalizeDisplayValue = (value: React.ReactNode): string => {
    if (typeof value === "string") {
      return value;
    }
    if (React.isValidElement(value)) {
      const { children } = value.props;
      if (typeof children === "string") {
        return children;
      }
      if (Array.isArray(children)) {
        const flattened = children
          .filter((child) => typeof child === "string")
          .join("");
        return flattened || fallbackText;
      }
    }
    return fallbackText;
  };

  const [treeData, setTreeData] = useState<any[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [checkedKeys, setCheckedKeys] =
    useState<React.Key[]>(initialSelectedKeys);
  const [resourceList, setResourceList] = useState<IResource[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");

  const [fetchChassis] = useLazyQuery(BAREMETAL_CHASSIS_LIST, {
    fetchPolicy: "no-cache",
    onError: () => {
      setLoading(false);
    },
    onCompleted: (data) => {
      const list = data?.baremetalChassisList?.list ?? [];
      const groupMap: Record<string, any[]> = {};
      list.forEach((it: any) => {
        const hasHardwareInfos =
          Array.isArray(it?.hardwareInfos) && it.hardwareInfos.length > 0;
        if (!hasHardwareInfos) {
          return;
        }

        const groupName = it?.cluster?.name;
        if (!groupMap[groupName]) {
          groupMap[groupName] = [];
        }
        const cpuDisplay = normalizeDisplayValue(getCpuNum(it));
        const memoryDisplay = normalizeDisplayValue(getMemorySizeSize(it));
        const titleNode = (
          <div className={styles.chassisNode}>
            <span className={styles.chassisName} title={it.name}>
              {it.name}
            </span>
            <span className={styles.chassisMetaWrapper}>
              <span className={styles.chassisMeta}>{cpuDisplay}</span>
              <span className={styles.chassisMetaDivider}>|</span>
              <span className={styles.chassisMeta}>{memoryDisplay}</span>
            </span>
          </div>
        );

        groupMap[groupName].push({
          ...it,
          title: titleNode,
          key: it.uuid,
          isLeaf: true,
          rawTitle: it.name,
        });
      });
      const nodes = Object.keys(groupMap).map((name) => ({
        title: name,
        key: `group-${name}`,
        children: groupMap[name],
        rawTitle: name,
      }));
      setTreeData(nodes);
      setExpandedKeys(nodes.map((n) => n.key));
      setAutoExpandParent(true);
      setLoading(false);
      if (getCurrentSelected) {
        const currentChassis = getCurrentSelected();
        if (currentChassis.length > 0) {
          const selectedKeys = currentChassis.map((it: IResource) => it.uuid);
          setCheckedKeys(selectedKeys);
          setResourceList(currentChassis);
        }
      }
    },
  });
  useEffect(() => {
    if (visible) {
      setLoading(true);
      setCheckedKeys([]);
      setResourceList([]);
      setSearchText("");
      fetchChassis({
        variables: {
          conditions: [
            { key: "state", op: Op.eq, value: "Enabled" },
            { key: "status", op: Op.eq, value: "Available" },
          ],
        },
      });
    }
  }, [visible, fetchChassis]);

  const handleExpand = (keys: React.Key[]) => {
    setExpandedKeys(keys);
    setAutoExpandParent(false);
  };

  const getNodeTitleText = useCallback((node: any): string => {
    return node?.rawTitle || "";
  }, []);

  const filterTree = useCallback(
    (nodes: any[], keyword: string): any[] => {
      if (!keyword) {
        return nodes;
      }
      const lowercaseKeyword = keyword.toLowerCase();
      return nodes
        .map((node) => {
          if (node.children) {
            const filteredChildren = filterTree(node.children, keyword);
            if (
              filteredChildren.length > 0 ||
              getNodeTitleText(node).toLowerCase().includes(lowercaseKeyword)
            ) {
              return { ...node, children: filteredChildren };
            }
            return null;
          }
          return getNodeTitleText(node).toLowerCase().includes(lowercaseKeyword)
            ? node
            : null;
        })
        .filter(Boolean);
    },
    [getNodeTitleText],
  );

  const filteredTreeData = useMemo(
    () => filterTree(treeData, searchText.trim()),
    [filterTree, treeData, searchText],
  );
  const isSearching = Boolean(searchText.trim());
  const noData = !loading && filteredTreeData.length === 0;
  const onCheck = (keys: any, info: any) => {
    const currentTreeSelected = info.checkedNodes
      .filter((n: any) => n.isLeaf)
      .map((n: any) => ({
        ...n,
        uuid: n.key,
        name: getNodeTitleText(n) || String(n.key),
      }));

    const previousSelected = getCurrentSelected ? getCurrentSelected() : [];

    const allSelected = [
      ...previousSelected.filter((item: IResource) => keys.includes(item.uuid)),
      ...currentTreeSelected,
    ];

    const uniqueSelected = allSelected.reduce(
      (acc: IResource[], current: IResource) => {
        if (!acc.some((item) => item.uuid === current.uuid)) {
          acc.push(current);
        }
        return acc;
      },
      [],
    );

    setCheckedKeys(keys);
    setResourceList(uniqueSelected);
  };

  const handleRefresh = () => {
    setLoading(true);
    setCheckedKeys([]);
    setResourceList([]);
    setSearchText("");
    fetchChassis({
      variables: {
        conditions: [
          { key: "state", op: Op.eq, value: "Enabled" },
          { key: "status", op: Op.eq, value: "Available" },
        ],
      },
    });
  };

  const handleOk = () => {
    onOk(resourceList);
    setVisible(false);
    setCheckedKeys([]);
    setResourceList([]);
    setSearchText("");
  };

  const handleCancel = () => {
    setVisible(false);
    setSearchText("");
    setCheckedKeys([]);
    setResourceList([]);
  };

  return (
    <DialogBase
      title={intl.formatMessage({
        id: "drawerTitle.select.baremetalChassis",
        defaultMessage: "Select Bare Metal Chassis",
      })}
      visible={visible}
      setVisible={setVisible}
      widthClassName="w-[600px]"
      onCancel={handleCancel}
      onOk={handleOk}
    >
      <div className={styles.modalContainer}>
        <div className="flex items-center gap-1" style={spaceStyle}>
          <Button
            variant="secondary"
            onClick={handleRefresh}
            icon={<Icon type="refresh" style={iconLightStyle} />}
          />
          <Input
            placeholder={intl.formatMessage({
              id: "resource.tree.search.placeholder",
              defaultMessage: "Search by resource name",
            })}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={inputSearchStyle}
            suffix={<Icon type="search" />}
          />
        </div>
        <div className={styles["tree-body-container"]}>
          <Spin className={styles.spin} spinning={loading}>
            {noData ? (
              <div className={styles.noResultContainer}>
                <div className={styles.noResultIcon}>
                  <Icon type="inbox" size={24} />
                </div>
                <p className={styles.noResultText}>
                  {isSearching
                    ? intl.formatMessage({
                        id: "treeview.search.no.result",
                        defaultMessage: "No search results found.",
                      })
                    : intl.formatMessage({
                        id: "treeview.no.data",
                        defaultMessage: "No Available Resources",
                      })}
                </p>
              </div>
            ) : (
              <div className={styles.tree}>
                <Tree
                  checkable
                  switcherIcon={<Icon style={iconDarkStyle} type="arrow-down-fill" />}
                  onExpand={(keys) => handleExpand(keys as React.Key[])}
                  expandedKeys={expandedKeys}
                  autoExpandParent={autoExpandParent}
                  onCheck={onCheck}
                  checkedKeys={checkedKeys}
                  treeData={filteredTreeData}
                />
              </div>
            )}
          </Spin>
        </div>
      </div>
    </DialogBase>
  );
};

export default BaremetalChassisTreeSelector;
