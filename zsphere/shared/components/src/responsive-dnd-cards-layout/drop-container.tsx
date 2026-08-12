import cls from "classnames";
import React from "react";

import { useCardDrop } from "./drag-container";

import style from "./style.module.less";

export interface IProps {
  onDrop: (resourceKey: string) => void;
}

const DropContainer: React.FC<IProps> = ({ onDrop }) => {
  const [dropProps, drop] = useCardDrop(onDrop);

  return (
    <div
      ref={drop}
      data-handler-id={dropProps.handlerId}
      className={cls(style.emptyContainer, {
        [style.canDropEmpty]: dropProps.canDrop,
        [style.isOverEmpty]: dropProps.isOver,
      })}
    />
  );
};

export default DropContainer;
