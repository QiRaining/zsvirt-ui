export const volumeQosProps = [
  "turnOnQoS",
  "bandwidthMode",
  "totalBandwidth",
  "writeBandwidth",
  "readBandwidth",
  "iopsMode",
  "iopsTotal",
  "readBandwidth",
  "iopsRead",
  "iopsWrite",
  "diskCreateType",
  "diskImage",
  "createDisk",
  "diskType",
];

export const volumeProps = [
  "diskUuid",
  "diskCreateType",
  "diskSize",
  ...volumeQosProps,
  "allocationType",
  "cacheMode",
  "storePath",
  "aio",
  "busType",
  "diskSharable",
  "removedisk",
  "RDM",
];

export const nicProps = [
  "nicUuid",
  "netCardState",
  "l3NetworkUuids",
  "nicType",
  "customMac",
  "ipv4",
  "netmask",
  "gateway",
  "appointIp",
  "netCardQosEnabled",
  "outboundBandwidth",
  "inboundBandwidth",
  "removenetcard",
  "nicMultiQueueNum",
  "securityGroup",
  "ingressPolicy",
  "egressPolicy",
  "nicDevice",
];

interface IEditTemplateConfigCommon {
  name: string; // 名称
  description?: string; // 简介
  count: number; // 数量
  totalCoreNum?: number; // 数量
  // tags: Array<ITag> // 标签
  memorySize?: { number: number; unit: string }; //自定义数据云盘规格大小
  diskSize?: { number: number; unit: string }; //自定义磁盘容量规格大小
  diskCreateType?: "new" | "image"; //自定义数据云盘规格大小
  // volumeSelectDiskOffering: string //数据云盘规格选择
  // rootPrimaryStorage?: [IPrimaryStorage?] // 跟云盘主存储
  // thinProvisionForRootPrimaryStorage?: VolumeProvisioningStrategy // 跟云盘置备类型
  // dataPrimaryStorage?: [IPrimaryStorage?] // 数据云盘主存储
  // thinProvisionForDataPrimaryStorage?: VolumeProvisioningStrategy // 数据云盘置备类型
  // host?: [IHost?] // 物理机
  // image?: [IImage?]
  // createMethod?: string
  // virtioSCSI?: boolean
  // shareable?: boolean
  // primaryStorageProvision?: VolumeProvisioningStrategy
}

export const initialValues: IEditTemplateConfigCommon = {
  name: "",
  count: 1,
  totalCoreNum: undefined,

  description: "",
  // tags: [],
  memorySize: { number: 1, unit: "GB" },
};
