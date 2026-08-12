import { Icon } from "@zstack/icon";
import type { VMGroupDirectoryTree } from "@zstack/virtualization-resource/src/pages/directory/utils";
import { useSize } from "ahooks";
import { Tree } from "antd";
import React, { useCallback, useRef, useState, useEffect } from "react";

import TreeNodeTitle from "./tree-node";

import style from "./style.module.less";

interface IProps {
  onCheck: any;
  onRightClick?: any;
  treeHeight: number;
  treeData: any[];
  selectedList: VMGroupDirectoryTree[];
}

const DEFAULT_OPTIONS = {
  config: {
    attributes: true,
    childList: true,
    subtree: true,
  },
};

const useMutationObservable = (
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
    if (!observer) {
      return;
    }
    const { config } = options;
    observer.observe(targetEl, config);
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [observer, targetEl, options]);
};

const DirectoryTree: React.FC<IProps> = ({
  treeData = [],
  treeHeight,
  selectedList = [],
  ...props
}) => {
  const [checkedKeys, setCheckedKeys] = useState<Array<string | number>>([]);
  const [treeWidth, setTreeWidth] = useState(900);
  const [virtualScrollHeight, setVirtualScrollHeight] = useState(500);
  const treeRef = useRef(null);
  const size = useSize(treeRef);
  const genKey = () => Math.random().toString(16).substring(2);
  const treeElementKey = useRef<string>(genKey());

  useEffect(() => {
    if (size?.width) {
      setTreeWidth(size.width);
    }
  }, [size]);

  useEffect(() => {
    if (treeHeight > 44) {
      setVirtualScrollHeight(treeHeight - 44);
    }
  }, [treeHeight]);

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
  const directoryItem = (nodeData: any) => {
    const {
      name,
      key,
      createDate,
      vmCount,
      state,
      status,
      groupName,
      zoneUuid,
    } = nodeData;

    return (
      <TreeNodeTitle
        itemKey={key}
        title={name}
        createDate={createDate}
        vmCount={vmCount}
        state={state}
        width={treeWidth}
        groupName={groupName}
        status={status}
        zoneUuid={zoneUuid}
        disabled={key === "-2"}
        rightClickMenu
        selectedList={selectedList}
        nodeData={nodeData}
        onDropdownVisibleChange={(visible) => {
          if (visible && checkedKeys.length === 0) {
            setCheckedKeys([key]);
            if (props.onCheck) {
              props.onCheck([nodeData]);
            }
          }
        }}
      />
    );
  };

  return (
    <div className={style.tree} ref={treeRef}>
      {/*ActionWrapper:目录树的右键操作*/}
      <Tree.DirectoryTree
        key={treeElementKey.current}
        height={virtualScrollHeight}
        checkable
        checkStrictly
        //checkedKeys={checkedKeys}
        titleRender={(nodeData) => directoryItem(nodeData)}
        onRightClick={(e) => props?.onRightClick?.(e?.node?.key)}
        showIcon={false}
        itemHeight={32}
        blockNode
        defaultExpandAll={true}
        showLine={false}
        treeData={treeData}
        switcherIcon={
          <div className={style.switcherIcon}>
            <Icon type="arrow-down-fill" />
          </div>
        }
        expandAction={false}
        {...props}
        onCheck={(checked, info) => {
          if (Array.isArray(checked)) {
            setCheckedKeys(checked.filter((value) => value !== "-2"));
          } else {
            setCheckedKeys(checked.checked.filter((value) => value !== "-2"));
          }
          if (props.onCheck) {
            props.onCheck(
              info.checkedNodes.filter((node) => node.key !== "-2"),
            );
          }
        }}
        checkedKeys={{ checked: checkedKeys, halfChecked: [] }}
      />
    </div>
  );
};

export default DirectoryTree;
