import { TableList } from "@zstack/zsphere-components";
import { DialogWeak } from "@zstack/zsphere-design-biz";
import type { IListProps } from "@zstack/zsphere-types";
import type { PciDevice as IPciDevice } from "@zstack/zsphere-types/graphql";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import { gpuDeviceList } from "../../../gql/gpu-device.gql";
import { useActionConfig, useColumnConfig, useQueryConfig } from "../config";

import style from "./style.module.less";

interface IProps extends IListProps<IPciDevice> {
  title?: React.ReactNode;
}

const PciDeviceList: React.FC<IProps> = ({ title, ...props }) => {
  const intl = useIntl();
  const [alert, setAlert] = useState({ visible: false, message: "" });
  const queryConfig = useQueryConfig(props.defaultQuery || { type: "pci" });
  const actionConfig = useActionConfig({ setAlert });
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
      <DialogWeak
        visible={alert.visible}
        setVisible={(visible) => setAlert({ ...alert, visible })}
        type="warning"
        title={String(
          intl.formatMessage({
            id: "pcie.device.unable.to.toggle.passthrough.title",
            defaultMessage: "Cannot Toggle Passthrough",
          }),
        )}
        onConfirm={() => {
          setAlert({ ...alert, visible: false });
        }}
        description={alert.message}
      />
    </>
  );
};

export default React.memo(PciDeviceList);
