import { gql } from "@apollo/client";
import { SetDiskQosType } from "zsv_resource_shared/vm/disk/shared-disk-utils";

export const createInstance = gql`
  mutation createInstance($input: CreateInstanceInput!) {
    createInstance(input: $input) {
      actionId
    }
  }
`;

const initValueOfBasic = {
  name: "",
  count: 1,
  group: "-2",
  strategy: true,
  description: "",
  tags: [],
};

export const initialBasicValues = {
  ...initValueOfBasic,
  memorySize: { number: 8, unit: "GB" },
  // 根云盘
  "diskCreateType-0": "new",
  "diskSize-0": { number: 40, unit: "GB" },
  "turnOnQoS-0": false,
  "bandwidthMode-0": SetDiskQosType.SetBandwidthTotal,
  "totalBandwidth-0": { number: undefined, unit: "MB" },
  "writeBandwidth-0": { number: undefined, unit: "MB" },
  "readBandwidth-0": { number: undefined, unit: "MB" },
  "iopsMode-0": SetDiskQosType.SetIopsTotal,
  "busType-0": "virtio",
  "allocationType-0": "ThinProvisioning",
  "cacheMode-0": "none",
  "aio-0": false,
  "diskSharable-0": false,
  //默认网卡
  "netCardState-0": true,
  "l3NetworkUuids-0": [],
  "nicType-0": "virtio", // nicType的默认值在添加网卡时设置
  "customMac-0": undefined,
  "staticIp-0": undefined,
  "securityGroup-0": [],
  "netCardQosEnabled-0": false,
  "nicMultiQueueNum-0": "4", //与cpu-totalCoreNum保持一致
  "outboundBandwidth-0": { number: undefined, unit: "Mbps" },
  "inboundBandwidth-0": { number: undefined, unit: "Mbps" },
  soundCard: "HDA(ICH6)",
  gpuType: "virtio",
  motherboardType: "i440fx",
  //cpu part
  totalCoreNum: 4,
  sockedNum: 4,
  CPUMode: "none",
  cpuResourceLevel: "Normal",
  cpuQuota: 100,
  hotPlug: true, //cpuhotplug
  cpuHideKVMMark: true, //
  //memory part
  memoryResourceLevel: "Normal",
  //disk part
  //netcard part

  //cdRom part

  os: "Windows 8",
  guest: "Windows",

  //远程访问
  consoleMode: "vnc",
  vdiMonitorNumber: 1,
  // antiSpoofing: { number: 4, unit: "MB" },
  spiceStreamingMode: "off",
  consolePassword: "",
  usbRedirect: false,

  //登录认证
  loginType: "none",
  rootPassword: "",
  sshkey: "",

  //性能优化工具
  faultStrategy: "Preserve",
  advancedConfigGuestToolTimeSync: true,

  //引导选项
  bootOrders: [""],
  bootMode: "Legacy",
  bootMenuSplashTimeout: 10,

  //其他设置
  vmCpuHypervisorFeature: false,
  vmPortOff: false,
  antiSpoofing: false,
  haStickStragedy: false,
  emulateHyperV: false,
  migrateAutoConverge: false,
  hotPlugEnabled: true,
};
