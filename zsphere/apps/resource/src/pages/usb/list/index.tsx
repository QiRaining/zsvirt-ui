import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { UsbDevice as IUsbDevice } from "@zstack/zsphere-types/graphql";
import React from "react";

import { usbsDeviceList } from "../../../gql/usb.gql";
import { useActionConfig, useQueryConfig, useColumnConfig } from "../config";

import style from "./style.module.less";

interface IProps extends IListProps<IUsbDevice> {
  title?: React.ReactNode;
}

const UsbDeviceList: React.FC<IProps> = ({ title, ...props }) => {
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
        gql={usbsDeviceList}
        type="UsbDevice"
        resource="usb"
        {...props}
      />
    </>
  );
};

export default React.memo(UsbDeviceList);
