import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Icon } from "@zstack/icon";
import React from "react";

interface SortableItemProps {
  id: string;
  label: React.ReactNode;
  disabled?: boolean;
  onRemove?: (id: string) => void;
}

export function SortableItem({
  id,
  label,
  disabled,
  onRemove,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="sortable-item"
      data-dragging={isDragging}
    >
      <div
        className={
          !disabled
            ? "sortable-item-left-move"
            : "sortable-item-left-not-allowed"
        }
        {...(!disabled && listeners)}
      >
        <Icon type="drag" />
        {label}
      </div>
      {!disabled && onRemove && (
        <Icon
          type="close"
          style={{ color: "var(--neutral-400)" }}
          onClick={() => onRemove(id)}
        />
      )}
    </div>
  );
}
