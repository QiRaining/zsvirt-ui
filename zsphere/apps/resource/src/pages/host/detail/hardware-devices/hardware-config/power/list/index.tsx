import { powerSupplyList as powerSupplyListGql } from "@zstack/virtualization-resource/src/gql/power-supply.gql";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { PowerSupply as IPowerSupply } from "@zstack/zsphere-types/graphql";
import React from "react";

import { useColumnConfig } from "../config";

import style from "../../style.module.less";

export interface IProps extends IListProps<IPowerSupply> {
  title?: React.ReactNode;
}

export default function PowerList({ title, ...props }: IProps) {
  const columnConfig = useColumnConfig();

  return (
    <>
      {title && <div className={style.title}>{title}</div>}
      <TableList
        columnConfig={columnConfig}
        gql={powerSupplyListGql}
        type="PowerSupply"
        resource="powerSupply"
        rowSelection={false}
        {...props}
      />
    </>
  );
}
