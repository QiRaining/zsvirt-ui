import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { CephPrimaryStoragePool as ICephPrimaryStoragePool } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { cephPrimaryStoragePoolList } from "../../../gql/ceph-primary-storage-pool.gql";
import {
  useQueryConfig,
  useColumnConfig,
  useActionConfig,
} from "../config/index";

const List: React.FC<
  IListProps<ICephPrimaryStoragePool> &
    Partial<Pick<ITableListProps<ICephPrimaryStoragePool>, "rowSelection">>
> = (props) => {
  const queryConfig = useQueryConfig(props.defaultQuery);
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig();
  const intl = useIntl();

  const toolbarHandleTooltip = (
    <ReactMarkdown>
      {intl.formatMessage({
        id: "cephStoragePool.tooltip",
        defaultMessage: `### Storage Pool
A storage pool is a logical partition of  Distributed Storage  storages. You can specify a storage pool when you add a  Distributed Storage  storage to the Cloud. If not specified, the Cloud automatically creates a root disk pool, a data disk pool, and an image cache pool.

Note:
1. Before you can specify a storage pool, create one in the corresponding Distributed Storage cluster first.
2. The root disk pool cannot be deleted.
3. If you use a Distributed Storage primary storage, you can specify a storage pool when you create virtual machines, clone virtual machines, or create data disks .`,
      })}
    </ReactMarkdown>
  );

  return (
    <TableList
      toolbarHandleTooltip={toolbarHandleTooltip}
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={cephPrimaryStoragePoolList}
      resource="ceph.primary.storage.pool"
      type="CephPrimaryStoragePool"
      {...props}
    />
  );
};

export default List;
