import { memoryList } from "@zstack/virtualization-resource/src/gql/memory.gql";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { Memory as IMemory } from "@zstack/zsphere-types/graphql";
import React from "react";

import { useColumnConfig } from "../config";

import style from "../../style.module.less";

export interface IProps extends IListProps<IMemory> {
  title?: React.ReactNode;
}

export default function MemoryList({ title, ...props }: IProps) {
  const columnConfig = useColumnConfig();

  return (
    <>
      {title && <div className={style.title}>{title}</div>}
      <TableList
        columnConfig={columnConfig}
        gql={memoryList}
        type="Memory"
        resource="memory"
        rowSelection={false}
        {...props}
      />
    </>
  );
}
