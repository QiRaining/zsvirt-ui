import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { UsbDeviceState } from "@zstack/zsphere-types";
import type { UsbDevice as IUsbDevice } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const updateUsbDevice = gql`
  mutation updateUsbDevice($input: UpdateUsbDeviceInput!) {
    updateUsbDevice(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IUsbDevice>> = ({
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const onOk = () => {
    const payload = selectedList.map((it) => {
      return {
        uuid: it.uuid,
        state: UsbDeviceState.Disabled,
      };
    });
    doAction({
      mutation: updateUsbDevice,
      payload,
      name: intl.formatMessage({
        id: "usb.action.stop",
        defaultMessage: "Disable USB Device",
      }),
      total: selectedList.length,
      onProgress: (result: ITaskResult) => {
        console.log(result);
      },
      onFinish: (result: IActionResult) => {
        console.log(result);
      },
    });
    setSelectedList?.([]);
  };

  return (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "usb.modal.title.confirm.disable.usbDevice",
        defaultMessage: "Disable USB Device?",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      onConfirm={onOk}
    />
  );
};

export default Action;
