import type { IntlShape } from "react-intl";

export enum CreatVmFields {
  Name = "name",
  description = "description",
  Count = "count",
  BackupStorage = "backupStorage",
  OvaDragger = "ovaDragger",
  TotalCoreNum = "totalCoreNum",
  CpuQuota = "cpuQuota",
  SockedNum = "sockedNum",
  MemorySize = "memorySize",
  DiskSize = "diskSize",
  CreateDisk = "createDisk",
  RDM = "RDM",
  L3 = "l3NetworkUuids",
  IPV4 = "ipv4",
  IPV6 = "ipv6",
  netmask = "netmask",
  prefixLen = "prefixLen",
  gateway4 = "gateway4",
  gateway6 = "gateway6",
  nicDevice = "nicDevice",
  NicMultiQueueNum = "nicMultiQueueNum",
  dnsList = "dnsList",
  dnsList4 = "dnsList4",
  dnsList6 = "dnsList6",
  CdRomList = "cdRomList",
  diskImage = "diskImage",
  inboundBandwidth = "inboundBandwidth",
  outboundBandwidth = "outboundBandwidth",
  totalBandwidth = "totalBandwidth",
  writeBandwidth = "writeBandwidth",
  readBandwidth = "readBandwidth",
  iopsTotal = "iopsTotal",
  iopsRead = "iopsRead",
  iopsWrite = "iopsWrite",
  sshkey = "sshkey",
  rootPassword = "rootPassword",
  gpuDevice = "gpuDevice",
  usbDivice = "usbDivice",
  pcieDevice = "pcieDevice",
  consolePassword = "consolePassword",

  // 虚拟机规范
  vmSpecPreset = "vmSpecPreset.value",
  workgroupName = "vmSpecManualConfig.WorkGroup.domainName",
  hostname = "vmSpecManualConfig.hostname",
  adminPassword = "vmSpecManualConfig.adminPassword.value",
  domainName = "vmSpecManualConfig.Domain.domainName",
  domainUsername = "vmSpecManualConfig.Domain.domainUsername",

  //导入虚拟机
  ovfDragger = "ovfDragger",
  vmdkDragger = "vmdkDragger",

  //模版
  vmTemplate = "vmTemplate",
}

export const translateValidateFailedLabel = (
  intl: IntlShape,
  fieldName: string,
  fullName: string,
) => {
  const map: Record<string, string> = {
    [CreatVmFields.Name]: intl.formatMessage({
      id: "name.validate.failed",
      defaultMessage: "  Name",
    }),
    [CreatVmFields.description]: intl.formatMessage({
      id: "description",
      defaultMessage: "Description",
    }),
    [CreatVmFields.Count]: intl.formatMessage({
      id: "virtualization.create.instance.count",
      defaultMessage: "Quantity",
    }),
    [CreatVmFields.OvaDragger]: intl.formatMessage({
      id: "ovaDragger.validate.failed",
      defaultMessage: "OVA file",
    }),
    [CreatVmFields.TotalCoreNum]: intl.formatMessage({
      id: "totalCoreNum.validate.failed",
      defaultMessage: "CPU Cores (Total)",
    }),
    [CreatVmFields.CpuQuota]: intl.formatMessage({
      id: "cpuQuota.validate.failed",
      defaultMessage: "CPU Clock Speed Limit",
    }),
    [CreatVmFields.SockedNum]: intl.formatMessage({
      id: "sockedNum.validate.failed",
      defaultMessage: "CPU Cores per Socket",
    }),
    [CreatVmFields.MemorySize]: intl.formatMessage({
      id: "memorySize.validate.failed",
      defaultMessage: "Memory",
    }),
    [CreatVmFields.DiskSize]: intl.formatMessage({
      id: "diskSize.validate.failed",
      defaultMessage: "Disk Size",
    }),
    [CreatVmFields.diskImage]: intl.formatMessage({
      id: "diskImage.validate.failed",
      defaultMessage: "Disk Image",
    }),
    [CreatVmFields.CreateDisk]: intl.formatMessage({
      id: "createDisk.validate.failed",
      defaultMessage: "Disk-Existing Disk",
    }),
    [CreatVmFields.RDM]: intl.formatMessage({
      id: "rdmDisk.validate.failed",
      defaultMessage: "Disk-RDM Disk",
    }),

    [CreatVmFields.totalBandwidth]: intl.formatMessage({
      id: "diskImage.validate.totalBandwidth",
      defaultMessage: "Hard Disk - Bandwidth - Overall Speed",
    }),
    [CreatVmFields.writeBandwidth]: intl.formatMessage({
      id: "diskImage.validate.writeBandwidth",
      defaultMessage: "Hard Disk - Bandwidth - Write Speed",
    }),
    [CreatVmFields.readBandwidth]: intl.formatMessage({
      id: "diskImage.validate.readBandwidth",
      defaultMessage: "Hard Disk - Bandwidth - Read Speed",
    }),
    [CreatVmFields.iopsTotal]: intl.formatMessage({
      id: "diskImage.validate.iopsTotal",
      defaultMessage: "Hard Drive - Bandwidth - Total IOPS",
    }),
    [CreatVmFields.iopsRead]: intl.formatMessage({
      id: "diskImage.validate.iopsRead",
      defaultMessage: "Hard Disk - Read IOPS",
    }),
    [CreatVmFields.iopsWrite]: intl.formatMessage({
      id: "diskImage.validate.iopsWrite",
      defaultMessage: "Hard Disk - Write IOPS",
    }),
    [CreatVmFields.L3]: intl.formatMessage({
      id: "virtualization.create.instance.hardware.network.card.port.group.validate.failed",
      defaultMessage: "NIC-Port Group",
    }),
    [CreatVmFields.IPV4]: intl.formatMessage({
      id: "virtualization.create.instance.hardware.network.ip.v4.validate.failed",
      defaultMessage: "NIC-IPv4 Address",
    }),
    [CreatVmFields.IPV6]: intl.formatMessage({
      id: "virtualization.create.instance.hardware.network.ip.v6.validate.failed",
      defaultMessage: "NIC-IPv6 Address",
    }),
    [CreatVmFields.netmask]: intl.formatMessage({
      id: "virtualization.create.instance.hardware.network.netmask.validate.failed",
      defaultMessage: "NIC-Netmask",
    }),
    [CreatVmFields.prefixLen]: intl.formatMessage({
      id: "virtualization.create.instance.hardware.network.prefixLen.validate.failed",
      defaultMessage: "NIC-Prefix Length",
    }),
    [CreatVmFields.gateway4]: intl.formatMessage({
      id: "virtualization.create.instance.hardware.network.gateway4.validate.failed",
      defaultMessage: "NIC-IPv4 Gateway",
    }),
    [CreatVmFields.gateway6]: intl.formatMessage({
      id: "virtualization.create.instance.hardware.network.gateway6.validate.failed",
      defaultMessage: "NIC-IPv6 Gateway",
    }),
    [CreatVmFields.nicDevice]: intl.formatMessage({
      id: "virtualization.create.instance.hardware.network.nicDevice.validate.failed",
      defaultMessage: "NIC-NIC",
    }),
    [CreatVmFields.NicMultiQueueNum]: intl.formatMessage({
      id: "virtualization.create.instance.hardware.network.nicMultiQueueNum.validate.failed",
      defaultMessage: "NIC-Multi-Queues",
    }),
    [CreatVmFields.outboundBandwidth]: intl.formatMessage({
      id: "virtualization.create.instance.hardware.network.card.outboundBandwidth.validate.failed",
      defaultMessage: "NIC - Transmit Bandwidth",
    }),
    [CreatVmFields.inboundBandwidth]: intl.formatMessage({
      id: "virtualization.create.instance.hardware.network.card.inboundBandwidth.validate.failed",
      defaultMessage: "NIC - Inbound Bandwidth",
    }),
    [CreatVmFields.dnsList]: intl.formatMessage({
      id: "virtualization.create.instance.hardware.network.card.dns.validate.failed",
      defaultMessage: "NIC-DNS",
    }),
    [CreatVmFields.dnsList4]: intl.formatMessage({
      id: "virtualization.create.instance.hardware.network.card.dns4.validate.failed",
      defaultMessage: "NIC-IPv4 DNS",
    }),
    [CreatVmFields.dnsList6]: intl.formatMessage({
      id: "virtualization.create.instance.hardware.network.card.dns6.validate.failed",
      defaultMessage: "NIC-IPv6 DNS",
    }),
    [CreatVmFields.CdRomList]: intl.formatMessage({
      id: "virtualization.create.instance.hardware.cdrom.image.validate.failed",
      defaultMessage: "CD/DVD Drive",
    }),
    [CreatVmFields.sshkey]: intl.formatMessage({
      id: "virtualization.create.instance.advance.config.sshkey.validate.failed",
      defaultMessage: "Login Authentication - SSH Key",
    }),
    [CreatVmFields.rootPassword]: intl.formatMessage({
      id: "virtualization.create.instance.advance.config.rootPassword.validate.failed",
      defaultMessage: "Login Authentication - Password",
    }),
    [CreatVmFields.gpuDevice]: intl.formatMessage({
      id: "gpu.device",
      defaultMessage: "GPU Device",
    }),
    [CreatVmFields.usbDivice]: intl.formatMessage({
      id: "usb.device",
      defaultMessage: "USB Device",
    }),
    [CreatVmFields.pcieDevice]: intl.formatMessage({
      id: "pcie.device",
      defaultMessage: "PCIe Device",
    }),
    [CreatVmFields.consolePassword]: intl.formatMessage({
      id: "consolePassword",
      defaultMessage: "Console Password",
    }),
    [CreatVmFields.vmSpecPreset]: intl.formatMessage({
      id: "virtualization.create.instance.vmSpecPreset.validate.failed",
      defaultMessage: "General Options-VM Specification",
    }),
    [CreatVmFields.hostname]: intl.formatMessage({
      id: "virtualization.create.instance.hostname.validate.failed",
      defaultMessage: "General Options-Hostname",
    }),
    [CreatVmFields.workgroupName]: intl.formatMessage({
      id: "virtualization.create.instance.workgroupName.validate.failed",
      defaultMessage: "General Options-Workgroup Name",
    }),
    [CreatVmFields.domainName]: intl.formatMessage({
      id: "virtualization.create.instance.domainName.validate.failed",
      defaultMessage: "General Options-Domain",
    }),
    [CreatVmFields.domainUsername]: intl.formatMessage({
      id: "virtualization.create.instance.domainUsername.validate.failed",
      defaultMessage: "General Options-Domain Username",
    }),
    [CreatVmFields.adminPassword]: intl.formatMessage({
      id: "virtualization.create.instance.adminPassword.validate.failed",
      defaultMessage: "General Options-Administrator Password",
    }),
    //导入虚拟机
    [CreatVmFields.BackupStorage]: intl.formatMessage({
      id: "backupStorage",
      defaultMessage: "Image Storage",
    }),
    [CreatVmFields.vmdkDragger]: intl.formatMessage({
      id: "vmdk",
      defaultMessage: "VMDK File",
    }),
    [CreatVmFields.ovfDragger]: intl.formatMessage({
      id: "ovfFile",
      defaultMessage: "OVF File",
    }),

    [CreatVmFields.vmTemplate]: intl.formatMessage({
      id: "template",
      defaultMessage: "Template",
    }),
  };

  return map[fieldName] ?? map[fullName];
};
