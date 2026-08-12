import { hostPhysicalCpuList } from "@zstack/virtualization-resource/src/gql/cpu.gql";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { CPU } from "@zstack/zsphere-types/graphql";
import React from "react";

import useColumnConfig from "../config/useColumnConfig";

import style from "../../style.module.less";

export interface IProps extends IListProps<CPU> {
  title?: React.ReactNode;
}

export default function CpuList({ title, ...props }: IProps) {
  const columnConfig = useColumnConfig();

  return (
    <>
      {title && <div className={style.title}>{title}</div>}
      <TableList
        gql={hostPhysicalCpuList}
        columnConfig={columnConfig}
        type="cpu"
        resource="cpu"
        rowSelection={false}
        {...props}
      />
    </>
  );
}
