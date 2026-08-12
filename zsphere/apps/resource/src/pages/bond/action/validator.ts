import type { Bond, Host } from "@zstack/zsphere-types/graphql";

// 添加网卡
export const verifyAddNic = (current: Bond) => {
  if (current?.mode?.includes("802.3ad") && current?.slaves?.length === 8) {
    return false;
  }
  return true;
};

// 移出网卡
export const verifyRemoveNic = (current: Bond) =>
  (current?.slaves?.length ?? 0) > 1;

export const verifyZSVRemoveNic = (current: Bond, source: any) =>
  source?.isDefault
    ? (current?.slaves?.length ?? 0) > 1
    : (current?.slaves?.length ?? 0) > 0;

export const verifyWithoutVsiwth = (current: Bond) => !current.vSwitch;

// 删除
export const verifyDeleteBond = (current: Bond) =>
  current.bondingType !== "bridgeSlave";

export const verifySelected = (selectedList: Bond[]) =>
  selectedList?.length > 0;

// 修改聚合口
export const verifyModifyBond = (current: Bond) =>
  current.bondingType !== "bridgeSlave";

export const verifyPublicNetworkorl2Network = (current: Bond, source: Host) => {
  return (
    !(current?.bondingType === "bridgeSlave") &&
    !current?.ipAddresses?.some((ip) =>
      ip.includes(source?.managementIp ?? ""),
    ) &&
    !current?.ipAddresses?.some((ip) => ip.includes(source?.callBackIp ?? ""))
  );
};

export const verifyVSwitchIsNotDefault = (current: Bond, source: any) =>
  !source?.isDefault;
