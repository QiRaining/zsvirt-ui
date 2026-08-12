import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { ExternalPrimaryStoragePool } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { externalPrimaryStoragePoolList } from "../../../gql/external-primary-storage-pool.gql";
import { useQueryConfig, useColumnConfig, useActionConfig } from "../config";

const List: React.FC<
  IListProps<ExternalPrimaryStoragePool> &
    Partial<
      Pick<ITableListProps<ExternalPrimaryStoragePool>, "rowSelection" | "gql">
    >
> = (props) => {
  const intl = useIntl();
  const queryConfig = useQueryConfig(props?.defaultQuery);
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig();

  const helperMemo: ITableListProps<ExternalPrimaryStoragePool>["helper"] =
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
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={externalPrimaryStoragePoolList}
      resource="vhost.primary.storage.pool"
      type="VHostPrimaryStoragePool"
      helper={helperMemo}
      selectType="radio"
      {...props}
    />
  );
};

export default List;
