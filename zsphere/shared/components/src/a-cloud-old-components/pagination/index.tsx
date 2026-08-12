import { IQuery } from "@zstack/zsphere-types";
import { Pagination as AntPagination } from "antd";
import cls from "classnames";
import React, { Dispatch, SetStateAction, useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import { getBaseCls } from "../../_utils/common";
import { ConfigContext } from "../config";
import { ITableListPaginationProps } from "../table-list/type";

import "./style.less";

interface IProps extends ITableListPaginationProps {
  className?: string | undefined;
  selectedCount?: number;
  total: number;
  query: IQuery;
  setQuery: Dispatch<SetStateAction<IQuery>>;
  showSizeChanger?: boolean;
  pageChangeRef?: any;
  onChange?: (page: number, pageSize: number) => void;
}

const baseCls = getBaseCls("pagination");
const zsvCls = getBaseCls("pagination-zsv");

const Pagination: React.FC<IProps> = ({
  className,
  total,
  query,
  showSizeChanger = true,
  setQuery,
  pageChangeRef,
  selectedCount = 0,
  // 组件外部可以监听 onChange
  onChange: tablePropsOnChange,
  // 自定义Pagination 属性
  computePagination: _computePagination,
}) => {
  const intl = useIntl();

  const { tableList: tableListConfig } = React.useContext(ConfigContext);
  const computePagination = React.useMemo(
    () =>
      _computePagination ?? tableListConfig?.paginationProps?.computePagination,
    [tableListConfig, _computePagination],
  );
  const { start = 0, limit = 10 } = computePagination?.(query) ?? query;

  const current = useMemo(() => Math.floor(start / limit) + 1, [start, limit]);

  const onChange = useCallback(
    (page: number, pageSize: any) => {
      if (pageChangeRef) {
        pageChangeRef.current = true;
      }
      if (tablePropsOnChange) {
        tablePropsOnChange(page, pageSize);
      } else {
        setQuery((v) => ({
          ...v,
          limit: pageSize,
          start: (page - 1) * pageSize,
        }));
      }
    },
    [setQuery, tablePropsOnChange],
  );

  const onShowSizeChange = useCallback(
    (page: number, pageSize: number) => {
      if (tablePropsOnChange) {
        tablePropsOnChange(page, pageSize);
      } else {
        setQuery((v) => ({
          ...v,
          start: 0,
          limit: pageSize,
        }));
      }
    },
    [setQuery, tablePropsOnChange],
  );

  const leftNode = useMemo(() => {
    if (!total) {
      return null;
    }

    const totalPages = Math.ceil(total / limit);
    const currentPage = start / limit + 1;
    const currentPageTotal = total % limit;

    if (totalPages === currentPage && currentPageTotal === 1) {
      return intl.formatMessage(
        {
          id: "startItem.totalItems",
          defaultMessage: "Item {start}. Total: {total}",
        },
        { start: start + 1, total },
      );
    }

    return intl.formatMessage(
      {
        id: "startEndItem.totalItems",
        defaultMessage: "Item {start}-{end}. Total: {total}",
      },
      {
        start: start + 1,
        end:
          start +
          (totalPages === currentPage ? currentPageTotal || limit : limit),
        total,
      },
    );
  }, [intl, limit, start, total]);

  return (
    <div className={cls(baseCls, zsvCls, className)}>
      <div className={`${baseCls}-left`}>
        <span>{leftNode}</span>
      </div>
      <div className={`${baseCls}-right`}>
        <AntPagination
          {...({
            current,
            size: "small",
            onChange,
            total,
            pageSize: limit,
            onShowSizeChange,
            showSizeChanger,
            showQuickJumper: total / limit > 5,
            locale: {
              items_per_page: intl.formatMessage({
                id: "items.per.page",
                defaultMessage: "Item/Page",
              }),
            },
          } as any)}
        />
      </div>
    </div>
  );
};

export default Pagination;
