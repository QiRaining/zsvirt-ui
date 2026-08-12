import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Icon } from "@zstack/icon";
import { Item } from "@zstack/zsphere-types";
import { bus } from "@zstack/zsphere-utils";
import { useMount, usePersistFn, useUnmount, useUpdateEffect } from "ahooks";
import { Affix, Table as AntTable, Button, Col, Row } from "antd";
import cls from "classnames";
import { get, sum } from "lodash-es";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useIntl } from "react-intl";

import { getBaseCls } from "../../_utils/common";
import Text from "../text";
import ResizableTitle from "./resizable-title";

import "./style.less";
import { ITableProps } from "./type";

// todo theme
const baseCls = getBaseCls("table");

const DisabledSortableContext = React.createContext<string[]>([]);
const RowDragListenersContext =
  React.createContext<ReturnType<typeof useSortable>["listeners"]>(undefined);

function DragHandleCell({ disabled }: { disabled: boolean }) {
  const listeners = React.useContext(RowDragListenersContext);

  return (
    <div
      className={
        disabled
          ? "table-sortable-item-not-allowed"
          : "table-sortable-item-move"
      }
    >
      <span
        style={{ cursor: disabled ? "not-allowed" : "pointer" }}
        {...(disabled ? {} : listeners)}
      >
        <Icon type="drag" />
      </span>
    </div>
  );
}

function DraggableBodyRow({
  className: rowClassName,
  children,
  ...restProps
}: React.HTMLAttributes<HTMLTableRowElement> & { "data-row-key"?: string }) {
  const dataRowKey = restProps["data-row-key"] ?? "";
  const disabledSortableKey = React.useContext(DisabledSortableContext);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: dataRowKey,
    disabled: disabledSortableKey.includes(dataRowKey),
  });

  const rowStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <RowDragListenersContext.Provider value={listeners}>
      <tr
        ref={setNodeRef}
        style={rowStyle}
        className={rowClassName}
        {...attributes}
        {...restProps}
      >
        {children}
      </tr>
    </RowDragListenersContext.Provider>
  );
}

const Table = <T extends Item>({
  onClear,
  className,
  columns,
  query,
  setQuery,
  rowSelection,
  selectedList,
  setSelectedList,
  scroll,
  dataSource,
  delayLoad,
  pageChangeRef,
  loading,
  showClear = true,
  components: _components,
  miniHeigthRow = false,
  fixHeaderOnTop = true,
  sortableProps,
  onColumnWidthChange,
  ...rest
}: ITableProps<T>) => {
  const intl = useIntl();
  const tableRef = useRef<HTMLDivElement>(null);
  const originalColWidthRef = useRef<{ widthList: number[]; delta: number }>();
  const resizeObserverFrameRef = useRef<number | null>(null);

  const [newDataSource, setDataSource] = useState(dataSource ?? []);

  const [disabledSortableKey, setDisabledSortableKey] = useState<string[]>([]);
  const [activeDragKey, setActiveDragKey] = useState<string | null>(null);

  // 自定义 modifier：限制拖拽不超出 tableRef 容器的可视区域
  const restrictToTableContainer: typeof restrictToVerticalAxis = useCallback(
    ({ transform, draggingNodeRect, containerNodeRect }) => {
      const containerEl = tableRef.current?.querySelector(
        ".ant-table-content",
      ) as HTMLElement | null;
      if (!containerEl || !draggingNodeRect) {
        return { ...transform, x: 0 };
      }

      const containerRect = containerEl.getBoundingClientRect();
      const topBound = containerRect.top - draggingNodeRect.top;
      const bottomBound = containerRect.bottom - draggingNodeRect.bottom;

      return {
        ...transform,
        x: 0,
        y: Math.min(Math.max(transform.y, topBound), bottomBound),
      };
    },
    [],
  );

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const onDragStart = usePersistFn((event: DragStartEvent) => {
    setActiveDragKey(event.active.id as string);
  });

  const onSortEnd = usePersistFn((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragKey(null);
    if (!over || active.id === over.id) return;

    const rowKey = (rest.rowKey ?? "uuid") as string;
    const oldIndex = newDataSource.findIndex((it) => it[rowKey] === active.id);
    const newIndex = newDataSource.findIndex((it) => it[rowKey] === over.id);

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      const newData = arrayMove(
        newDataSource.slice(),
        oldIndex,
        newIndex,
      ).filter((el) => !!el) as T[];
      const data = sortableProps?.onSortEnd(newData, oldIndex, newIndex);
      setDataSource(data || newData);
    }
  });

  const onDragCancel = usePersistFn(() => {
    setActiveDragKey(null);
  });

  const DraggableContainer = usePersistFn(
    (props: React.HTMLAttributes<HTMLTableSectionElement>) => {
      const rowKey = (rest.rowKey ?? "uuid") as string;
      const dataIds = newDataSource.map((item) => item[rowKey] as string);

      return (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToTableContainer]}
          onDragStart={onDragStart}
          onDragEnd={onSortEnd}
          onDragCancel={onDragCancel}
        >
          <SortableContext
            items={dataIds}
            strategy={verticalListSortingStrategy}
          >
            <tbody {...props} />
          </SortableContext>
          <DragOverlay dropAnimation={null}>
            {activeDragKey ? (
              <table
                style={{ tableLayout: "fixed", width: "100%" }}
                className="ant-table-content"
              >
                <tbody>
                  <tr
                    className="ant-table-row"
                    style={{
                      background: "#fff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      borderRadius: 4,
                    }}
                  >
                    <td
                      colSpan={999}
                      style={{
                        padding: "8px 16px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {(() => {
                        const item = newDataSource.find(
                          (d) => d[rowKey] === activeDragKey,
                        );
                        if (!item) return null;
                        // 渲染第一个可见列的内容作为拖拽预览
                        const visibleColumns = columnsMemo?.filter(
                          (col: any) =>
                            col.key !== "sortable" && col.key !== "__action__",
                        );
                        const firstCol = visibleColumns?.[0] as any;
                        if (!firstCol) return String(activeDragKey);
                        if (firstCol.render) {
                          return firstCol.render(
                            get(item, firstCol.dataIndex ?? firstCol.key),
                            item,
                            0,
                          );
                        }
                        return (
                          get(item, firstCol.dataIndex ?? firstCol.key) ??
                          String(activeDragKey)
                        );
                      })()}
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : null}
          </DragOverlay>
        </DndContext>
      );
    },
  );

  const components = useMemo(() => {
    const body = sortableProps?.sortable
      ? {
          body: {
            wrapper: DraggableContainer,
            row: DraggableBodyRow,
          },
        }
      : {};

    return {
      header: {
        cell: ResizableTitle,
      },
      ...body,
      ..._components,
    };
  }, [_components, sortableProps, DraggableContainer]);

  // 处理列宽伸缩
  const findNodeParent: (
    parentElement: HTMLElement,
    label: string,
  ) => HTMLElement | null = useCallback((parentElement, label) => {
    if (parentElement?.tagName === "html" && label === "html") {
      return parentElement;
    }
    if (parentElement?.tagName === label) {
      return parentElement;
    }
    if (parentElement?.parentElement) {
      return findNodeParent(parentElement.parentElement, label);
    }
    return null;
  }, []);

  const computeScrollOffsetWidth = useCallback((cv: HTMLElement) => {
    let offset = 0;
    const parent = cv?.parentElement;
    if (parent?.children?.length) {
      for (const el of parent.children as any) {
        if (el !== cv) {
          offset += (el as HTMLElement)?.clientWidth || 0;
        } else {
          break;
        }
      }
    }
    return offset;
  }, []);

  const handleScrollStyle = useCallback(() => {
    if (rest?.expandable) {
      handleChildTableScroll();
    }
    const target = tableRef.current?.querySelector(".ant-table-has-fix-right");
    const tableContent = tableRef.current?.querySelector(".ant-table-content");
    const table = tableRef.current?.querySelector("table");
    if (target && table && tableContent) {
      // 处理阴影
      const { clientWidth: contentWidth } = tableContent;
      const { clientWidth: tableWidth } = table;
      if (contentWidth < tableWidth) {
        target.classList.add("ant-table-ping-right");
      } else {
        target.classList.remove("ant-table-ping-right");
      }
    }
    // 处理固定列滚动
    const needHandleThs = tableRef.current?.querySelectorAll(
      "th.ant-table-cell-fix-left",
    ) as NodeListOf<HTMLElement>;
    const needHandleCells = tableRef.current?.querySelectorAll(
      "td.ant-table-cell-fix-left",
    ) as NodeListOf<HTMLElement>;

    if (needHandleThs) {
      needHandleThs?.forEach((cv) => {
        const offsetWidth = computeScrollOffsetWidth(cv);
        cv.style.left = `${offsetWidth}px`;
      });
    }
    if (needHandleCells) {
      needHandleCells?.forEach((cv) => {
        const offsetWidth = computeScrollOffsetWidth(cv);
        cv.style.left = `${offsetWidth}px`;
      });
    }
  }, [computeScrollOffsetWidth, rest?.expandable]);

  const handleResize = useCallback(
    (index: number) =>
      ({ size, node }: { size: { width: number }; node: HTMLElement }) => {
        const { width } = size;
        const table = findNodeParent(node.parentElement || node, "TABLE");
        // colgroup col resize
        const cols = table?.querySelectorAll(
          "colgroup col:not(.ant-table-expand-icon-col,.ant-table-selection-col)",
        );
        const col = cols?.[index] as HTMLElement;
        if (col) {
          col.style.width = `${width}px`;
          col.style.minWidth = `${width}px`;
        }
        // body col resize
        const bodyCol = table?.parentElement?.parentElement?.querySelectorAll(
          ".ant-table-body colgroup col:not(.ant-table-expand-icon-col,.ant-table-selection-col)",
        )?.[index] as HTMLElement;
        if (bodyCol) {
          bodyCol.style.width = `${width}px`;
          bodyCol.style.minWidth = `${width}px`;
        }
        if (originalColWidthRef.current) {
          const { widthList, delta: totalDelta } = originalColWidthRef.current;
          const delta = widthList[index] - width - totalDelta;
          if (delta > 0) {
            const originalCols =
              index !== widthList.length - 1
                ? widthList.slice(index + 1)
                : widthList.slice(0, -1);
            const totalWidth = sum(originalCols);
            originalCols.forEach((val, idx) => {
              const currentCol = cols?.[
                (index + 1 + idx) % widthList.length
              ] as HTMLElement;
              if (currentCol) {
                const newWidth = val + (val / totalWidth) * delta;
                currentCol.style.width = `${newWidth}px`;
                currentCol.style.minWidth = `${newWidth}px`;
              }
            });
            tableRef.current
              ?.querySelector(".ant-table-has-fix-right")
              ?.classList.remove("ant-table-ping-right");
          } else {
            tableRef.current
              ?.querySelector(".ant-table-has-fix-right")
              ?.classList.add("ant-table-ping-right");
          }
        }
        syncHeadWidth();
      },
    [findNodeParent],
  );

  // 处理子列表样式不跟随父级列表列宽变动而变动
  const handleChildTableScroll = useCallback(() => {
    const expandTableRows = tableRef.current?.parentElement
      ? (findNodeParent(
          tableRef.current.parentElement,
          "TR",
        )?.parentElement?.querySelectorAll(
          ".ant-table-expanded-row",
        ) as NodeListOf<HTMLElement>)
      : null;
    const expandContentRows =
      tableRef.current?.parentElement?.parentElement?.parentElement?.querySelectorAll(
        ".ant-table-expanded-row",
      ) as NodeListOf<HTMLElement>;
    const expandRows = expandTableRows || expandContentRows;
    if (expandRows) {
      expandRows?.forEach((row) => {
        const parentElement = row?.parentElement?.parentElement?.parentElement;
        const width = parentElement?.clientWidth;
        row.style.width = `${width}px`;
        row.classList.add("fix-expand-table");
        const expandContentCell = row?.childNodes as NodeListOf<HTMLElement>;
        if (expandContentCell?.[0]?.style) {
          expandContentCell[0].style.width = `${width}px`;
          expandContentCell[0].classList.add("fix-expand-table");
        }
      });
    }
  }, [findNodeParent]);

  const wrappedExpandable = useMemo(() => {
    if (rest.expandable) {
      return {
        ...rest.expandable,
        onExpand: (expanded: any, record: any) => {
          requestAnimationFrame(() => {
            handleChildTableScroll();
          });
          rest.expandable?.onExpand?.(expanded, record);
        },
      };
    }
    return rest.expandable;
  }, [rest.expandable, handleChildTableScroll]);

  // 处理表格为空时 placeholder 不随横向滚动条滚动
  const handleTablePlaceholderScroll = useCallback(() => {
    const placeholderCellElements = tableRef.current?.querySelectorAll(
      ".ant-table-placeholder > .ant-table-cell",
    );
    if (placeholderCellElements?.length) {
      placeholderCellElements?.forEach((cell) => {
        const htmlCell = cell as HTMLElement;
        const parentElementWidth =
          htmlCell?.parentElement?.parentElement?.parentElement?.parentElement
            ?.clientWidth;
        htmlCell.style.width = `${parentElementWidth}px`;
        htmlCell.classList.add("fix-expand-table");
      });
    }
  }, []);

  // 处理表格列未占满未出现横向滚动条时，列宽最小值引发的伸缩弹性问题
  const getTableContentWidth = usePersistFn(
    () =>
      tableRef.current?.querySelector(".ant-table-content")?.clientWidth ?? 0,
  );

  const getTotalColWidth = usePersistFn(() => {
    if (loading) return 0;
    const table = tableRef.current?.querySelector("table");
    const cols = table?.querySelectorAll(
      "colgroup col",
    ) as NodeListOf<HTMLElement>;
    let _totalColWidth = 0;
    cols?.forEach((cv) => {
      const width = cv?.style?.width?.split("px")?.[0];
      const _width = width ? Number(width) : 40;
      _totalColWidth += _width;
    });
    return _totalColWidth;
  });

  useEffect(() => {
    if (sortableProps?.onDisabledSortable && newDataSource?.length > 0) {
      setDisabledSortableKey(
        sortableProps?.onDisabledSortable(newDataSource as T[]),
      );
    }
  }, [newDataSource, sortableProps]);

  const adjustColsWidth = usePersistFn(
    ({
      index,
      allowShrink,
    }: { index?: number; allowShrink?: boolean } = {}) => {
      const table = tableRef.current?.querySelector("table");
      const cols: any[] = Array.from(
        table?.querySelectorAll(
          "colgroup col:not(.ant-table-expand-icon-col,.ant-table-selection-col)",
        ) ?? [],
      );
      const expandColWidth = parseInt(
        (
          table?.querySelector(
            "colgroup col.ant-table-expand-icon-col",
          ) as HTMLElement
        )?.style.width || "0",
        10,
      );
      const selectColWidth = parseInt(
        (
          table?.querySelector(
            "colgroup col.ant-table-selection-col",
          ) as HTMLElement
        )?.style.width || "0",
        10,
      );
      const actionColWidth = table?.querySelector(".ant-table-cell-fix-right")
        ? parseInt((cols.pop() as HTMLElement)?.style.width || "0", 10)
        : 0;
      let preColsWidth = 0;
      if (index !== undefined && index !== cols.length - 1) {
        cols.forEach((col, idx) => {
          if (idx <= index) {
            preColsWidth += parseInt(
              (col as HTMLElement).style.width || "80px",
              10,
            );
          }
        });
      }
      const fixedColsWidth =
        expandColWidth + selectColWidth + actionColWidth + preColsWidth;
      const totalColWidth = getTotalColWidth() - fixedColsWidth;
      const tableContentWidth = getTableContentWidth() - fixedColsWidth;
      if (totalColWidth <= tableContentWidth || allowShrink) {
        const delta = tableContentWidth - totalColWidth;
        cols.forEach((col, idx) => {
          if (
            index !== undefined &&
            index !== cols.length - 1 &&
            idx <= index
          ) {
            return;
          }
          const htmlCol = col as HTMLElement;
          const width = parseInt(htmlCol.style.width || "80px", 10);
          const newWidth = width + (width / totalColWidth) * delta;
          htmlCol.style.width = `${newWidth}px`;
          htmlCol.style.minWidth = `${newWidth}px`;
        });
      }
    },
  );

  useLayoutEffect(() => {
    if (tableRef.current && !loading) {
      const resizeObserver = new (window as any).ResizeObserver(
        (entries: any) => {
          const target = entries[0]?.target as HTMLElement | undefined;
          if (!target?.offsetParent) {
            return;
          }

          if (resizeObserverFrameRef.current !== null) {
            window.cancelAnimationFrame(resizeObserverFrameRef.current);
          }

          resizeObserverFrameRef.current = window.requestAnimationFrame(() => {
            resizeObserverFrameRef.current = null;
            if (!target.isConnected || !target.offsetParent) {
              return;
            }

            adjustColsWidth();
            handleTableScroll(new Event("resize"));
            handleScrollStyle();
            handleTablePlaceholderScroll();
          });
        },
      );
      resizeObserver.observe(tableRef.current);
      return () => {
        if (resizeObserverFrameRef.current !== null) {
          window.cancelAnimationFrame(resizeObserverFrameRef.current);
          resizeObserverFrameRef.current = null;
        }
        resizeObserver.disconnect();
      };
    }
  }, [
    loading,
    adjustColsWidth,
    handleScrollStyle,
    handleTablePlaceholderScroll,
  ]);

  useEffect(() => {
    if (tableRef.current && !loading && newDataSource) {
      const table = tableRef.current?.querySelector("table");
      if (table) {
        table.style.tableLayout = "fixed";
        // table.style.width = `${x.current}px`
        table.style.minWidth = `100%`;
      }
      handleScrollStyle();
    }
  }, [handleScrollStyle, loading, newDataSource]);

  useEffect(() => {
    handleTablePlaceholderScroll();
  }, [handleTablePlaceholderScroll]);

  // ZSV-10981: 视口尺寸变化（如开/关 F12）时强制重置 fixed-thead 状态。
  // ResizeObserver 只能感知 tableRef 自身宽度变化，若 table 在 tab/flex
  // 容器中宽度未变则不会触发；同时 fixed-thead 的 top 是基于
  // findContainer() 的位置计算的，窗口尺寸变化后该位置也会变化但没有
  // 重新计算入口，导致原本应当回收的 fixed-thead 漂浮在视口顶端。
  const handleWindowResize = usePersistFn(() => {
    const fixedThead = tableRef.current?.querySelector(
      ".ant-table-thead.fixed-thead",
    ) as HTMLElement | null;
    if (fixedThead) {
      fixedThead.classList.remove("fixed-thead");
      fixedThead.style.top = "";
      fixedThead.style.width = "";
      fixedThead.style.overflowX = "";
      const theadTr = fixedThead.childNodes?.[0] as HTMLElement | undefined;
      if (theadTr) {
        theadTr.style.width = "";
        theadTr.style.display = "";
        theadTr.childNodes?.forEach((node) => {
          const cell = node as HTMLElement;
          if (cell?.style) {
            cell.style.width = "";
            cell.style.display = "";
          }
        });
      }
      const tcontent = tableRef.current?.querySelector(
        ".ant-table-content",
      ) as HTMLElement | null;
      if (tcontent) {
        tcontent.style.paddingTop = "";
      }
    }
    // 让 handleTableScroll 基于新的视口尺寸 / 容器位置重新决定是否
    // 需要再次 fix 表头。
    handleTableScroll(new Event("resize"));
  });

  useMount(() => {
    if (fixHeaderOnTop) {
      window.addEventListener("scroll", handleTableScroll, true);
      window.addEventListener("resize", handleWindowResize);
      bus.addListener("TABLE_HEIGHT_CHANGED", handleTableScroll);
    }
    handleChildTableScroll();
  });

  useUnmount(() => {
    if (fixHeaderOnTop) {
      window.removeEventListener("scroll", handleTableScroll, true);
      window.removeEventListener("resize", handleWindowResize);
      bus.removeListener("TABLE_HEIGHT_CHANGED", handleTableScroll);
    }
  });

  const syncHeadWidth = usePersistFn(() => {
    const cols = tableRef.current?.querySelectorAll(
      "colgroup col",
    ) as NodeListOf<HTMLElement>;
    const heads = tableRef.current?.querySelectorAll(
      ".ant-table-thead th",
    ) as NodeListOf<HTMLElement>;
    if (cols && heads) {
      heads.forEach((head, index) => {
        const width = cols[index]?.style.width || "80px";
        head.style.width = width;
      });
    }
  });

  const handleTableScroll = usePersistFn((e: Event) => {
    if (
      ["zstack-left-nav-content", "ant-tree-list-holder"].includes(
        (e?.target as HTMLElement)?.className,
      )
    )
      return;
    // 处理列表展开不是子列表的固定
    if (
      rest?.expandable &&
      !tableRef.current?.querySelector(".ant-table-expanded-row .ant-table")
    ) {
      handleChildTableScroll();
    }
    // 处理纵向滚动到顶部固定表头
    const selectorTranslateByTab = (_className: string) => {
      // isTab 根据 .ant-tabs-tabpane 而不是 .ant-tabs-tabpane-active 判断，因为tab页除了首次加载之外的每次切换都不会改变 tableRef.current，导致 tableRef.current获取父级 .ant-tabs-tabpane-active 可能失败
      const isTab =
        !!tableRef.current?.parentElement?.closest(".ant-tabs-tabpane");
      return isTab ? `.ant-tabs-tabpane-active ${_className}` : _className;
    };
    const tcontentDom = tableRef.current?.querySelectorAll(
      selectorTranslateByTab(".ant-table-content"),
    )?.[0] as HTMLElement;
    const theadDom = tableRef.current?.querySelectorAll(
      selectorTranslateByTab(".ant-table-thead"),
    )?.[0] as HTMLElement;

    if (!theadDom || !tcontentDom) return;

    // ant-table 需要减去header高度，否则ant-thead fix之后，会脱离文档流，致使ant-table变矮，
    const container = findContainer();
    const tableElement = tableRef.current?.querySelectorAll(
      selectorTranslateByTab(".ant-table"),
    )?.[0] as HTMLElement;
    const topToScrollableParent =
      (tableElement?.getBoundingClientRect()?.top || 0) -
      (container?.getBoundingClientRect()?.top || 0);
    if (topToScrollableParent <= 0) {
      // tcontentDom 加上表头的高度，使得表头固定脱离文档流时，tcontentDom的总体高度不变
      tcontentDom.style.paddingTop = `${theadDom?.clientHeight || 40}px`;
      // 表格滑动到顶部时固定表头
      theadDom.style.top = `${findContainer()?.getBoundingClientRect()?.top}px`;
      theadDom?.classList?.add("fixed-thead");
      const theadTr = theadDom.childNodes?.[0] as HTMLElement;
      theadDom.style.width = `${tcontentDom?.clientWidth}px`;
      theadTr.style.width = `${tcontentDom?.clientWidth}px`;
      const cols = tcontentDom.querySelectorAll("col");
      // 表头单元格手动重新赋值宽度
      theadDom?.childNodes?.[0]?.childNodes?.forEach((node, index) => {
        const _node = node as HTMLElement;
        _node.style.width = cols[index]?.style.width;
        _node.style.display = "table-cell";
        // 去掉表头transition 动画，防止resize thead 单元格时宽度延时渲染，造成与tbody对应单元格不对齐
        if (_node?.classList?.contains("ant-table-column-has-sorters")) {
          _node.style.transition = "none";
        }
        return _node;
      });
      // 处理横向滚动tbody时thead跟随滚动
      if (
        (e?.srcElement as HTMLElement)?.className !==
        "ant-table-thead fixed-thead"
      ) {
        theadDom.style.overflowX = "auto";
        theadDom.scrollLeft = tcontentDom?.scrollLeft;
      }
      // 处理横向滚动thead时tbody跟随滚动
      if (
        (e?.srcElement as HTMLElement)?.className ===
        "ant-table-thead fixed-thead"
      ) {
        theadDom.style.overflowX = "auto";
        tcontentDom.scrollLeft = theadDom?.scrollLeft;
      }
    } else {
      tcontentDom.style.paddingTop = "";
      theadDom.style.top = "";
      theadDom.classList.remove("fixed-thead");
      const theadTr = theadDom?.childNodes?.[0] as HTMLElement;
      theadTr.style.display = "";
      theadDom?.childNodes?.[0].childNodes?.forEach((node) => {
        const _node = node as HTMLElement;
        _node.style.width = "";
        _node.style.display = "";
        return _node;
      });
    }
  });

  // 优化列表数据加载
  useUpdateEffect(() => {
    if (delayLoad && pageChangeRef && pageChangeRef?.current && !loading) {
      // 最小行高
      const ROW_HEIGHT = miniHeigthRow ? 36 : 47;
      // 视口高度可显示最大行数
      const renderLen = Math.ceil(window.innerHeight / ROW_HEIGHT);
      // 先加载一屏数据
      setDataSource(dataSource?.slice(0, renderLen) ?? []);
      pageChangeRef.current = false;
      // 延迟加载剩余数据
      const timeout = setTimeout(() => {
        setDataSource(dataSource ?? []);
      }, 0);
      return () => {
        clearTimeout(timeout);
      };
    }
    setDataSource(dataSource ?? []);
  }, [dataSource, pageChangeRef, delayLoad, loading]);

  const getColumnWidthMap = usePersistFn(() => {
    const cols = tableRef.current?.querySelectorAll(
      "colgroup col:not(.ant-table-expand-icon-col,.ant-table-selection-col)",
    );
    const widthMap = {} as { [key: string]: number };
    columnsMemo?.forEach(({ key }: any, idx: number) => {
      const col = cols?.[idx] as HTMLElement;
      if (key && col && key !== "__action__") {
        widthMap[key] = parseInt(col.style.width, 10);
      }
    });
    return widthMap;
  });

  const renderSortableRow = usePersistFn((row: T) => {
    const rowKey = (rest.rowKey ?? "uuid") as string;
    const isDisabled = disabledSortableKey.includes(row[rowKey]);

    return <DragHandleCell disabled={isDisabled} />;
  });

  const columnsMemo = useMemo(() => {
    if (
      sortableProps?.sortable &&
      !columns?.some((it: any) => it.key === "sortable")
    ) {
      columns?.unshift({
        key: "sortable",
        fixed: "left",
        with: 60,
        render: renderSortableRow,
      } as any);
    }

    const _columns =
      columns?.map(({ title, width, ...item }: any, index: number) => ({
        ...item,
        title:
          typeof title === "string" ? (
            <Text
              value={title}
              style={item.align ? { justifyContent: item.align } : undefined}
            />
          ) : (
            title
          ),
        width,
        onHeaderCell: () => ({
          onResize: handleResize(index),
          width,
          minWidth: get(item, "minWidth"),
          onResizeStart: () => {
            const thead = tableRef.current?.querySelector(
              ".ant-table-thead",
            ) as HTMLElement;
            thead?.classList.add(`${baseCls}-resizing`);
            const widthList = [] as number[];
            const cols = tableRef.current?.querySelectorAll(
              "table colgroup col:not(.ant-table-expand-icon-col,.ant-table-selection-col)",
            );
            cols?.forEach((col: any) => {
              widthList.push(parseInt(col.style.width || "80px", 10));
            });
            if (tableRef.current?.querySelector(".ant-table-cell-fix-right")) {
              widthList.pop();
            }
            const delta = getTotalColWidth() - getTableContentWidth();
            originalColWidthRef.current = { widthList, delta };
          },
          onResizeStop: () => {
            const thead = tableRef.current?.querySelector(
              ".ant-table-thead",
            ) as HTMLElement;
            thead?.classList.remove(`${baseCls}-resizing`);
            handleScrollStyle();
            if (onColumnWidthChange) {
              const widthMap = getColumnWidthMap();
              onColumnWidthChange(widthMap);
            }
            window.dispatchEvent(new Event("resize"));
          },
        }),
      })) ?? [];

    return _columns as ITableProps<T>["columns"];
  }, [
    columns,
    handleResize,
    handleScrollStyle,
    sortableProps?.sortable,
    renderSortableRow,
    getColumnWidthMap,
    getTotalColWidth,
    getTableContentWidth,
    onColumnWidthChange,
  ]);

  const [container, setContainer] = useState<HTMLElement | null>(null);

  const findContainer = useCallback(() => {
    if (!tableRef.current) return;
    const find: (el: HTMLElement) => HTMLElement | null = (
      el?: HTMLElement,
    ) => {
      if (!el?.parentElement) return null;
      const computedStyle = getComputedStyle(el.parentElement);
      if (["auto", "scroll"].includes(computedStyle.overflowY)) {
        return el.parentElement;
      }
      return find(el.parentElement);
    };
    return find(tableRef.current);
  }, []);

  useEffect(() => {
    const foundContainer = findContainer();
    if (!foundContainer) return;
    setContainer(foundContainer);
  }, [findContainer]);

  return (
    <DisabledSortableContext.Provider value={disabledSortableKey}>
      <div
        ref={tableRef}
        className={cls(baseCls, className, {
          "min-row-heigth": miniHeigthRow,
        })}
      >
        {showClear && (
          <Affix
            className={cls(
              selectedList?.length ? `` : `${baseCls}-select-hide`,
              `${baseCls}-select-affix`,
            )}
            target={() => container}
            offsetTop={81}
          >
            <Row
              className={cls(
                `${baseCls}-select-content`,
                selectedList?.length ? `` : `${baseCls}-select-hide`,
              )}
              justify="space-between"
              align="middle"
            >
              <Col className={`${baseCls}-select-content-count`}>
                <Icon className={`${baseCls}-select-content-icon`} type="info-fill" />
                <Text
                  wrapperClass={`${baseCls}-select-content-text`}
                  value={intl.formatMessage(
                    {
                      id: "currentSelectedCount.x",
                      defaultMessage: "Selected Items: {total}",
                    },
                    { total: selectedList?.length },
                  )}
                />
              </Col>
              <Col className={`${baseCls}-select-content-btn-container`}>
                <Button
                  type="text"
                  className={`${baseCls}-select-content-clear`}
                  onClick={() => {
                    if (rowSelection?.onChange) {
                      rowSelection?.onChange?.([], [], { type: "none" });
                    } else {
                      setSelectedList?.([]);
                    }

                    onClear?.();
                  }}
                >
                  {intl.formatMessage({
                    id: "clear.selected",
                    defaultMessage: "Unselect",
                  })}
                </Button>
              </Col>
            </Row>
          </Affix>
        )}

        <AntTable
          sticky={false}
          scroll={{ ...scroll }}
          columns={columnsMemo}
          components={components}
          dataSource={React.useMemo(() => newDataSource, [newDataSource])}
          pagination={false}
          rowSelection={rowSelection}
          {...rest}
          expandable={wrappedExpandable}
        />
      </div>
    </DisabledSortableContext.Provider>
  );
};

export default Table;
