import { useQuery } from "@apollo/client";
import { useTime } from "@zstack/hooks";
import { usbsDeviceList } from "@zstack/virtualization-resource/src/gql/usb.gql";
import { Constant, ResourceName } from "@zstack/zsphere-components";
import type { ConstantEnum } from "@zstack/zsphere-constant";
import { Illustration } from "@zstack/zsphere-illustration";
import { Op } from "@zstack/zsphere-types";
import type {
  UsbDevice as IUsbDevice,
  VmInstance as IVM,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

export const useUsbList = (vm: IVM) => {
  const intl = useIntl();
  const { getServerTime } = useTime();

  const { data, refetch } = useQuery(usbsDeviceList, {
    variables: {
      conditions: [{ key: "vmInstanceUuid", op: Op.eq, value: vm.uuid }],
    },
  });

  const list = useMemo(() => {
    if (!data?.usbsDeviceList?.list?.length) {
      return [];
    }

    return data?.usbsDeviceList?.list.map((usb: IUsbDevice, index: number) => {
      return {
        label: (
          <>
            <Illustration type="usb" size={16} />
            {intl.formatMessage({
              id: "usb.device",
              defaultMessage: "USB Device",
            })}{" "}
            {index + 1}
          </>
        ),
        value: <ResourceName value={usb.name} />,
        children: [
          {
            label: intl.formatMessage({
              id: "device.name",
              defaultMessage: "Device Name",
            }),
            value: <ResourceName value={usb.name} />,
          },
          {
            label: intl.formatMessage({
              id: "attach.type",
              defaultMessage: "Attach Mode",
            }),
            value:
              usb.attachType === "PassThrough"
                ? intl.formatMessage({
                    id: "passThrough",
                    defaultMessage: "Passthrough",
                  })
                : intl.formatMessage({
                    id: "transpond",
                    defaultMessage: "Forward",
                  }),
          },
          {
            label: intl.formatMessage({
              id: "iProduct",
              defaultMessage: "Manufacturer",
            }),
            value:
              usb.iManufacturer?.indexOf("(error)") === -1
                ? usb.iManufacturer
                : intl.formatMessage({
                    id: "usb.unknown",
                    defaultMessage: "Unknown",
                  }),
          },
          {
            label: intl.formatMessage({ id: "type", defaultMessage: "Type" }),
            value:
              usb.iProduct?.indexOf("(error)") === -1
                ? usb.iProduct
                : intl.formatMessage({
                    id: "usb.unknown",
                    defaultMessage: "Unknown",
                  }),
          },
          {
            label: intl.formatMessage({
              id: "enable.state",
              defaultMessage: "State",
            }),
            value: <Constant value={usb.state as unknown as ConstantEnum} />,
          },
          {
            label: intl.formatMessage({
              id: "usb.version",
              defaultMessage: "USB Version",
            }),
            value: usb.usbVersion,
          },
          {
            label: intl.formatMessage({
              id: "create.date",
              defaultMessage: "Creation Time",
            }),
            value: getServerTime(usb.createDate!).format("YYYY-MM-DD HH:mm:ss"),
          },
        ],
      };
    });
  }, [data, getServerTime]);

  return [list, refetch];
};
