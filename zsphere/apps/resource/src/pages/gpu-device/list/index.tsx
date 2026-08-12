import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { PciDevice as IPciDevice } from "@zstack/zsphere-types/graphql";
import React from "react";

import { gpuDeviceList } from "../../../gql/gpu-device.gql";
import { useActionConfig, useColumnConfig, useQueryConfig } from "../config";

import style from "./style.module.less";

interface IProps extends IListProps<IPciDevice> {
  title?: React.ReactNode;
}

const GpuDeviceList: React.FC<IProps> = ({ title, ...props }) => {
  const queryConfig = useQueryConfig(props.defaultQuery || { type: "gpu" });
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig({ view: props.view });

  return (
    <>
      {title && <div className={style.title}>{title}</div>}
      <TableList
        columnConfig={columnConfig}
        actionConfig={actionConfig}
        queryConfig={queryConfig}
        gql={gpuDeviceList}
        type="PciDevice"
        resource="pci.device"
        {...props}
      />
    </>
  );
};

export default React.memo(GpuDeviceList);
