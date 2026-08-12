import { Icon } from "@zstack/icon";
import { Tooltip } from "antd";
import classNames from "classnames";
import React, { useState, useMemo } from "react";
import { useIntl } from "react-intl";

import { getBaseCls } from "../../../_utils/common";
import Auth, { useAuth } from "../../auth";
import Horizontal, { getTooltip } from "../horizontal";
import { IFieldGroup } from "../type";

import "../style.less";
import Vertical from "../vertical";

const baseCls = getBaseCls("field-group");

const FieldGroup: React.FC<IFieldGroup> = (props) => {
  const {
    children,
    options,
    auth,
    className,
    style,
    type = "horizontal",
  } = props;

  const [hover, setHover] = useState(false);

  const intl = useIntl();

  const { hasAuth } = useAuth();

  // 类型守卫：判断是否为 horizontal 类型
  const isHorizontal = type !== "vertical";

  // 获取 horizontal 类型特有的属性（使用类型断言，因为我们已经通过 isHorizontal 判断了类型）
  const actionAuthKey = isHorizontal
    ? (props as Extract<IFieldGroup, { type?: "horizontal" }>).actionAuthKey
    : undefined;
  const tooltip = isHorizontal
    ? (props as Extract<IFieldGroup, { type?: "horizontal" }>).tooltip
    : undefined;
  const disabled = isHorizontal
    ? (props as Extract<IFieldGroup, { type?: "horizontal" }>).disabled
    : undefined;
  const onEdit = isHorizontal
    ? (props as Extract<IFieldGroup, { type?: "horizontal" }>).onEdit
    : undefined;

  // 验证是否可以进行编辑操作
  const verifyActionAuth = useMemo(
    () => (isHorizontal && actionAuthKey ? hasAuth(actionAuthKey) : true),
    [isHorizontal, actionAuthKey, hasAuth],
  );

  const editEle =
    isHorizontal && verifyActionAuth && hover ? (
      <Tooltip
        {...(tooltip === undefined
          ? {
              title: intl.formatMessage({
                id: "edit",
                defaultMessage: "Edit",
              }),
            }
          : getTooltip(tooltip))}
      >
        <span
          className={
            !disabled
              ? `${baseCls}-horizontal-edit`
              : `${baseCls}-horizontal-disabled-edit`
          }
        >
          <Icon type="edit" onClick={() => !disabled && onEdit?.()} />
        </span>
      </Tooltip>
    ) : null;

  const Ele = type === "vertical" ? Vertical : Horizontal;

  // 水平有权限hover时有阴影，水平无权限hover时无阴影 垂直用垂直的样式，所以水平和垂直互不影响
  const ele = (
    <div
      className={classNames(baseCls, className, `${baseCls}-${type}`, {
        [`${baseCls}-${type}-hover`]: verifyActionAuth,
      })}
      style={style}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {editEle}
      {(options as Array<any>)?.map((item: any, index) => (
        <Ele key={index} {...item} />
      )) || children}
    </div>
  );

  const authProps = {
    type: "block" as const,
    ...auth,
  } as any;

  return auth ? <Auth {...authProps}>{ele}</Auth> : ele;
};

export default FieldGroup;
