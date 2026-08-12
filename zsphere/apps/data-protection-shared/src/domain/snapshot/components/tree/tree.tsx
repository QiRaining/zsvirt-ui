import { Icon } from "@zstack/icon";
import { ActionWrapper } from "@zstack/zsphere-components";
import { useSize } from "ahooks";
import { Tree } from "antd";
import React, { useCallback, useRef } from "react";

import { useActionConfig as useSnapshotActionConfig } from "../../config";
import useVmActionConfig from "../../config/useActionConfig-sub-vm";
import TreeNodeTitle from "./tree-node";

import style from "./style.module.less";

interface IProps {
  expandedKeys: string[];
  selectedKeys: string[];
  onTreeNodeSelect: any;
  onTreeNodeExpand: any;
  onRightClick?: any;
  treeData: any[];
  onLoad?: any;
  loadedKeys?: string[];
}

const DirectoryTree: React.FC<IProps> = ({
  selectedKeys = ["-1"],
  expandedKeys = ["-1"],
  treeData = [],
  ...props
}) => {
  const treeRef = useRef(null);
  const size = useSize(treeRef);
  const genKey = () => Math.random().toString(16).substring(2);
  const treeElementKey = useRef<string>(genKey());

  //不同视角，不同操作
  const view = useCallback((_: any[], type: string) => {
    if (type === "vm") {
      return "sub.virtualization.snapshot.dir";
    }
    return "virtualization.dir";
  }, []);

  //自渲染树节点
  const directoryItem = (nodeData: any) => {
    const {
      title,
      level,
      key,
      expandLoading,
      attr = {},
      resourceType,
      latest,
      current,
      snapshotCount,
      snapshotSize,
    } = nodeData;

    //ceph比较特殊，会产生多个latest，需要latest&currnet
    const isCurrent = current && latest;

    return (
      <TreeNodeTitle
        itemKey={key}
        type={resourceType}
        title={title}
        level={level}
        latest={latest}
        attr={attr}
        isCurrent={isCurrent}
        expandLoading={expandLoading}
        count={snapshotCount}
        size={snapshotSize}
      />
    );
  };

  return (
    <div className={style.tree} ref={treeRef}>
      {/*ActionWrapper:目录树的右键操作*/}
      <ActionWrapper
        view={view}
        position="directory"
        actionConfig={{
          vm: useVmActionConfig() as any,
          snapshot: useSnapshotActionConfig(),
        }}
      >
        <Tree.DirectoryTree
          key={treeElementKey.current}
          height={size.height}
          titleRender={(nodeData) => directoryItem(nodeData)}
          onRightClick={(e) => {
            props?.onRightClick?.(e?.node?.key);
            props?.onTreeNodeSelect?.([e?.node?.key], e);
          }}
          showIcon={false}
          itemHeight={32}
          blockNode
          showLine={false}
          treeData={treeData}
          onSelect={props?.onTreeNodeSelect}
          onExpand={props?.onTreeNodeExpand}
          switcherIcon={<Icon type="arrow-down-fill" />}
          expandedKeys={expandedKeys}
          expandAction={false}
          selectedKeys={selectedKeys}
          {...props}
        />
      </ActionWrapper>
    </div>
  );
};

export default DirectoryTree;
