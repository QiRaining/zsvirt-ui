import type {
  Cluster as ICluster,
  L2Network as IL2Network,
} from "@zstack/zsphere-types/graphql";

// 启动
export const verifyEnabled = async (current: ICluster) => {
  return current.state !== "Enabled";
};

// 停止
export const verifyDisabled = async (current: ICluster) => {
  return current.state !== "Disabled";
};

// 已加载二层网络
export const isAttachL2network = async (current: ICluster) => {
  return current?.isAttachL2network === true;
};

// 已加载部署服务器
export const isAttachPxeServer = async (current: ICluster) => {
  return current?.isAttachBaremetalPxeServer === true;
};

// 已加载部署服务器
export const configPxeServer = async (current: ICluster) => {
  return current?.isAttachBaremetalPxeServer === false;
};

export const canDetachFromL2Network = (
  selectedList: ICluster[],
  source: IL2Network,
) => {
  return (
    !selectedList.some((c) => c.hypervisorType === "ESX") &&
    source?.type !== "VxlanNetwork"
  );
};
