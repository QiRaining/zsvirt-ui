import { gql } from "@apollo/client";
import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  UsbDevice as IUsbDevice,
  DetachUsbDeviceToVmPayload,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

const detachUsbDeviceToVm = gql`
  mutation detachUsbDeviceToVm($input: DetachUsbDeviceToVmInput!) {
    detachUsbDeviceToVm(input: $input) {
      actionId
    }
  }
`;
const Action: React.FC<IActionWrapperProps<IUsbDevice>> = ({
  visible,
  setVisible,
  refetch,
  selectedList = [],
  setSelectedList,
  source,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const vmPage = useMemo<boolean>(
    () => source?.__typename === "VmInstance",
    [source?.__typename],
  );

  const onOk = async () => {
    setVisible(false);
    const payload: DetachUsbDeviceToVmPayload[] = selectedList.map((cv) => ({
      usbDeviceUuid: cv.uuid,
    }));
    doAction({
      mutation: detachUsbDeviceToVm,
      payload,
      name: intl.formatMessage({
        id: "resource.action.detach.usb.device",
        defaultMessage: "Detach USB Device",
      }),
      total: selectedList.length,
      onFinish: () => {
        setSelectedList?.([]);
        refetch?.();
      },
    });
  };

  return (
    <DialogP1
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      bannerMessage={intl.formatMessage({
        id: "vm.usb.alert",
        defaultMessage: "This operation interrupts the data reads/writes on USB devices. Please exercise caution.",
      })}
      title={
        vmPage
          ? intl.formatMessage({
              id: "usb.modal.title.confirm.detach.usbDevice",
              defaultMessage: "Detach USB Device?",
            })
          : intl.formatMessage({
              id: "usb.modal.title.confirm.usbDevice.detach.vm",
              defaultMessage: "Detach Virtual Machine?",
            })
      }
    />
  );
};

export default Action;
