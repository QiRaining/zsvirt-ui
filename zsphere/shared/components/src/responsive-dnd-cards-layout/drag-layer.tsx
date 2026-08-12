import React, { useRef, useEffect } from "react";
import { useDragLayer, XYCoord } from "react-dnd";
import { createPortal } from "react-dom";

import { IDragItem } from "./drag-container";

import style from "./style.module.less";

function getItemStyles(offset: XYCoord | null, width?: number) {
  if (!offset) {
    return { display: "none" as const };
  }
  const { x, y } = offset;
  const transform = width
    ? `translate(${x + 40 - width}px, ${y}px)`
    : `translate(${x}px, ${y}px)`;
  return { transform, width };
}

export interface IDragLayerCollectedProps {
  item: IDragItem;
  offset: XYCoord | null;
  isDragging: boolean;
}

export const DragLayer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { isDragging, offset, item } = useDragLayer<
    IDragLayerCollectedProps,
    IDragItem
  >((monitor) => ({
    item: monitor.getItem(),
    offset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  useEffect(() => {
    const container = containerRef.current;
    if (isDragging && container && item?.node) {
      const node = item.node.cloneNode(true);
      container.appendChild(node);
    }
  }, [isDragging, item?.node]);

  return isDragging
    ? createPortal(
        <div className={style.dragLayer}>
          <div
            ref={containerRef}
            className={style.dragLayerInner}
            style={getItemStyles(offset, item?.initialWidth)}
          />
        </div>,
        document.body,
      )
    : null;
};
