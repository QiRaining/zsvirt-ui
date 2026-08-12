import { Button, Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Empty, Spin, Select } from "@zstack/zsphere-components";
import { Tree } from "antd";
import cls from "classnames";
import React from "react";
import { useIntl } from "react-intl";

import SearchInput from "../search-Input";
import TreeNodeTitle from "../tree-node-title";

import style from "./style.module.less";

const { Option } = Select;

interface IProps {
  viewType: "group" | "cluster" | "empty";
  expandedKeys: string[];
  selectedKeys: string[];
  onTreeNodeSelect: any;
  onTreeNodeExpand: any;
  groupTreeOptions: any;
  oneKeyExpand: any;
  serachGroupTree: any;
  setSearchValue: any;
  onDropdownVisibleChange: any;
  treeData: any[];
  loading: boolean;
  open: boolean;
  width: number;
  maxContentWidth?: number;
  searchValue?: string | number | readonly string[] | undefined | null;
  showSearch?: boolean;
  dropdownStyles?: React.CSSProperties;
  treeHeight?: number;
  treeClassName?: string;
  nodeTitleClassName?: string;
  treeShowLine?: boolean;
  treeNodeShowCount?: boolean;
}

const DirectoryTreeSelect: React.FC<IProps> = ({
  viewType = "group",
  selectedKeys = ["-1"],
  expandedKeys = ["-1"],
  loading = true,
  treeData = [],
  groupTreeOptions = [],
  width = 320,
  maxContentWidth = 200,
  open,
  searchValue = null,
  showSearch = true,
  dropdownStyles,
  treeHeight = 238,
  treeClassName,
  nodeTitleClassName,
  treeShowLine = true,
  treeNodeShowCount = true,
  ...props
}) => {
  const intl = useIntl();
  //自渲染树节点
  const directoryItem = (nodeData: any) => {
    const { title, level, key, groupName, vmCount } = nodeData;

    return (
      <TreeNodeTitle
        view="treeSelect"
        itemKey={key}
        title={title}
        level={level}
        vmNums={vmCount}
        showCount={treeNodeShowCount}
        titleClassName={nodeTitleClassName}
        viewType={viewType}
        groupName={groupName}
        isSelected={key === selectedKeys[0]}
      />
    );
  };

  return (
    <Select
      onChange={props?.onTreeNodeSelect}
      style={{ width, display: "block" }}
      value={selectedKeys}
      dropdownStyle={
        dropdownStyles ?? {
          width: 400,
          maxHeight: 400,
        }
      }
      dropdownMatchSelectWidth={false}
      open={open}
      onDropdownVisibleChange={props?.onDropdownVisibleChange}
      dropdownRender={() => {
        return (
          <Spin spinning={loading}>
            <div className={style["select-tree"]}>
              {showSearch && (
                <div className={style.toolbar}>
                  <Button
                    variant="ghost"
                    className={style.expand}
                    onClick={props?.oneKeyExpand}
                    icon={
                      <Icon
                        className={style.icon}
                        size={16}
                        type={expandedKeys.length !== 0 ? "expend" : "fold"}
                      />
                    }
                  />
                  <SearchInput
                    style={{ marginLeft: 8 }}
                    viewType="group"
                    value={searchValue}
                    serachGroupTree={props.serachGroupTree}
                    setFilterValue={props.setSearchValue}
                  />
                </div>
              )}
              <div className={cls(style.tree, treeClassName)}>
                {showSearch && treeData.length === 0 ? (
                  <Empty
                    className={style.empty}
                    type="Select"
                    description={intl.formatMessage({
                      id: "noSearchResults",
                      defaultMessage: "No results found",
                    })}
                  />
                ) : (
                  <Tree
                    height={treeHeight}
                    titleRender={(nodeData) => directoryItem(nodeData)}
                    showIcon={false}
                    blockNode
                    showLine={treeShowLine}
                    treeData={treeData}
                    onSelect={props?.onTreeNodeSelect}
                    onExpand={props.onTreeNodeExpand}
                    switcherIcon={<Icon type="arrow-down-fill" />}
                    expandedKeys={expandedKeys}
                    selectedKeys={selectedKeys}
                  />
                )}
              </div>
            </div>
          </Spin>
        );
      }}
    >
      {groupTreeOptions.map(
        (dir: { value: React.Key | null | undefined; label: any }) => (
          <Option
            key={dir.value}
            label={
              <div style={{ maxWidth: maxContentWidth }}>
                <Text className={style.optionText}>{dir.label}</Text>
              </div>
            }
            value={dir.value}
            title={dir.label}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ maxWidth: maxContentWidth }}>
                <Text className={style.optionText}>{dir.label}</Text>
              </div>
            </div>
          </Option>
        ),
      )}
    </Select>
  );
};

export default DirectoryTreeSelect;
