import { Text } from "@zstack/design";
import { ResourceName, Constant } from "@zstack/zsphere-components";
import { ConstantType } from "@zstack/zsphere-constant";
import { useColumnConfig } from "@zstack/zsphere-engine/src/pci-device";
import {
  PciDeviceState,
  PciDeviceStatus,
  PciDevicePassThroughState,
} from "@zstack/zsphere-types";
import { LeftNavType, NavView } from "@zstack/zsphere-types";
import type { PciDevice as IPciDevice } from "@zstack/zsphere-types/graphql";
import React from "react";

export default (param: any) => {
  return useColumnConfig<IPciDevice>([
    {
      key: "name",
      formatter: (current) => {
        return current.name.split("_").slice(1, -1).join("_");
      },
    },
    {
      key: "manufacturer",
      formatter: (current) => {
        return current.vendor;
      },
    },
    {
      key: "type",
      filters: [
        { text: "Ethernet Controller", value: "Ethernet_Controller" },
        { text: "Audio Controller", value: "Audio_Controller" },
        { text: "USB Controller", value: "USB_Controller" },
        { text: "Serial Controller", value: "Serial_Controller" },
        { text: "Moxa Device", value: "Moxa_Device" },
        { text: "Memory Controller", value: "Memory_Controller" },
        { text: "System Peripheral", value: "System_Peripheral" },
        { text: "ISA Bridge", value: "ISA_Bridge" },
        { text: "Host Bridge", value: "Host_Bridge" },
        { text: "PCI Bridge", value: "PCI_Bridge" },
        { text: "RAID Controller", value: "RAID_Controller" },
        { text: "SATA Controller", value: "SATA_Controller" },
        {
          text: "Non Volatile Memory Controller",
          value: "Non_Volatile_Memory_Controller",
        },
        { text: "Fibre Channel", value: "Fibre_Channel" },
        { text: "Performance Counters", value: "Performance_Counters" },
        {
          text: "Signal Processing Controller",
          value: "Signal_Processing_Controller",
        },
        { text: "Communication Controller", value: "Communication_Controller" },
        { text: "PIC", value: "PIC" },
        { text: "SMBus", value: "SMBus" },
        { text: "Generic", value: "Generic" },
      ],
      render: (current) => {
        return current.type && <Text>{current.type.replace(/_/g, " ")}</Text>;
      },
    },
    {
      key: "passthroughState",
      searchKey: "passThroughState",
      render: (current) => (
        <Constant
          enumType={ConstantType.PciePassthroughState}
          value={current.passThroughState}
        />
      ),
      filterOptions: PciDevicePassThroughState,
      filterEnumType: ConstantType.PciePassthroughState,
      ...(param?.view === "main.passthrough" && { filters: undefined }),
    },
    {
      key: "host",
      linkResource: "host",
    },
    {
      key: "state",
      filterOptions: PciDeviceState,
    },
    {
      key: "status",
      filterOptions: PciDeviceStatus,
    },
    {
      key: "host",
      render: (current: IPciDevice) => {
        if (!current.host?.uuid) {
          return null;
        }
        return (
          <ResourceName
            value={current.host.name}
            link={{
              to: "/host",
              microAppName: "virtualization-resource",
              leftnav: LeftNavType.ClusterHost,
              navView: NavView.Resource,
              uuid: current.host.uuid,
            }}
          />
        );
      },
    },
    {
      key: "VMInstance",
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
