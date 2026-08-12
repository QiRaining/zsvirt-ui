import { Icon, type IconTypes } from "@zstack/icon";
import { Card as AntCard, Space, Tooltip } from "antd";
import cls from "classnames";
import React, { FC, useMemo, useRef, useState } from "react";

import { getBaseCls } from "../../_utils/common";
import Auth from "../auth";

import "./style.less";
import { IDraggableCardProps, TitleAction } from "./type";

const baseCls = getBaseCls("card");
const zsvCls = getBaseCls("zsv-card");

const DraggableCard: FC<IDraggableCardProps> = ({
  collapsible = true,
  collapsed,
  children,
  className,
  title,
  subTitle,
  isList,
  onCollapseChange,
  titleActions,
  extra,
  ...extraProps
}) => {
  const [state, setState] = useState(collapsed);
  const containeRef = useRef<HTMLDivElement>(null);

  const collapseBtn = useMemo(() => {
    const troggleClick = (_state: boolean) => {
      setState(_state);
      onCollapseChange?.(_state);
    };
    const collapsedType: IconTypes = "arrow-right-fill";
    const expandType: IconTypes = "arrow-down-fill";
    const type = state ? collapsedType : expandType;
    return (
      <Icon
        type={type}
        onClick={() => troggleClick(!state)}
        className={`${baseCls}-btn`}
      />
    );
  }, [onCollapseChange, state]);

  const customTitle = useMemo(() => {
    if (subTitle || collapsible) {
      return (
        <Space size={4} align="center">
          {collapsible && collapseBtn}
          {title}
          {subTitle && (
            <span className={`${baseCls}-subtitle`}>{subTitle}</span>
          )}
        </Space>
      );
    }
    return title;
  }, [subTitle, collapsible, title, collapseBtn]);

  const renderAction = (action: TitleAction, index: number) => {
    let actionItem = (
      <div
        onClick={(e) => {
          e.stopPropagation();
          action?.onClick?.();
        }}
        className={`${baseCls}-title-action-item`}
        key={`action-item-${index}`}
      >
        <Space size={4}>
          <Icon type={action.icon as IconTypes} className={`${baseCls}-btn`} />
          {action.title}
        </Space>
      </div>
    );

    if (action?.disabled) {
      actionItem = (
        <div
          className={`${baseCls}-title-action-item-disabled`}
          key={`action-item-${index}`}
        >
          <Space size={4}>
            <Icon
              type={action.icon as IconTypes}
              className={`${baseCls}-btn`}
            />
            {action.title}
          </Space>
        </div>
      );
    }

    if (action.tooltip && !action.disabled) {
      actionItem = (
        <Tooltip title={action.tooltip} key={`action-item-tooltip-${index}`}>
          {actionItem}
        </Tooltip>
      );
    }

    if (action.authKey) {
      actionItem = (
        <Auth
          authKey={action.authKey}
          resource={action.resource}
          type="action"
          key={`action-item-auth-${action.authKey}`}
        >
          {actionItem}
        </Auth>
      );
    }

    return actionItem;
  };

  const extraDom = useMemo(() => {
    if (titleActions?.length) {
      return (
        <>
          <div className={`${baseCls}-title-action`}>
            <Space size={12} align="center">
              {titleActions.map(renderAction)}
            </Space>
          </div>
          {extra}
        </>
      );
    }
    return extra;
  }, [extra, titleActions]);

  return (
    <div ref={containeRef}>
      <AntCard
        extra={extraDom}
        {...extraProps}
        className={cls(
          baseCls,
          `${baseCls}-draggable`,
          {
            [`${baseCls}-collapsed`]: state,
            [`${baseCls}-is-list`]: isList,
            [zsvCls]: true,
          },
          className,
        )}
        title={customTitle}
      >
        {children}
      </AntCard>
    </div>
  );
};

export default DraggableCard;
