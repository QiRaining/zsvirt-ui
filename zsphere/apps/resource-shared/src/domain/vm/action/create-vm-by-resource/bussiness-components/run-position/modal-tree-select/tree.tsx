import { Icon } from "@zstack/icon";
import { Empty } from "@zstack/zsphere-components";
import { NodeType } from "@zstack/zsphere-types";
import { Tree } from "antd";
import React from "react";
import { useIntl } from "react-intl";

import TreeNodeTitle from "./tree-node";

import style from "./style.module.less";

interface IProps {
  onSelectNode: any;
  onRightClick?: any;
  treeHeight: number;
  treeData: any[];
  selectedKeys: string[];
}

const RunPathTree: React.FC<IProps> = ({
  treeData = [],
  treeHeight,
  selectedKeys,
  ...props
}) => {
  const intl = useIntl();

  if (treeData?.length === 0) {
    return <Empty style={{ margin: "unset", paddingTop: 84 }} />;
  }

  //自渲染树节点
  const directoryItem = (nodeData: any) => {
    const { name, key, type, attr } = nodeData;

    const extra = () => {
      return type === "host" &&
        attr?.hostNodeInfo?.nodeType === NodeType.ManagementNode ? (
        <span className={style.extraWrapper}>
          {intl.formatMessage({
            id: "mangementNode",
            defaultMessage: "Management Node",
          })}
        </span>
      ) : null;
    };

    return (
      <TreeNodeTitle
        itemKey={key}
        title={name}
        attr={attr}
        type={type}
        extra={extra()}
      />
    );
  };

  const onSelect = (e: any, node: any) => {
    props.onSelectNode([node?.node.attr]);
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
