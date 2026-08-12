import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  KeyboardSensor,
  type Modifier,
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
import { Space } from "antd";
import cls from "classnames";
import React, { useCallback, useRef } from "react";

import { getBaseCls } from "../../_utils/common";

import "./style.less";

const baseCls = getBaseCls("sortable-list");

interface ISortableListItem {
  key: string;
  index: number;
  content: React.ReactNode;
  disabled?: boolean;
  [key: string]: any;
}

export interface ISortableListProps {
  dataSource: ISortableListItem[];
  visibleKey?: string;
  onSortEnd: (dataSource: ISortableListItem[]) => void;
  onTrash?: (item: ISortableListItem) => void;
  className?: string;
}

function SortableItem({
  item,
  visibleKey,
  onTrash,
}: {
  item: ISortableListItem;
  visibleKey: string;
  onTrash?: (item: ISortableListItem) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.key,
    disabled: item.disabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    position: isDragging ? ("relative" as const) : undefined,
    boxShadow: isDragging ? "0 2px 8px rgba(0, 0, 0, 0.15)" : undefined,
    background: isDragging ? "#fff" : undefined,
    borderRadius: isDragging ? 4 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="sortable-item-container"
    >
      <div className="sortable-item">
        <div className="sortable-item-option">
          <div style={{ width: "30px" }}>{item[visibleKey]}</div>

          <div className="sortable-item-option-content">{item.content}</div>

          <Space size={12}>
            <div
              className={cls(
                "sortable-item-option-drag",
                item.disabled
                  ? "sortable-item-not-allowed"
                  : "sortable-item-move",
              )}
              {...(item.disabled ? {} : listeners)}
            >
              <Icon type="drag" />
            </div>

            {onTrash ? (
              <div
                className="sortable-item-option-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onTrash(item);
                }}
              >
                <Icon type="trash" />
              </div>
            ) : null}
          </Space>
        </div>
      </div>
    </div>
  );
}

function SortableList(props: ISortableListProps) {
  const {
    dataSource,
    visibleKey = "index",
    onSortEnd: _onSortEnd,
    onTrash,
    className,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);

  // 自定义 modifier：将拖拽限制在 containerRef 容器的可视区域内
  const restrictToContainer: Modifier = useCallback(
    ({ transform, draggingNodeRect }) => {
      const container = containerRef.current;
      if (!container || !draggingNodeRect) {
        return { ...transform, x: 0 };
      }

      const containerRect = container.getBoundingClientRect();
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

  const handleDragStart = (_event: DragStartEvent) => {
    containerRef.current?.classList.add(`${baseCls}-is-sorting`);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    containerRef.current?.classList.remove(`${baseCls}-is-sorting`);

    if (over && active.id !== over.id) {
      const oldIndex = dataSource.findIndex((item) => item.key === active.id);
      const newIndex = dataSource.findIndex((item) => item.key === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newData = arrayMove(
          dataSource.slice(),
          oldIndex,
          newIndex,
        ).filter((el) => !!el);
        _onSortEnd(newData);
      }
    }
  };

  const handleDragCancel = () => {
    containerRef.current?.classList.remove(`${baseCls}-is-sorting`);
  };

  return (
    <div className={cls(baseCls, className)} ref={containerRef}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToContainer]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={dataSource.map((item) => item.key)}
          strategy={verticalListSortingStrategy}
        >
          <div>
            {dataSource.map((item) => (
              <SortableItem
                key={item.key}
                item={item}
                visibleKey={visibleKey}
                onTrash={onTrash}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default SortableList;
