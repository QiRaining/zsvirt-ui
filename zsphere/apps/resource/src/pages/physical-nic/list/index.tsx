import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { Bond, PhysicalNic } from "@zstack/zsphere-types/graphql";
import React from "react";

import { physicalNicList } from "../../../gql/host.gql";
import { useActionConfig, useColumnConfig, useQueryConfig } from "../config";
import PhysicalNicDetail from "../detail";

interface IProps {
  showDetail?: boolean;
  getDetailContainer?: any;
}

const PhysicalNicList: React.FC<
  IListProps<PhysicalNic, Bond> &
    IProps &
    Partial<Pick<ITableListProps<PhysicalNic>, "rowSelection">>
> = ({ showDetail = true, source, ...props }) => {
  const queryConfig = useQueryConfig();
  const actionConfig = useActionConfig({ source });
  const columnConfig = useColumnConfig({
    defaultSortByName: false,
    view: props.view,
    showDetail,
  });

  return (
    <>
      <TableList
        columnConfig={columnConfig}
        actionConfig={actionConfig}
        queryConfig={queryConfig}
        gql={physicalNicList}
        resource="physical.nic"
        type="physicalNic"
        expandable={undefined}
        limitLoop={2}
        {...props}
        source={{ ...source }}
        renderRowDetail={
          props?.view.indexOf("select") === -1 && showDetail
            ? (record, visible, onClose) => (
                <PhysicalNicDetail
                  current={record}
                  visible={visible}
                  onClose={onClose}
                  getContainer={props.getDetailContainer}
                  source={source}
                />
              )
            : undefined
        }
      />
    </>
  );
};

export default React.memo(PhysicalNicList);
