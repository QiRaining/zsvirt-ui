import { IQuery, Item } from "@zstack/zsphere-types";
import { TableProps } from "antd/es/table";
import React from "react";

export interface ITableProps<T extends Item = Item> extends TableProps<T> {
  onClear?: () => void;
  query?: IQuery;
  setQuery?: (query: IQuery) => void;
  selectedList?: T[];
  setSelectedList?: (selList: T[] | undefined) => object;
  getSelectedContainer?: () => HTMLElement | null | undefined;
  delayLoad?: boolean;
  pageChangeRef?: React.MutableRefObject<boolean>;
  showClear?: boolean;
  fixHeaderOnTop?: boolean;
  miniHeigthRow?: boolean;
  sortableProps?: {
    sortable: boolean;
    onSortEnd: (
      dataSource: T[],
      oldIndex: number,
      newIndex: number,
    ) => T[] | undefined;
    onDisabledSortable?: (dataSource: T[]) => string[];
  };
  onColumnWidthChange?: (widthMap: { [key: string]: number }) => void;
}
