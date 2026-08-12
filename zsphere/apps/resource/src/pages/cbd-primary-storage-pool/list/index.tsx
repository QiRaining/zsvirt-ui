import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { CBDPrimaryStoragePool } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { cbdPrimaryStoragePoolList } from "../../../gql/cbd-primary-storage-pool.gql";
import { useColumnConfig } from "../config";

const List: React.FC<
  IListProps<CBDPrimaryStoragePool> &
    Partial<
      Pick<ITableListProps<CBDPrimaryStoragePool>, "rowSelection" | "gql">
    >
> = React.memo((props) => {
  const intl = useIntl();
  const columnConfig = useColumnConfig();

  const helperMemo: ITableListProps<CBDPrimaryStoragePool>["helper"] =
    React.useMemo(
      () => ({
        text: intl.formatMessage({
          id: "ext_storage.pool.helper",
          defaultMessage: "No available storage pools. ",
        }),
        linkText: false,
        authKey: "add.pool",
        microAppName: "hardware",
      }),
      [intl],
    );

  return (
    <TableList
      columnConfig={columnConfig}
      gql={cbdPrimaryStoragePoolList}
      resource="cbd.primary.storage.pool"
      type="CBDPrimaryStoragePool"
      helper={helperMemo}
      rowSelection={false}
      {...props}
    />
  );
});

export default List;
