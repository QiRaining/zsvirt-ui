import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { ScsiLun as IScsiLun } from "@zstack/zsphere-types/graphql";
import React from "react";

import { scsiLunList } from "../../../gql/scsi-lun.gql";
import LunDetail from "../components/LunDetail";
import { useQueryConfig, useActionConfig, useColumnConfig } from "../config";

interface IProps {
  hostUuid?: string;
  zoneUuid?: string;
  getDetailContainer?: () => HTMLElement;
}

const ScsiLunList: React.FC<IListProps<IScsiLun> & IProps> = (props) => {
  const queryConfig = useQueryConfig(props.defaultQuery);
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig({
    view: props.view,
    zoneUuid: props.zoneUuid,
  });

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={scsiLunList}
      type="ScsiLun"
      resource="scsi.lun"
      renderRowDetail={(current, open, onClose) => {
        return (
          <LunDetail
            hostUuid={props.hostUuid}
            current={current}
            open={open}
            onClose={onClose}
            getContainer={props.getDetailContainer}
            zoneUuid={props.zoneUuid}
          />
        );
      }}
      {...props}
    />
  );
};

export default ScsiLunList;
