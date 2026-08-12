import { Icon } from "@zstack/icon";
import { usePersistFn } from "ahooks";
import cls from "classnames";
import type { Identifier } from "dnd-core";
import React, { createContext, useContext, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

import style from "./style.module.less";

const DND_TYPE = "CARD";

export interface IDndContext {
  dndType?: string;
}

export const DndContext = createContext<IDndContext>({});

export interface IDragContainer {
  resourceKey: string;
  onDrop: (params: {
    sourceResourceKey: string;
    position: "top" | "bottom";
  }) => void;
  children: React.ReactNode;
  isDraggable?: boolean;
}

export interface IDragItem {
  resourceKey: string;
  node: HTMLElement | null;
  initialWidth?: number;
}

interface ICollectedProps {
  handlerId: Identifier | null;
  canDrop: boolean;
  isOver: boolean;
}

export function useCardDrop(onDrop: (resourceKey: string) => void) {
  const { dndType = DND_TYPE } = useContext(DndContext);

  const handleDrop = usePersistFn((item: IDragItem) => {
    onDrop(item.resourceKey);
  });

  return useDrop<IDragItem, void, ICollectedProps>(() => ({
    accept: dndType,
    collect: (monitor) => {
      return {
        canDrop: monitor.canDrop(),
        isOver: monitor.isOver(),
        handlerId: monitor.getHandlerId(),
      };
    },
    drop: (item) => {
      handleDrop(item);
    },
  }));
}

function useCardDrag(resourceKey: string) {
  const { dndType = DND_TYPE } = useContext(DndContext);

  const containerRef = React.useRef<HTMLDivElement>(null);

  const dragProps = useDrag(
    () => ({
      type: dndType,
      item: () => {
        const item: IDragItem = {
          resourceKey,
          node: containerRef.current,
          initialWidth: containerRef.current?.offsetWidth,
        };
        return item;
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [],
  );

  const preview = dragProps[2];
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  return [containerRef, ...dragProps] as const;
}

const DragContainer: React.FC<IDragContainer> = ({
  resourceKey,
  onDrop,
  children,
  isDraggable = true,
}) => {
  const handleDrop =
    (position: "top" | "bottom") => (sourceResourceKey: string) => {
      if (isDraggable) {
        onDrop({ sourceResourceKey, position });
      }
    };
  const [dropTopProps, dropTop] = useCardDrop(handleDrop("top"));
  const [dropBottomProps, dropBottom] = useCardDrop(handleDrop("bottom"));
  const [containerRef, { isDragging }, drag] = useCardDrag(resourceKey);

  return (
    <div
      className={cls(style.dragContainer, {
        [style.isDragging]: isDragging,
        [style.canDropTop]: dropTopProps.canDrop,
        [style.isOverTop]: dropTopProps.isOver,
        [style.canDropBottom]: dropBottomProps.canDrop,
        [style.isOverBottom]: dropBottomProps.isOver,
      })}
    >
      <div ref={containerRef} className={style.innerDragContainer}>
        {children}
        {dropTopProps.canDrop && (
          <div
            ref={dropTop}
            data-handler-id={dropTopProps.handlerId}
            className={cls(style.dropContainer, style.dropTop)}
          />
        )}
        {dropBottomProps.canDrop && (
          <div
            ref={dropBottom}
            data-handler-id={dropBottomProps.handlerId}
            className={cls(style.dropContainer, style.dropBottom)}
          />
        )}
        {isDraggable && (
          <div ref={drag} className={style.dragHandle}>
            <Icon size={16} type="drag" />
          </div>
        )}
      </div>
    </div>
  );
};

export default DragContainer;
