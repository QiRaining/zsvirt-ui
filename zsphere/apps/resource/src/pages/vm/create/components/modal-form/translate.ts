export enum CreatVmFields {
  Name = "name",
  Count = "count",
  BackupStorage = "backupStorage",
  OvaDragger = "ovaDragger",
  TotalCoreNum = "totalCoreNum",
  SockedNum = "sockedNum",
  MemorySize = "memorySize",
  DiskSize = "diskSize",
  CreateDisk = "createDisk",
  RDM = "RDM",
  L3 = "l3NetworkUuids",
  IPV4 = "ipv4",
  NicMultiQueueNum = "nicMultiQueueNum",
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
  pcieDevice = "pcieDevice",
  usbDivice = "usbDivice",
  //导入虚拟机
  ovfDragger = "ovfDragger",
  vmdkDragger = "vmdkDragger",
  //新建集群
  mevoco = "mevoco",
  "host-cpu.overProvisioning.ratio" = "host-cpu.overProvisioning.ratio",
  kvm = "kvm",
  migrateNetworkCidr = "migrateNetworkCidr",
  displayNetworkCidr = "displayNetworkCidr",
  drs = "drs",
  cpuUsedPercentThreshold = "cpuUsedPercentThreshold",
  thresholdDuration = "thresholdDuration",
  memoryUsedPercentThreshold = "memoryUsedPercentThreshold",
  vmTemplate = "vmTemplate",
  Description = "description",
}

export const translateValidateFailedLable = (intl: any, type: string) => {
  const typeArr = type.split("-");
  let fieldType = typeArr[0] as CreatVmFields;
  if (!CreatVmFields[fieldType]) {
    fieldType = type as CreatVmFields;
  }

  const map: {
    [key in CreatVmFields]: string;
  } = {
    [CreatVmFields.Name]: intl.formatMessage({
      id: "name.validate.failed",
      defaultMessage: "  Name",
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
      id: "virtualization.create.instance.hardware.network.ipv4.validate.failed",
      defaultMessage: "NIC - IP Address",
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
    [CreatVmFields.mevoco]: intl.formatMessage({
      id: "overProvisioning.memory",
      defaultMessage: "Memory Overcommit Ratio",
    }),
    [CreatVmFields["host-cpu.overProvisioning.ratio"]]: intl.formatMessage({
      id: "cpu.overProvisioning.ratio",
      defaultMessage: "CPU Overcommit Ratio",
    }),
    [CreatVmFields.kvm]: intl.formatMessage({
      id: "virtualization.cluster.field.reservedMemory",
      defaultMessage: "Host Reserved Memory",
    }),
    [CreatVmFields.migrateNetworkCidr]: intl.formatMessage({
      id: "migration.network",
      defaultMessage: "Migration Network",
    }),
    [CreatVmFields.displayNetworkCidr]: intl.formatMessage({
      id: "vdiNetwork",
      defaultMessage: "VDI Network",
    }),
    [CreatVmFields.drs]: intl.formatMessage({
      id: "virtualization.cluster.create.field.automationLevel.drs.schedulingInterval",
      defaultMessage: "Cluster Scanning Interval",
    }),
    [CreatVmFields.cpuUsedPercentThreshold]: intl.formatMessage({
      id: "metric.name.vm.CPUUsedUtilization.in.select",
      defaultMessage: " CPU Utilization",
    }),
    [CreatVmFields.thresholdDuration]: intl.formatMessage({
      id: "durationTime",
      defaultMessage: "Duration",
    }),
    [CreatVmFields.memoryUsedPercentThreshold]: intl.formatMessage({
      id: "OperatingSystemMemoryUsedPercent",
      defaultMessage: "Memory Utilization",
    }),
    [CreatVmFields.vmTemplate]: intl.formatMessage({
      id: "template",
      defaultMessage: "Template",
    }),
    [CreatVmFields.Description]: intl.formatMessage({
      id: "description",
      defaultMessage: "Description",
    }),
  };

  return map?.[fieldType];
};
