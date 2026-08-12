import { storageAdapterList } from "@zstack/virtualization-resource/src/gql/storage-adapter.gql";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { CPU } from "@zstack/zsphere-types/graphql";
import React from "react";

import useActionConfig from "../config/useActionConfig";
import useColumnConfig from "../config/useColumnConfig";
import useQueryConfig from "../config/useQueryConfig";
import StorageAdapterDetail from "../detail";

import style from "../../style.module.less";

export interface IProps extends IListProps<CPU> {
  title?: React.ReactNode;
  getDetailContainer?: any;
}

export default function StorageAdapterList({
  title,
  getDetailContainer,
  ...props
}: IProps) {
  const columnConfig = useColumnConfig();
  const actionConfig = useActionConfig();
  const queryConfig = useQueryConfig(props.defaultQuery);

  return (
    <>
      {title && <div className={style.title}>{title}</div>}
      <TableList
        gql={storageAdapterList}
        rowKey="name"
        columnConfig={columnConfig}
        actionConfig={actionConfig}
        queryConfig={queryConfig}
        type="StorageAdapter"
        resource="storage.adapter"
        rowSelection={false}
        renderRowDetail={(record, visible, onClose) => (
          <StorageAdapterDetail
            current={record}
            visible={visible}
            onClose={onClose}
            getContainer={getDetailContainer}
          />
        )}
        {...props}
      />
    </>
  );
}
