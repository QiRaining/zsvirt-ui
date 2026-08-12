import type { IllustrationTypes } from "@zstack/zsphere-illustration";

export enum IHardwareType {
  CPU = "cpu",
  Memory = "memory",
  Disk = "disk",
  Netcard = "netcard",
  Cdrom = "cdrom",
  Other = "other",
  GPU = "gpu",
  PCIe = "pcie",
  USB = "usb",
  TPM = "tpm",
}

export const RESOURCE_ORDER = [
  "cpu",
  "memory",
  "disk",
  "netcard",
  "cdrom",
  "gpu",
  "usb",
  "tpm",
  "other",
];

export const ResourceMaxNumber = {
  Disk: 3,
  Netcard: 3,
  Cdrom: 3,
  GPU: 1,
  USB: 1,
  TPM: 1,
};

export interface IHardWareItem {
  type: IHardwareType;
  dataSource?: any;
  updateFieldName?: any;
  form?: any;
  unit?: string;
  setRemoveItemKey?: Function;
  flagKey?: string;
  actions?: any;
  showErrorBackground?: boolean;
  closeable?: boolean;
  displayIndex?: number;
  disableRemove?: boolean;
  disableRemoveTooltip?: string;
  originalValue?: any;
}

export const getIcon = (type: IHardwareType) => {
  const map = {
    [IHardwareType.CPU]: "cpu",
    [IHardwareType.Memory]: "memory",
    [IHardwareType.Disk]: "disk",
    [IHardwareType.Netcard]: "netcard",
    [IHardwareType.Cdrom]: "cddrive",
    [IHardwareType.Other]: "other",
    [IHardwareType.GPU]: "gpu",
    [IHardwareType.PCIe]: "pcie",
    [IHardwareType.USB]: "usb",
    [IHardwareType.TPM]: "illustration-lock",
  };
  return map?.[type] as IllustrationTypes;
};

export const getTitle = (type: IHardwareType, intl: any, index?: string) => {
  const map = {
    [IHardwareType.CPU]: intl.formatMessage({
      id: "virtualization.hardware.item.cpu",
      defaultMessage: "CPU",
    }),
    [IHardwareType.Memory]: intl.formatMessage({
      id: "virtualization.hardware.item.memory",
      defaultMessage: "Memory",
    }),
    [IHardwareType.Disk]: intl.formatMessage({
      id: "virtualization.hardware.item.disk",
      defaultMessage: "Disk",
    }),
    [IHardwareType.Netcard]: intl.formatMessage({
      id: "virtualization.hardware.item.netcard",
      defaultMessage: "NIC",
    }),
    [IHardwareType.Cdrom]: intl.formatMessage({
      id: "virtualization.hardware.item.cdrom",
      defaultMessage: "CD/DVD Drive",
    }),
    [IHardwareType.Other]: intl.formatMessage({
      id: "virtualization.hardware.item.other",
      defaultMessage: "Other",
    }),
    [IHardwareType.GPU]: intl.formatMessage({
      id: "virtualization.hardware.item.gpu",
      defaultMessage: "GPU Device",
    }),
    [IHardwareType.PCIe]: intl.formatMessage({
      id: "virtualization.hardware.item.pcie",
      defaultMessage: "PCIe Device",
    }),
    [IHardwareType.USB]: intl.formatMessage({
      id: "virtualization.hardware.item.usb",
      defaultMessage: "USB Device",
    }),
    [IHardwareType.TPM]: intl.formatMessage({
      id: "virtualization.hardware.item.tpm",
      defaultMessage: "TPM",
    }),
  };

  return [
    IHardwareType.Disk,
    IHardwareType.Cdrom,
    IHardwareType.Netcard,
    IHardwareType.USB,
    IHardwareType.PCIe,
    IHardwareType.GPU,
  ].indexOf(type) === -1
    ? map?.[type]
    : map?.[type] + String(Number(index) + 1);
};
