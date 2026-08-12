import { Button } from "@zstack/design";
import { queryVmNicList } from "@zstack/virtualization-resource/src/gql/vm-nic.gql";
import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import { DialogWeak } from "@zstack/zsphere-design-biz";
import type { IListProps } from "@zstack/zsphere-types";
import type {
  VmNic as IVmNic,
  VmInstance,
} from "@zstack/zsphere-types/graphql";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import type { useColumnConfig as _useColumnConfig } from "../config";
import {
  useActionConfig as _useActionConfig,
  useNicColumnConfig,
  useQueryConfig,
} from "../config";

const buttonMarginRightStyle = { marginRight: 8 } as const;

const List: React.FC<
  Pick<ITableListProps<IVmNic>, "renderToolbar"> &
    IListProps<IVmNic> & {
      current?: Partial<VmInstance>;
      useActionConfig?: (...args: any[]) => ReturnType<typeof _useActionConfig>;
      useColumnConfig?: (...args: any[]) => ReturnType<typeof _useColumnConfig>;
      zoneUuid?: string;
    }
> = ({
  useActionConfig = _useActionConfig,
  useColumnConfig = useNicColumnConfig,
  zoneUuid,
  ...props
}) => {
  const queryConfig = useQueryConfig({
    view: props.view,
    defaultQuery: props.defaultQuery,
  });
  const actionConfig = useActionConfig({ zoneUuid });
  const columnConfig = useColumnConfig(props);

  return (
    <TableList
      toolbar={["operation", "refresh", "search"]}
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={queryVmNicList}
      type="VmNic"
      resource="vm.nic"
      source={props.current}
      {...props}
    />
  );
};

export const getNicStateTableSelectAlertFooter = (
  alertFn: (selectedList: any[]) => boolean = (selectedList) =>
    selectedList?.some((item: any) => item.state === "disable"),
  config?: {
    alertTitle?: string;
    alertMessage?: string;
  },
) => {
  const VmNicStateFooter = ({
    selectedList,
    onCancel,
    onOk,
    reverseButton = true,
  }: any) => {
    const intl = useIntl();
    const [visible, setVisible] = useState(false);

    const buttons = [
      <Button
        id="drawer-ok"
        onClick={alertFn(selectedList) ? () => setVisible(true) : (onOk as any)}
        variant="primary"
        style={buttonMarginRightStyle}
        disabled={!selectedList.length}
      >
        {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
      </Button>,
      <Button id="drawer-cancel" variant="link" onClick={() => onCancel()}>
        {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
      </Button>,
    ];

    return (
      <>
        {reverseButton ? buttons.reverse() : buttons}
        <DialogWeak
          type="warning"
          title={String(
            config?.alertTitle ??
              intl.formatMessage({
                id: "eip.etc.network.service.action.attach.nic.confirm.title",
                defaultMessage: "Associate NIC?",
              }),
          )}
          visible={visible}
          setVisible={setVisible}
          onConfirm={() => {
            onOk();
            setVisible(false);
          }}
          description={
            (config?.alertMessage ?? selectedList?.length === 1)
              ? intl.formatMessage({
                  id: "vm.nic.state.disabled.bind.alert.message",
                  defaultMessage:
                    "Detected that the associated NIC is in Disabled state. You need to enable the NIC to make the association take effect.",
                })
              : intl.formatMessage({
                  id: "network.service.action.attach.nic.some.confirm.disable.nic",
                  defaultMessage:
                    "Detected that some associated NICs are in Disabled state. You need to enable the NICs to make the association take effect.",
                })
          }
        />
      </>
    );
  };
  return VmNicStateFooter;
};

export const VmNicStateTableSelectAlertFooter =
  getNicStateTableSelectAlertFooter();

export default List;
