import { Icon } from "@zstack/icon";
import { Tooltip } from "antd";
import classNames from "classnames";
import React, { useMemo, useRef } from "react";
import { useIntl } from "react-intl";

import { getBaseCls } from "../../_utils/common";
import type { IListCollect } from "./type";

import "./style.less";

const noop = () => {};

const baseCls = getBaseCls("list-collect");

function ListCollect<T = any>({
  className,
  style,
  children,
  dataSource,
  add = noop,
  remove = noop,
  layout = "normal",
  removeable = true,
  addable = true,
  label,
  labelInfo,
  tooltip,
  labelDescription,
  readonly = false,
  button,
}: IListCollect<T>) {
  const intl = useIntl();

  const labelMemo =
    label ||
    intl.formatMessage({
      id: "add",
      defaultMessage: "Add",
    });

  const removeRef = useRef<Array<HTMLSpanElement | null>>([]);

  const listEle = useMemo(() => {
    removeRef.current = [];

    if (typeof children !== "function" || !Array.isArray(dataSource)) {
      return null;
    }

    return dataSource.map((item, index) => {
      const getRemoveableStatus = () =>
        typeof removeable === "boolean"
          ? removeable
          : removeable!(item, index, dataSource);

      return (
        <div
          className={classNames(`${baseCls}-item`, `${baseCls}-item-${layout}`)}
          key={index}
        >
          <div className={`${baseCls}-item-left`}>{children(item, index)}</div>
          {readonly || (
            <span
              ref={(el) => {
                removeRef.current[index] = el;
              }}
              className={`${baseCls}-item-delete`}
              onMouseEnter={() =>
                removeRef.current[index]?.classList.toggle(
                  `${baseCls}-item-delete-disabled`,
                  !getRemoveableStatus(),
                )
              }
              onClick={() => getRemoveableStatus() && remove(index)}
            >
              <Icon type="trash" />
            </span>
          )}
        </div>
      );
    });
  }, [children, dataSource, readonly, layout, removeable, remove]);

  return (
    <div className={classNames(baseCls, className)} style={style}>
      {listEle}
      {labelInfo}
      {readonly || (
        <>
          <span
            className={classNames(`${baseCls}-add`, {
              [`${baseCls}-add-disabled`]: !addable,
            })}
            onClick={() => addable && add()}
          >
            {button || (
              <>
                <Icon type="plus" />
                {tooltip ? (
                  <Tooltip title={tooltip as any}>{labelMemo}</Tooltip>
                ) : (
                  labelMemo
                )}
              </>
            )}
          </span>
          {labelDescription && (
            <span className={classNames(`${baseCls}-dec`)}>
              {labelDescription}
            </span>
          )}
        </>
      )}
    </div>
  );
}

ListCollect.displayName = "ListCollect";

export default ListCollect;
export type { IListCollect };
