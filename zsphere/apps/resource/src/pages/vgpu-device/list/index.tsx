import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { VGpuDevice as IVGpuDevice } from "@zstack/zsphere-types/graphql";
import React from "react";

import { vgpuDeviceList } from "../../../gql/vgpu-device.gql";
import { useActionConfig, useQueryConfig, useColumnConfig } from "../config";

import style from "./style.module.less";

interface IProps extends IListProps<IVGpuDevice> {
  title?: React.ReactNode;
}

const VGpuDevice: React.FC<IProps> = ({ title, ...props }) => {
  const queryConfig = useQueryConfig(props.defaultQuery);
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig();

  return (
    <>
      {title && <div className={style.title}>{title}</div>}
      <TableList
        columnConfig={columnConfig}
        actionConfig={actionConfig}
        queryConfig={queryConfig}
        gql={vgpuDeviceList}
        type="VGpuDevice"
        resource="vgpu.device"
        {...props}
      />
    </>
  );
};

export default React.memo(VGpuDevice);
