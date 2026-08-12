import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { LunDeviceMultiPathDetail } from "@zstack/zsphere-types/graphql";
import React from "react";

import { lunDeviceMultiPathList } from "../../../../gql/scsi-lun.gql";
import { useColumnConfig } from "../config";

interface IProps {
  zoneUuid?: string;
  scsiLunSourceType?: string;
}

const MultiPathList: React.FC<IListProps<LunDeviceMultiPathDetail> & IProps> = (
  props,
) => {
  const columnConfig = useColumnConfig({
    zoneUuid: props.zoneUuid || "",
    scsiLunSourceType: props?.scsiLunSourceType,
  });

  return (
    <TableList
      columnConfig={columnConfig}
      gql={lunDeviceMultiPathList}
      type="ScsiLun"
      resource="scsi.lun"
      rowSelection={false}
      {...props}
    />
  );
};

export default MultiPathList;
