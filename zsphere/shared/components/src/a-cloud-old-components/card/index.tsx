import { Icon, type IconTypes } from "@zstack/icon";
import { Illustration, IllustrationTypes } from "@zstack/zsphere-illustration";
import { useToggle } from "ahooks";
import { Card as AntCard, Space } from "antd";
import cls from "classnames";
import React, { FC, useMemo } from "react";

import { getBaseCls } from "../../_utils/common";
import DraggableCard from "./draggable-card";
import type { ICardProps, IDraggableCardProps } from "./type";

import "./style.less";

const baseCls = getBaseCls("card");

const Card: FC<ICardProps> = ({
  collapsible = true,
  collapsed,
  children,
  className,
  icon,
  colorfulIconKey,
  title,
  subTitle,
  ...extraProps
}) => {
  const [state, { toggle }] = useToggle(collapsed);

  const btn = useMemo(() => {
    const type: IconTypes = state ? "arrow-ios-up" : "arrow-ios-down";
    return (
      <Icon type={type} onClick={() => toggle()} className={`${baseCls}-btn`} />
    );
  }, [state]);

  const customTitle = useMemo(() => {
    if (icon || subTitle || colorfulIconKey) {
      return (
        <Space size={8} align="center">
          {icon && <Icon type={icon as IconTypes} />}
          {colorfulIconKey && (
            <Illustration
              type={colorfulIconKey as IllustrationTypes}
              size={28}
            />
          )}
          {title}
          {subTitle && (
            <span className={`${baseCls}-subtitle`}>{subTitle}</span>
          )}
        </Space>
      );
    }
    return title;
  }, [title, subTitle, icon, colorfulIconKey]);

  return (
    <AntCard
      {...extraProps}
      className={cls(baseCls, { [`${baseCls}-collapsed`]: state }, className)}
      extra={collapsible && btn}
      title={customTitle}
    >
      {children}
    </AntCard>
  );
};

export default Card;

export { DraggableCard };
export type { ICardProps, IDraggableCardProps };
