import { sensorList } from "@zstack/virtualization-resource/src/gql/sensor.gql";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { Sensor } from "@zstack/zsphere-types/graphql";
import React from "react";

import { useColumnConfig } from "../config";

import style from "../../style.module.less";

export interface IProps extends IListProps<Sensor> {
  title?: React.ReactNode;
}

export default function SensorList({ title, ...props }: IProps) {
  const columnConfig = useColumnConfig();

  return (
    <>
      {title && <div className={style.title}>{title}</div>}
      <TableList
        columnConfig={columnConfig}
        gql={sensorList}
        type="sensor"
        resource="sensor"
        rowKey="name"
        rowSelection={false}
        {...props}
      />
    </>
  );
}
