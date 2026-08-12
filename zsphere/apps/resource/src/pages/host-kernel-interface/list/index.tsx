import Detail from "@zstack/virtualization-resource/src/pages/host-kernel-interface/detail";
import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { HostKernelInterface } from "@zstack/zsphere-types/graphql";
import React from "react";

import { hostKernelInterfaceList } from "../../../gql/host-kernel-interface.gql";
import { validateDeletion } from "../action/validators";
import { useActionConfig, useQueryConfig, useColumnConfig } from "../config";

type BaseProps = IListProps<HostKernelInterface> &
  Partial<
    Pick<
      ITableListProps<HostKernelInterface>,
      "rowSelection" | "toolbar" | "rowKey"
    >
  >;

interface IProps extends BaseProps {}

const toolbar: ITableListProps<HostKernelInterface>["toolbar"] = [
  "refresh",
  "operation",
  "search",
];

const List: React.FC<IProps> = ({ defaultQuery, ...props }) => {
  const queryConfig = useQueryConfig({ defaultQuery });
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig();

  return (
    <>
      <TableList
        columnConfig={columnConfig}
        actionConfig={actionConfig}
        queryConfig={queryConfig}
        gql={hostKernelInterfaceList}
        type="HostKernelInterface"
        resource="host.kernel.interface"
        toolbar={toolbar}
        defaultQuery={defaultQuery}
        rowSelection={{
          getCheckboxProps: (record) => ({
            disabled: !validateDeletion(record),
          }),
        }}
        renderRowDetail={(record, visible, onClose, getContainer) => {
          return (
            <Detail
              detail={record}
              visible={visible}
              onClose={onClose}
              getContainer={getContainer}
            />
          );
        }}
        {...props}
      />
    </>
  );
};

export default List;
