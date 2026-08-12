import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { NVMeLun as INVMeLun } from "@zstack/zsphere-types/graphql";
import React from "react";

import { nvmeLunList } from "../../../gql/nvme-lun.gql";
import useColumnConfig from "../config/useColumnConfig";
import useQueryConfig from "../config/useQueryConfig";

const NVMeLunList: React.FC<
  IListProps<INVMeLun> &
    Pick<ITableListProps<INVMeLun>, "toolbar" | "pagination">
> = (props) => {
  const queryConfig = useQueryConfig();

  const columnConfig = useColumnConfig({ view: props.view });

  return (
    <TableList
      columnConfig={columnConfig}
      queryConfig={queryConfig}
      gql={nvmeLunList}
      type="NVMeLun"
      resource="nvme.lun"
      pagination={false}
      rowSelection={false}
      {...props}
    />
  );
};

export default NVMeLunList;
