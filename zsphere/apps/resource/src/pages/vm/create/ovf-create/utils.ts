const initBasicConfigValues = {
  name: "",
  group: "-2",
  strategy: true,
  description: "",
  tags: [],
  // os: 'Windows 8',
  // guest: 'Windows'
};

const initNicConfigValues = {
  //默认网卡
  "netCardState-0": true,
  "l3NetworkUuids-0": [],
  "nicType-0": "virtio", // nicType的默认值在添加网卡时设置
  "customMac-0": undefined,
  "staticIp-0": undefined,
  "securityGroup-0": [],
  "netCardQosEnabled-0": false,
  "nicMultiQueueNum-0": 4, //与cpu-totalCoreNum保持一致
  "outboundBandwidth-0": { number: undefined, unit: "Mbps" },
  "inboundBandwidth-0": { number: undefined, unit: "Mbps" },
};

export const initialValues = {
  ...initBasicConfigValues,
  ...initNicConfigValues,
};
