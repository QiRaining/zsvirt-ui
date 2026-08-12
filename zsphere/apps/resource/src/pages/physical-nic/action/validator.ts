import { gql } from "@apollo/client";
import { PciDeviceVirtStatus } from "@zstack/zsphere-types";
import type {
  HostVO,
  PhysicalNic,
  Host,
  Bond,
} from "@zstack/zsphere-types/graphql";

const { apolloClient } = window.g_main;
// SR-IOV切割
export const verifyGenerateSriov = async (
  current: PhysicalNic,
  _source: HostVO,
) => {
  const { data } = await apolloClient.query({
    query: gql`
      query getHostIommu($uuid: String!) {
        getHostIommu(uuid: $uuid) {
          state
          status
        }
      }
    `,
    variables: {
      uuid: current?.hostUuid,
    },
  });

  return (
    (current.pciDevice?.virtStatus ===
      PciDeviceVirtStatus.SRIOV_VIRTUALIZABLE ||
      current.pciDevice?.virtStatus ===
        PciDeviceVirtStatus.VFIO_MDEV_VIRTUALIZABLE) &&
    data?.getHostIommu?.status === "Active" &&
    !current?.bondingUuid
  );
};

// SR-IOV还原
export const verifyUngenerateSriov = async (current: PhysicalNic) => {
  return (
    current.pciDevice?.virtStatus === PciDeviceVirtStatus.SRIOV_VIRTUALIZED ||
    current.pciDevice?.virtStatus === PciDeviceVirtStatus.VFIO_MDEV_VIRTUALIZED
  );
};

// 修改IPv4地址
export const verifyEditIPv4Address = async (
  current: PhysicalNic,
  source: Host,
) =>
  !current?.bondingUuid &&
  !(current?.interfaceType === "bridgeSlave") &&
  !current?.ipAddresses?.some((ip) =>
    ip.includes(source?.managementIp ?? ""),
  ) &&
  !current?.ipAddresses?.some((ip) => ip.includes(source?.callBackIp ?? ""));

// 设置物理网络类型
export const verifySetPhysicalNetworkType = (current: PhysicalNic) => {
  return !current.bondingUuid;
};
// 添加网卡
export const verifyAddNic = async (current: PhysicalNic[], source: Bond) => {
  if (source?.mode?.includes("802.3ad") && source?.slaves?.length === 8) {
    return false;
  }
  return true;
};
export const verifyWithoutVsiwth = async (current: PhysicalNic, source: Bond) =>
  !source.vSwitch;

// 校验是否可以移除物理网卡
export const verifyZSVRemoveNic = async (current: PhysicalNic, source: Bond) =>
  (source?.slaves?.length ?? 0) > 0;

// modal打开的是判断是否可以添加
export const verifyNicVsiwth = async (current: PhysicalNic[], source: Bond) =>
  !source.vSwitch;

export const verifyConfigSriov = async (
  current: PhysicalNic,
  _source: Bond,
) => {
  const { data } = await apolloClient.query({
    query: gql`
      query getHostIommu($uuid: String!) {
        getHostIommu(uuid: $uuid) {
          state
          status
        }
      }
    `,
    variables: {
      uuid: current?.hostUuid,
    },
  });

  return (
    ["SRIOV_VIRTUALIZABLE", "SRIOV_VIRTUALIZED"].includes(
      current?.pciDevice?.virtStatus as string,
    ) &&
    data?.getHostIommu?.status === "Active" &&
    data?.getHostIommu?.state === "Enabled"
  );
};
