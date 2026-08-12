import type { L3Network as IL3Network } from "@zstack/zsphere-types/graphql";

// 添加DNS
const addDNS = async (l3: IL3Network) =>
  !["manage", "flow"].includes(l3.networkType!) && !l3.isDefault;

// verifyMultiSelect
const verifyMultiSelect = async (selectedList: IL3Network[]) => {
  return selectedList.length >= 1;
};

// 加载云路由规格
const attachVRouterOffering = (current: IL3Network) => {
  return !current.virtualRouterOffering;
};

// 卸载云路由规格
const detachVRouterOffering = (current: IL3Network) => {
  return !!current.virtualRouterOffering;
};

// 卸载云路由规格
const verifyAddIpRange = (current: IL3Network) => {
  return !!current.enableIPAM && !current.isDefault;
};

// 删除
const deleteL3Network = (current: IL3Network) => {
  return !current.isDefault || !current.hasDefaultKernel;
};

const verifyEditConfig = (current: IL3Network) => {
  return !current.isDefault;
};

const verifySetShareType = (current: IL3Network) => {
  return !current.isDefault;
};

const verifyCreateHostKernelInterface = (current: IL3Network) => {
  return !current.isDefault;
};

export {
  addDNS,
  verifyAddIpRange,
  attachVRouterOffering,
  detachVRouterOffering,
  deleteL3Network,
  verifyMultiSelect,
  verifyEditConfig,
  verifySetShareType,
  verifyCreateHostKernelInterface,
};
