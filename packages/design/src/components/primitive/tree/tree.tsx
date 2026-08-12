"use client";

import { cn } from "@zstack/utils";
import * as React from "react";
import type { NodeApi, TreeApi } from "react-arborist";
import { Tree as ArboristTree } from "react-arborist";

import { DefaultTreeNode } from "./tree-node";
import type {
  TreeProps,
  TreeNode,
  TreeMoveEvent,
  TreeNodeRendererProps,
} from "./types";

interface TreeComponent {
  <T = unknown>(
    props: TreeProps<T> & { ref?: React.Ref<TreeRef<T>> },
  ): React.ReactElement | null;
}

/**
 * Tree 组件
 *
 * 基于 react-arborist 封装的高性能树组件，支持：
 * - 虚拟滚动（可处理上万节点）
 * - 拖拽排序
 * - 搜索过滤
 * - 键盘导航
 * - 完全自定义节点渲染
 *
 * @example
 * ```tsx
 * <Tree
 *   data={treeData}
 *   height={400}
 *   onSelect={(nodes) => console.log('selected:', nodes)}
 * />
 * ```
 */

const TreeInner = <T = unknown>(
  {
    data,
    height = 300,
    width = "100%",
    indent = 24,
    rowHeight = 32,
    overscanCount = 5,
    selection,
    onSelect,
    disableMultiSelection = true,
    disableDrag = false,
    disableDrop = false,
    onMove,
    canDrop,
    searchTerm,
    searchMatch,
    openByDefault = false,
    initialOpenState,
    expandOnDoubleClick = false,
    children,
    className,
  }: TreeProps<T>,
  ref: React.ForwardedRef<TreeRef<T>>,
) => {
  const treeRef = React.useRef<TreeApi<TreeNode<T>> | null>(null);

  React.useImperativeHandle(ref, () => treeRef.current!);

  // 默认搜索匹配函数
  const defaultSearchMatch = React.useCallback(
    (node: NodeApi<TreeNode<T>>, term: string) => {
      return node.data.name.toLowerCase().includes(term.toLowerCase());
    },
    [],
  );

  // 处理选择
  const handleSelect = React.useCallback(
    (nodes: NodeApi<TreeNode<T>>[]) => {
      onSelect?.(nodes);
    },
    [onSelect],
  );

  // 处理拖拽移动
  const handleMove = React.useCallback(
    (args: {
      dragIds: string[];
      parentId: string | null;
      index: number;
      parentNode: NodeApi<TreeNode<T>> | null;
    }) => {
      if (!onMove) {
        return;
      }

      const event: TreeMoveEvent = {
        dragIds: args.dragIds,
        parentId: args.parentId,
        index: args.index,
      };

      onMove(event);
    },
    [onMove],
  );

  // 处理禁用放置判断
  const handleDisableDrop = React.useCallback(
    (args: {
      parentNode: NodeApi<TreeNode<T>> | null;
      dragNodes: NodeApi<TreeNode<T>>[];
      index: number;
    }) => {
      if (disableDrop) {
        return true;
      }

      // 不能放到禁用的节点下
      if (args.parentNode?.data.disabled) {
        return true;
      }

      // 自定义判断
      if (canDrop) {
        return !canDrop(args);
      }

      return false;
    },
    [disableDrop, canDrop],
  );

  // 渲染节点
  const renderNode = React.useCallback(
    (props: TreeNodeRendererProps<T>) => {
      const enhancedProps: TreeNodeRendererProps<T> = {
        ...props,
        onDoubleClickExpand: expandOnDoubleClick
          ? (e: React.MouseEvent) => {
              if (props.node.data.disabled) {
                return;
              }
              if (props.node.isInternal) {
                e.stopPropagation();
                props.node.toggle();
              }
            }
          : undefined,
      };

      if (children) {
        return children(enhancedProps);
      }
      return <DefaultTreeNode<T> {...enhancedProps} />;
    },
    [children, expandOnDoubleClick],
  );

  // Convert selection to string format expected by react-arborist
  // react-arborist only accepts a single id as string, not array
  const normalizedSelection = React.useMemo(() => {
    if (!selection) {
      return;
    }
    return Array.isArray(selection) ? selection[0] : selection;
  }, [selection]);

  return (
    <div className={cn("focus:outline-none", className)}>
      <ArboristTree<TreeNode<T>>
        ref={treeRef}
        data={data}
        width={width}
        height={height}
        indent={indent}
        rowHeight={rowHeight}
        overscanCount={overscanCount}
        openByDefault={openByDefault}
        initialOpenState={initialOpenState}
        searchTerm={searchTerm}
        searchMatch={searchMatch ?? defaultSearchMatch}
        selection={normalizedSelection}
        onSelect={handleSelect}
        onMove={handleMove}
        disableDrag={disableDrag}
        disableDrop={handleDisableDrop}
        disableMultiSelection={disableMultiSelection}
        className="focus:outline-none"
      >
        {renderNode}
      </ArboristTree>
    </div>
  );
};

export const Tree = React.forwardRef(TreeInner) as TreeComponent;

// 导出树的 ref 类型
export type TreeRef<T = unknown> = TreeApi<TreeNode<T>>;

export default Tree;
