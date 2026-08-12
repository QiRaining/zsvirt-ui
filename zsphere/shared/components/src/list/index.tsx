import { Icon } from "@zstack/icon";
import cls from "classnames";
import { get, isString } from "lodash-es";
import React, { ReactNode, useMemo, useState } from "react";

import { getBaseCls } from "../_utils/common";
import { useAuth } from "../a-cloud-old-components/auth";
import { IProps as IAuthProps } from "../a-cloud-old-components/auth/type";
import Field from "../a-cloud-old-components/field";
import { ITooltipProps } from "../a-cloud-old-components/field/type";
import ResourceName from "../resource-name";

import style from "./style.module.less";

export interface Item {
  label: string | ReactNode;
  tooltip?: string;
  icon?: any;
  iconTooltip?: ITooltipProps;
  number?: number;
  value?: string | ReactNode | ReactNode[];
  auth?: IAuthProps;
  show?: boolean;
  children?: Item[];
  copyable?: boolean;
  className?: string;
  canModify?: boolean;
  defaultVisible?: boolean;
}

export interface IProps {
  list: Item[];
  bordered?: boolean;
  type?: "table" | "list";
  className?: string;
}

const baseCls = getBaseCls("field-list");

const ListItem: React.FC<Item> = ({
  label: _label,
  tooltip,
  value,
  icon,
  iconTooltip,
  copyable,
  canModify,
  number,
  className,
  defaultVisible = false,
  children = [],
}) => {
  const { hasAuth } = useAuth();
  const [visibel, setVisibel] = useState(defaultVisible);

  const label = number ? `${_label}(${number})` : _label;

  const _children = useMemo(() => {
    return (
      children?.filter(
        (item) =>
          get(item, "show", true) && (item.auth ? hasAuth(item.auth) : true),
      ) ?? []
    );
  }, [hasAuth, children]);

  const hasChildren = !!_children?.length;

  const arrowNode = useMemo(() => {
    return (
      <div className={style[`${baseCls}-title-arrow`]}>
        {visibel ? (
          <Icon
            size={16}
            className={style[`${baseCls}-title-arrow-icon`]} type="arrow-ios-down"
          />
        ) : (
          <Icon
            size={16}
            className={style[`${baseCls}-title-arrow-icon`]} type="arrow-ios-right"
          />
        )}
      </div>
    );
  }, [visibel]);

  const childrenNode = useMemo(() => {
    if (!hasChildren) return null;
    return (
      <div className={style[`${baseCls}-children`]}>
        {_children?.map((item, index) => (
          <Field
            className={className}
            key={`${item.label}-${item.value}`}
            label={item.label}
            tooltip={item.tooltip}
            colon={false}
          >
            {isString(item.value) ? (
              <ResourceName
                canModify={item.canModify}
                value={item.value}
                copyable={item.copyable}
              />
            ) : (
              item.value
            )}
          </Field>
        ))}
      </div>
    );
  }, [hasChildren, _children, className]);

  if (!hasChildren)
    return (
      <Field
        label={label}
        icon={icon}
        iconTooltip={iconTooltip}
        tooltip={tooltip}
        labelWidth="50%"
        colon={false}
        className={className}
      >
        {isString(value) ? (
          <ResourceName
            canModify={canModify}
            copyable={copyable}
            value={value}
          />
        ) : (
          value
        )}
      </Field>
    );

  return (
    <div className={style[`${baseCls}-item-container`]}>
      <div
        className={style[`${baseCls}-title`]}
        onClick={() => setVisibel(!visibel)}
      >
        {arrowNode}
        <Field
          label={label}
          icon={icon}
          iconTooltip={iconTooltip}
          tooltip={tooltip}
          ellipsis
          labelWidth="50%"
          colon={false}
          className={className}
        >
          {value}
        </Field>
      </div>
      {visibel && childrenNode}
    </div>
  );
};

const List: React.FC<IProps> = ({
  list,
  bordered = true,
  type = "list",
  className,
}) => {
  const { hasAuth } = useAuth();
  const _list = useMemo(() => {
    return list.filter(
      (item) =>
        get(item, "show", true) && (item.auth ? hasAuth(item.auth) : true),
    );
  }, [hasAuth, list]);
  return (
    <div
      className={cls(style[baseCls], className, {
        [style[`${baseCls}-bordered`]]: bordered,
        [style[`${baseCls}-table`]]: type === "table",
      })}
    >
      {_list.map((item, index) => (
        <ListItem key={`${item.label}-${index}`} {...item} />
      ))}
    </div>
  );
};

export default List;
