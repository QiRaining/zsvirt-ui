"use client";

import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import * as React from "react";
import type { NodeApi, TreeApi } from "react-arborist";
import { Tree as ArboristTree } from "react-arborist";
import { useIntl } from "react-intl";

import { useOverlay } from "../../../utils/use-overlay";
import { Button } from "../button";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { SearchInput } from "../search-input";
import type { TreeSelectProps, TreeNode, NodeRendererProps } from "./types";

/**
 * TreeSelect 的内部选中上下文
 * 用于将当前选中的 value 传递给节点渲染器，
 * 避免通过 react-arborist 的 selection prop 管理选中态（会触发 onSelect 闪退）
 */
const TreeSelectValueContext = React.createContext<string | undefined>(
  undefined,
);

/**
 * TreeSelect 默认节点渲染
 * 通过 Context 获取当前选中值，自行管理高亮状态
 */
function DefaultTreeSelectNode<T>({
  node,
  style,
}: NodeRendererProps<TreeNode<T>>) {
  const currentValue = React.useContext(TreeSelectValueContext);
  const isSelected = node.id === currentValue;
  const isDisabled = node.data.disabled;

  return (
    <div
      style={style}
      className={cn(
        "bg-neutral-0 flex cursor-pointer items-center gap-1 rounded-xs py-0.5 pr-2 transition-colors",
        "hover:bg-neutral-100",
        isSelected && "bg-theme-100 hover:bg-theme-100",
        isDisabled && "cursor-not-allowed opacity-50",
      )}
      onClick={(e) => {
        if (isDisabled) {
          return;
        }
        e.stopPropagation();
        node.select();
      }}
    >
      {/* 展开/折叠按钮 */}
      <button
        type="button"
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-xs p-0 hover:bg-neutral-200",
          !node.isInternal && "invisible",
        )}
        onClick={(e) => {
          e.stopPropagation();
          node.toggle();
        }}
      >
        {node.isOpen ? (
          <Icon type="arrow-ios-down" className="h-4 w-4 text-neutral-500" />
        ) : (
          <Icon type="arrow-ios-right" className="h-4 w-4 text-neutral-500" />
        )}
      </button>

      {/* 节点名称 */}
      <span
        className={cn(
          "flex-1 truncate text-sm",
          isSelected ? "text-theme-700 font-medium" : "text-neutral-700",
        )}
      >
        {node.data.name}
      </span>
    </div>
  );
}

/**
 * 在树数据中查找节点
 */
function findNodeById<T>(
  nodes: TreeNode<T>[],
  id: string,
): TreeNode<T> | undefined {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

/**
 * TreeSelect 组件
 *
 * 带下拉面板的树选择器，支持：
 * - 搜索过滤
 * - 虚拟滚动
 * - 自定义节点渲染
 *
 * 选中态通过 Context 传递给节点渲染器自行管理高亮，
 * 不使用 react-arborist 的 selection prop，避免 Popover 打开时
 * react-arborist 内部同步 selection 触发 onSelect 导致面板闪退。
 *
 * @example
 * ```tsx
 * <TreeSelect
 *   value={selectedId}
 *   onChange={(value, node) => setSelectedId(value)}
 *   data={treeData}
 *   placeholder="请选择"
 * />
 * ```
 */
export function TreeSelect<T = unknown>({
  value,
  onChange,
  data,
  placeholder,
  disabled = false,
  width = "100%",
  dropdownWidth,
  treeHeight = 280,
  showSearch = true,
  searchPlaceholder,
  className,
  emptyText,
  allowClear = false,
  onClear,
  indent = 24,
  rowHeight = 32,
  openByDefault = false,
  renderValue,
  renderNode,
  portalContainer,
}: TreeSelectProps<T>) {
  const intl = useIntl();
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const treeRef = React.useRef<TreeApi<TreeNode<T>> | null>(null);

  // 自动管理 z-index
  const { zIndex } = useOverlay({
    type: "popover",
    open,
  });

  // 查找选中的节点
  const selectedNode = React.useMemo(() => {
    if (!value) {
      return;
    }
    return findNodeById(data, value);
  }, [value, data]);

  // 默认搜索匹配
  const searchMatch = React.useCallback(
    (node: NodeApi<TreeNode<T>>, term: string) => {
      return node.data.name.toLowerCase().includes(term.toLowerCase());
    },
    [],
  );

  // 处理选择
  // react-arborist 在 selection prop 变化时也会触发 onSelect
  // 需要区分"用户点击新节点"和"程序化同步当前值"
  const handleSelect = React.useCallback(
    (nodes: NodeApi<TreeNode<T>>[]) => {
      if (nodes.length > 0) {
        const node = nodes[0];
        if (node.data.disabled) {
          return;
        }

        // 如果选中的是当前值，说明是程序化同步，不关闭 Popover
        if (node.id === value) {
          return;
        }

        onChange?.(node.id, node.data);
        setOpen(false);
        setSearchTerm("");
      }
    },
    [onChange, value],
  );

  // 处理清除
  const handleClear = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onChange?.("", undefined);
      onClear?.();
    },
    [onChange, onClear],
  );

  // 渲染选中值
  const renderSelectedValue = () => {
    if (renderValue) {
      return renderValue(selectedNode);
    }
    return selectedNode?.name;
  };

  // 渲染节点
  const nodeRenderer = React.useCallback(
    (props: NodeRendererProps<TreeNode<T>>) => {
      if (renderNode) {
        return renderNode(props);
      }
      return <DefaultTreeSelectNode {...props} />;
    },
    [renderNode],
  );

  const showClearButton = allowClear && value && !disabled;

  const defaultPlaceholder = intl.formatMessage({
    id: "tree.select.placeholder",
    defaultMessage: "请选择",
  });

  const defaultSearchPlaceholder = intl.formatMessage({
    id: "tree.select.search.placeholder",
    defaultMessage: "搜索...",
  });

  const defaultEmptyText = intl.formatMessage({
    id: "tree.select.empty",
    defaultMessage: "暂无数据",
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          type="button"
          className={cn(
            "group/tree-select relative box-border flex h-8 w-full items-center gap-1 rounded-xs",
            "bg-neutral-0 border-solid border-neutral-400 px-3 py-1 text-sm",
            "focus-visible:border-theme-600 focus-visible:ring-2 focus-visible:outline-none",
            "hover:border-theme-600 cursor-pointer",
            "disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500 disabled:hover:border-neutral-400",
            "data-[state=open]:border-theme-600 data-[state=open]:ring-theme-50 data-[state=open]:ring-2",
            "justify-between font-normal",
            className,
          )}
          style={{ width }}
          disabled={disabled}
        >
          <span
            className={cn(
              "flex-grow truncate text-left",
              !selectedNode && "text-neutral-500",
            )}
          >
            {selectedNode
              ? renderSelectedValue()
              : (placeholder ?? defaultPlaceholder)}
          </span>

          {showClearButton && (
            <div
              className="bg-neutral-0 absolute inset-y-0 right-6 flex items-center opacity-0 transition-opacity group-hover/tree-select:opacity-100"
              onPointerDown={handleClear}
            >
              <Icon type="close" className="h-4 w-4 text-neutral-500 hover:text-neutral-700" />
            </div>
          )}

          <Icon type="arrow-ios-down"
            className={cn(
              "shrink-0 text-neutral-700 transition-transform",
              open && "rotate-180",
            )}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="bg-neutral-0 overflow-hidden rounded-xs border border-solid border-neutral-300 p-0 shadow-lg"
        style={{
          width: dropdownWidth ?? (typeof width === "number" ? width : 320),
          zIndex,
        }}
        align="start"
        popoverPortalProps={{ container: portalContainer }}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        {showSearch && (
          <div className="border-b-solid bg-neutral-0 border-b border-b-neutral-200 p-2">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder ?? defaultSearchPlaceholder}
              className="w-full"
            />
          </div>
        )}

        <div
          className="bg-neutral-0 overflow-auto p-1"
          style={{ maxHeight: treeHeight + 16 }}
        >
          {data.length === 0 ? (
            <div className="bg-neutral-0 flex flex-col items-center justify-center py-8 text-neutral-400">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                <Icon type="inbox" className="h-6 w-6 text-neutral-300" />
              </div>
              <span className="text-sm">{emptyText ?? defaultEmptyText}</span>
            </div>
          ) : (
            <TreeSelectValueContext.Provider value={value}>
              <ArboristTree<TreeNode<T>>
                ref={treeRef}
                data={data}
                width="100%"
                height={treeHeight}
                indent={indent}
                rowHeight={rowHeight}
                overscanCount={5}
                openByDefault={openByDefault}
                searchTerm={searchTerm}
                searchMatch={searchMatch}
                selection={value}
                onSelect={handleSelect}
                disableDrag
                disableMultiSelection
                className="focus:outline-none"
              >
                {nodeRenderer}
              </ArboristTree>
            </TreeSelectValueContext.Provider>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { TreeSelectValueContext };

export default TreeSelect;
