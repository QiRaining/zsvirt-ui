import { InfoPopover } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { getSemanticColor } from "@zstack/zsphere-utils";
import { Tooltip, Typography } from "antd";
import { TooltipPropsWithTitle } from "antd/es/tooltip";
import classNames from "classnames";
import React, { isValidElement, useMemo } from "react";
import { useIntl } from "react-intl";

import { getBaseCls } from "../../../_utils/common";
import Auth from "../../auth";
import ReactMarkdown from "../../markdown";
import Text from "../../text";

import "../style.less";
import { IFieldHorizontalProps, ITooltipProps } from "../type";

const { Paragraph } = Typography;

function isTooltipPropsWithTitle(args: any): args is TooltipPropsWithTitle {
  return typeof args === "object" && !Reflect.has(args, "$$typeof");
}

export function getTooltip(
  option?: ITooltipProps,
  title?: any,
): TooltipPropsWithTitle {
  if (!option || !Object.keys(option).length) {
    return {
      title: "",
      open: false,
    };
  }

  if (isTooltipPropsWithTitle(option)) {
    title = option.title ?? "";

    return {
      ...option,
      title: option.markdown ? <ReactMarkdown>{title}</ReactMarkdown> : title,
    };
  }

  if (option === true && title) {
    return { title };
  }

  return {
    title: option,
  };
}

function isEmpty(p: any): p is undefined | "" | null | boolean {
  return (
    p === undefined ||
    p === null ||
    p === "" ||
    typeof p === "boolean" ||
    (Array.isArray(p) && p.length === 0)
  );
}

const baseCls = getBaseCls("field-horizontal");

const Horizontal: React.FC<IFieldHorizontalProps> = ({
  label,
  icon,
  color,
  tooltip = false,
  editTooltip,
  ellipsis = false,
  copyable = false,
  onEdit,
  colon = true,
  iconTooltip,
  iconColor,
  children,
  className,
  labelWidth,
  auth,
  emptyText: et,
  style: externalStyle,
}) => {
  const intl = useIntl();

  const emptyIntlText = useMemo(
    () => intl.formatMessage({ id: "none", defaultMessage: "None" }),
    [intl],
  );

  const emptyText = et || emptyIntlText;

  const iconEle = useMemo(() => {
    if (!icon) {
      return;
    }

    if (typeof icon === "string") {
      return <Icon type={icon as any} color={iconColor} />;
    }

    if (isValidElement(icon)) {
      return icon;
    }

    const _icon: any = icon as any;

    return _icon;
  }, [icon, iconColor]);

  /* 增加 span 元素处理 icon 组件不符合 tooltip 使用要求问题  */
  const iconTooltipEle = useMemo(() => {
    if (!iconEle) {
      return;
    }

    const tooltipProps = getTooltip(iconTooltip);

    if (iconEle && tooltipProps && tooltipProps.title) {
      return <InfoPopover content={tooltipProps.title as React.ReactNode} />;
    }

    return <span className={`${baseCls}-left-label-icon`}>{iconEle}</span>;
  }, [iconTooltip, iconEle]);

  const colorStyle: React.CSSProperties = useMemo(
    () => ({ color: color && getSemanticColor(color, "light") }),
    [color],
  );

  // 1. 设置顺序 1. Paragraph 2. 颜色(动态调整) 3. tooltip
  // 2. 顺序设置原因:
  //    2.1. Paragraph children 只能为 string
  //    2.2. Tooltip 要求 children 应该能传递一些事件
  // 3. 设置过程尽量不生成冗余元素
  const childrenEle = useMemo(() => {
    const empty = isEmpty(children);
    const hoverShowIcon = !!(copyable || onEdit);

    // Paragraph 要求 children 不能为 ReactElement
    // 组件仅使用 Paragraph 两个属性，都没有使用时，不嵌套 Paragraph
    const newChildren =
      ellipsis || copyable || onEdit ? (
        <Paragraph
          copyable={
            empty || !copyable
              ? false
              : {
                  icon: <Icon type="copy" className={`${baseCls}-icon`} />,
                  ...(copyable === true ? {} : copyable),
                }
          }
          ellipsis={ellipsis}
          style={colorStyle}
          editable={
            typeof onEdit === "function"
              ? {
                  tooltip: editTooltip,
                  icon: <Icon type="edit" className={`${baseCls}-icon`} />,
                  editing: false,
                  onStart: onEdit,
                }
              : false
          }
          className={classNames({
            [`${baseCls}-value-hover-show-icon`]: hoverShowIcon,
            [`${baseCls}-none`]: empty,
          })}
        >
          {empty ? emptyText : children}
        </Paragraph>
      ) : (
        <>
          {empty ? (
            <div className={`${baseCls}-none`}>{emptyText}</div>
          ) : (
            children
          )}
        </>
      );

    if (!tooltip || empty) {
      return (
        <div className={`${baseCls}-value`} style={colorStyle}>
          {newChildren}
        </div>
      );
    }

    const tooltipProps = getTooltip(tooltip, children);

    return (
      <div className={`${baseCls}-value`} style={colorStyle}>
        <Tooltip {...tooltipProps}>
          <span>{newChildren}</span>
        </Tooltip>
      </div>
    );
  }, [
    children,
    copyable,
    onEdit,
    ellipsis,
    colorStyle,
    editTooltip,
    emptyText,
    tooltip,
  ]);

  const ele = (
    <div className={classNames(baseCls, className)} style={externalStyle}>
      <div className={`${baseCls}-left`} style={{ width: labelWidth }}>
        <div
          className={classNames({
            [`${baseCls}-left-label`]: true,
          })}
        >
          <Text
            wrapperClass={`${baseCls}-left-label-text-wrapper`}
            value={label}
          />
        </div>
        {colon ? (
          <span className={`${baseCls}-left-label-colon`}>:</span>
        ) : null}
        {iconTooltipEle}
      </div>
      {childrenEle}
    </div>
  );

  const authProps = {
    type: "block" as const,
    ...auth,
  } as any;

  return auth ? <Auth {...authProps}>{ele}</Auth> : ele;
};

Horizontal.displayName = "Horizontal";

export default Horizontal;
