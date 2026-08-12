import { ResourceName } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/usb";
import { LeftNavType } from "@zstack/zsphere-types";
import { NavView } from "@zstack/zsphere-types";
import type { UsbDevice as IUsbDevice } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

export default () => {
  const intl = useIntl();
  return useColumnConfig<IUsbDevice>([
    {
      key: "attachType",
      formatter: ({ attachType }) =>
        attachType === "PassThrough"
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
      key: "name",
      formatter: ({ name }) =>
        name?.indexOf("(error)") === -1
          ? name
          : intl.formatMessage({
              id: "usb.unknown",
              defaultMessage: "Unknown",
            }),
    },
    {
      key: "iManufacturer",
      formatter: ({ iManufacturer }) =>
        iManufacturer?.indexOf("(error)") === -1
          ? iManufacturer
          : intl.formatMessage({
              id: "usb.unknown",
              defaultMessage: "Unknown",
            }),
    },
    {
      key: "iProduct",
      formatter: ({ iProduct }) =>
        iProduct?.indexOf("(error)") === -1
          ? iProduct
          : intl.formatMessage({
              id: "usb.unknown",
              defaultMessage: "Unknown",
            }),
    },
    {
      key: "host",
      auth: {
        type: "block",
        authKey: "host",
        resource: "usb",
      },
      linkResource: {
        microAppName: "virtualization-resource",
        path: "host",
      },
    },
    {
      key: "vmInstance",
      render: ({ vmInstanceUuid, vmInstance, templatedVmInstance }) => {
        if (templatedVmInstance) {
          return (
            <ResourceName
              value={templatedVmInstance.name}
              canModify
              link={{
                to: `/vm-template`,
                microAppName: "virtualization-resource",
                uuid: templatedVmInstance.uuid,
                leftnav: LeftNavType.TemplateVm,
                navView: NavView.Template,
              }}
            />
          );
        }
        if (vmInstance) {
          return (
            <ResourceName
              value={vmInstance.name}
              canModify
              link={{
                to: `/vm`,
                microAppName: "virtualization-resource",
                uuid: vmInstance.uuid,
                leftnav: LeftNavType.ClusterHost,
                navView: NavView.Resource,
              }}
            />
          );
        }
        return <ResourceName canModify value={vmInstanceUuid} />;
      },
    },
  ]);
};
