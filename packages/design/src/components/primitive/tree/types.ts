"use client";

import type { NodeApi, NodeRendererProps } from "react-arborist";

/**
 * 树节点数据结构
 * @template T 节点附加数据类型
 */
export interface TreeNode<T = unknown> {
  /** 节点唯一标识 */
  id: string;
  /** 节点名称（用于搜索匹配） */
  name: string;
  /** 子节点 */
  children?: TreeNode<T>[];
  /** 节点是否禁用 */
  disabled?: boolean;
  /** 节点附加数据 */
  data?: T;
}

/**
 * 拖拽移动事件参数
 */
export interface TreeMoveEvent {
  /** 被拖拽的节点ID数组 */
  dragIds: string[];
  /** 目标父节点ID，null表示根级别 */
  parentId: string | null;
  /** 目标索引位置 */
  index: number;
}

/**
 * Tree 组件属性
 * @template T 节点附加数据类型
 */
export interface TreeProps<T = unknown> {
  /** 树数据 */
  data: TreeNode<T>[];
  /** 树高度（用于虚拟滚动） */
  height?: number;
  /** 树宽度 */
  width?: string | number;
  /** 缩进宽度（默认24px） */
  indent?: number;
  /** 行高（默认32px） */
  rowHeight?: number;
  /** 超出渲染数量（虚拟滚动优化） */
  overscanCount?: number;

  // === 选择相关 ===
  /**
   * 当前选中的节点ID（受控模式）
   *
   * 注意：react-arborist 的 selection prop 只支持单个 ID。
   * 如果传入数组，只有第一个元素会被使用。
   * 多选功能通过用户交互（Ctrl+Click）实现，而非此 prop 控制。
   */
  selection?: string | string[];
  /** 选择变化回调 */
  onSelect?: (nodes: NodeApi<TreeNode<T>>[]) => void;
  /** 禁用多选（默认 true，即只能单选） */
  disableMultiSelection?: boolean;

  // === 拖拽相关 ===
  /** 是否禁用拖拽 */
  disableDrag?: boolean;
  /** 是否禁用放置 */
  disableDrop?: boolean;
  /** 拖拽移动回调 */
  onMove?: (event: TreeMoveEvent) => void;
  /** 自定义禁用放置判断 */
  canDrop?: (args: {
    parentNode: NodeApi<TreeNode<T>> | null;
    dragNodes: NodeApi<TreeNode<T>>[];
    index: number;
  }) => boolean;

  // === 搜索相关 ===
  /** 搜索关键词 */
  searchTerm?: string;
  /** 自定义搜索匹配函数 */
  searchMatch?: (node: NodeApi<TreeNode<T>>, term: string) => boolean;

  // === 展开控制 ===
  /** 默认是否全部展开 */
  openByDefault?: boolean;
  /** 初始展开状态 */
  initialOpenState?: Record<string, boolean>;
  /** 双击节点时展开/折叠（默认 false） */
  expandOnDoubleClick?: boolean;

  // === 自定义渲染 ===
  /** 自定义节点渲染 */
  children?: (props: TreeNodeRendererProps<T>) => React.ReactNode;

  /** 自定义类名 */
  className?: string;
}

/**
 * TreeSelect 组件属性
 * @template T 节点附加数据类型
 */
export interface TreeSelectProps<T = unknown> {
  /** 当前选中的节点ID */
  value?: string;
  /** 选择变化回调 */
  onChange?: (value: string, node: TreeNode<T> | undefined) => void;
  /** 树数据 */
  data: TreeNode<T>[];
  /** 占位符文本 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 选择框宽度 */
  width?: number | string;
  /** 下拉面板宽度 */
  dropdownWidth?: number | string;
  /** 树高度 */
  treeHeight?: number;
  /** 是否显示搜索框 */
  showSearch?: boolean;
  /** 搜索框占位符 */
  searchPlaceholder?: string;
  /** 自定义类名 */
  className?: string;
  /** 空数据时的提示文本 */
  emptyText?: string;
  /** 是否允许清除 */
  allowClear?: boolean;
  /** 清除回调 */
  onClear?: () => void;
  /** 缩进宽度 */
  indent?: number;
  /** 行高 */
  rowHeight?: number;
  /** 是否默认展开所有节点 */
  openByDefault?: boolean;
  /** 自定义渲染选中值 */
  renderValue?: (node: TreeNode<T> | undefined) => React.ReactNode;
  /** 自定义节点渲染 */
  renderNode?: (props: NodeRendererProps<TreeNode<T>>) => React.ReactNode;
  /** Popover 的 portal 容器 */
  portalContainer?: HTMLElement | null;
}

// 重新导出 react-arborist 类型
export type { NodeApi, NodeRendererProps };

/**
 * 扩展的节点渲染 Props，包含 Tree 组件注入的额外属性
 */
export interface TreeNodeRendererProps<T = unknown> extends NodeRendererProps<
  TreeNode<T>
> {
  /** 双击展开/折叠处理函数，当 Tree 的 expandOnDoubleClick 为 true 时有效 */
  onDoubleClickExpand?: (e: React.MouseEvent) => void;
}
