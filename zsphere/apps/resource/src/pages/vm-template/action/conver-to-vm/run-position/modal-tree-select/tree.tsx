import { Icon } from "@zstack/icon";
import { Empty } from "@zstack/zsphere-components";
import { Tree } from "antd";
import React from "react";

import TreeNodeTitle from "./tree-node";

import style from "./style.module.less";

interface IProps {
  onSelectNode: any;
  onRightClick?: any;
  treeHeight: number;
  treeData: any[];
  selectedKeys: string[];
}

const STYLE_EMPTY = { margin: "unset", paddingTop: 84 } as const;

const RunPathTree: React.FC<IProps> = ({
  treeData = [],
  treeHeight,
  selectedKeys,
  ...props
}) => {
  if (treeData?.length === 0) {
    return <Empty style={STYLE_EMPTY} />;
  }

  //自渲染树节点
  const directoryItem = (nodeData: any) => {
    const { name, key, resourceType, state = "", status = "" } = nodeData;

    return (
      <TreeNodeTitle
        itemKey={key}
        title={name}
        attr={{
          state,
          status,
        }}
        type={resourceType}
      />
    );
  };

  const onSelect = (e: any, node: any) => {
    const { uuid, name, resourceType } = node?.node ?? {};
    props.onSelectNode([{ uuid, name, resourceType }]);
  };

  return (
    <div className={style.tree}>
      <Tree.DirectoryTree
        itemHeight={32}
        height={treeHeight}
        onSelect={onSelect}
        titleRender={(nodeData) => directoryItem(nodeData)}
        onRightClick={(e) => props?.onRightClick?.(e?.node?.key)}
        blockNode
        defaultExpandAll={true}
        showIcon={false}
        showLine={false}
        treeData={treeData}
        expandAction={false}
        switcherIcon={<Icon type="arrow-down-fill" />}
        selectedKeys={selectedKeys}
        {...props}
      />
    </div>
  );
};

export default RunPathTree;
