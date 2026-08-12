import { Icon } from "@zstack/icon";
import { Tree } from "antd";
import React, { useCallback, useRef, useState, useEffect } from "react";

import "./style.less";
import { Empty } from "../empty";
import TreeNodeTitle from "./tree-node";
import { TreeItem } from "./type";

interface IProps {
  onSelectNode: any;
  onRightClick?: any;
  treeHeight: number;
  treeData: TreeItem[];
  selectedKeys: string[];
  selectType: "radio" | "checkbox";
}

const DEFAULT_OPTIONS = {
  config: {
    attributes: true,
    childList: true,
    subtree: true,
  },
};

//检测数加载完毕
export const useMutationObservable = (
  targetEl: any,
  cb: MutationCallback,
  options = DEFAULT_OPTIONS,
) => {
  const [observer, setObserver] = useState<any>(null);

  useEffect(() => {
    const obs = new MutationObserver(cb);
    setObserver(obs as any);
  }, [cb, options, setObserver]);

  useEffect(() => {
    if (!observer) return;
    const { config } = options;
    observer.observe(targetEl, config);
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [observer, targetEl, options]);
};

const RunPathTree: React.FC<IProps> = ({
  treeData = [],
  treeHeight,
  selectType,
  selectedKeys,
  ...props
}) => {
  if (treeData?.length === 0) {
    return <Empty style={{ margin: "unset", paddingTop: 84 }} />;
  }

  const treeRef = useRef(null);
  const genKey = () => Math.random().toString(16).substring(2);
  const treeElementKey = useRef<string>(genKey());

  const reRenderTreeScroll = useCallback(() => {
    const yScrollBar = document.getElementsByClassName(
      "ant-tree-list-scrollbar ",
    )[0] as HTMLElement;
    const scrollbar = document.getElementsByClassName(
      "ant-tree-list-scrollbar-thumb",
    )[0] as HTMLElement;
    const treeListHolderInner = document.getElementsByClassName(
      "ant-tree-list-holder-inner",
    ) as HTMLCollectionOf<Element>;

    scrollbar.style.background = "rgba(219, 221, 224)";
    if (
      Number(treeListHolderInner.item(0)?.scrollHeight) > treeHeight - 60 &&
      yScrollBar?.style?.display
    ) {
      yScrollBar.style.display = "unset";
    } else if (yScrollBar?.style?.display) {
      yScrollBar.style.display = "none";
    }
  }, [treeHeight, treeRef]);

  useMutationObservable(treeRef.current, reRenderTreeScroll);

  //自渲染树节点
  const directoryItem = (nodeData: TreeItem) => {
    const { title, key, attr, icon, disabled, tooltip } = nodeData;

    return (
      <TreeNodeTitle
        itemKey={key}
        icon={icon}
        title={title}
        attr={attr}
        tooltip={tooltip}
        disabled={disabled}
      />
    );
  };

  const onSelect = (e: any, node: any) => {
    props.onSelectNode([node?.node.attr], e);
  };

  const onCheck = (checkedKeys: any, e: any) => {
    props.onSelectNode(
      e?.checkedNodes.map((it: any) => it.attr),
      e,
    );
  };

  const _props = {
    ...props,
    [selectType === "checkbox" ? "checkedKeys" : "selectedKeys"]: selectedKeys,
  };

  return (
    <div className="tree" ref={treeRef}>
      <Tree.DirectoryTree
        key={treeElementKey.current}
        height={treeHeight}
        onCheck={selectType === "checkbox" ? onCheck : undefined}
        onSelect={selectType === "radio" ? onSelect : undefined}
        titleRender={(nodeData: any) => directoryItem(nodeData)}
        onRightClick={(e: any) => props?.onRightClick?.(e?.node?.key)}
        showIcon={false}
        itemHeight={32}
        checkable={selectType === "checkbox"}
        selectable={selectType !== "checkbox"}
        blockNode
        defaultExpandAll={true}
        showLine={false}
        treeData={treeData}
        switcherIcon={<Icon type="arrow-down-fill" />}
        expandAction={false}
        {..._props}
      />
    </div>
  );
};

export default RunPathTree;
