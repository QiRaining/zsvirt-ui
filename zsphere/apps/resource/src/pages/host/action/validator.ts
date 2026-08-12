import {
  HostIPMIPowerStatus,
  HostState,
  HostStatus,
  NodeType,
} from "@zstack/zsphere-types";
import type { HostVO as IHost } from "@zstack/zsphere-types/graphql";

// one
const one = async (selectedList: IHost[]) => {
  return selectedList.length === 1;
};
// 没有选中
const verifyNotSelect = (selectedList: IHost[]): boolean => {
  return selectedList?.length <= 0 || !selectedList;
};
// many
const many = async (selectedList: IHost[]) => {
  return selectedList.length >= 1;
};

// 启动
const enabled = async (current: IHost) => {
  return current.state !== "Enabled";
};

// 停止
const disabled = async (current: IHost) => {
  return current.state !== "Disabled";
};

// 重连
const reconnection = async (selectedList: IHost[]) => {
  const filterList = selectedList.filter(
    (item) => item.state !== HostState.Maintenance,
  );
  return !!(filterList?.length && selectedList?.length === filterList?.length);
};

// 绑定标签
const bindLabel = async (current: IHost) => {
  return (current?.tag?.length || 0) >= 0;
};

// 解绑标签
const unboundLabel = async (current: IHost) => {
  return (current?.tag?.length || 0) > 0;
};

// 维护模式
const maintenance = async (selectedList: IHost[]) => {
  const filterList = selectedList.filter(
    (item) =>
      item.state !== HostState.Maintenance &&
      item.status !== HostStatus.Disconnected &&
      item.status !== HostStatus.Connecting,
  );
  return !!(filterList?.length && selectedList?.length === filterList?.length);
};

// 退出维护模式
const exitMaintenance = async (selectedList: IHost[]) => {
  const filterList = selectedList.filter(
    (item) => item.state === HostState.Maintenance,
  );
  return !!(filterList?.length && selectedList?.length === filterList?.length);
};

/**
 * 物理机开机：
 * 1. 已经纳管： 关机状态
 * 2. 未纳管：不支持开机
 */
const validPowerOn = async (current: IHost) => {
  return current?.ipmiPowerStatus === HostIPMIPowerStatus.POWER_OFF;
};
/**
 * 物理机关机：
 * 1. 已经纳管： 开机状态，开机中状态，关机中状态
 * 2. 未纳管 或者 未知：就绪状态 已连接
 * 3. 多台操作不支持管理节点host
 */
const validPowerOff = async (
  current: IHost,
  source?: any,
  selectedList?: IHost[],
) => {
  const normalCond =
    [
      HostIPMIPowerStatus.POWER_ON,
      HostIPMIPowerStatus.POWER_BOOTING,
      HostIPMIPowerStatus.POWER_SHUTDOWN,
    ].includes(current?.ipmiPowerStatus ?? -1) ||
    ([
      HostIPMIPowerStatus.UN_CONFIGURED,
      HostIPMIPowerStatus.POWER_UNKNOWN,
    ].includes(current?.ipmiPowerStatus ?? -1) &&
      current?.status === HostStatus.Connected);

  if (selectedList?.length && selectedList?.length > 1) {
    return (
      normalCond && current?.hostNodeInfo?.nodeType !== NodeType.ManagementNode
    );
  }
  return normalCond;
};

/**
 * 物理机重启：
 * 1. 已经纳管： 开机状态，开机中状态，关机中状态
 * 2. 未纳管 或者 未知：就绪状态 已连接
 * 3. 多台操作不支持管理节点host
 */
const validPowerReboot = async (
  current: IHost,
  source?: any,
  selectedList?: IHost[],
) => {
  const normalCond =
    [
      HostIPMIPowerStatus.POWER_ON,
      HostIPMIPowerStatus.POWER_BOOTING,
      HostIPMIPowerStatus.POWER_SHUTDOWN,
    ].includes(current?.ipmiPowerStatus ?? -1) ||
    ([
      HostIPMIPowerStatus.UN_CONFIGURED,
      HostIPMIPowerStatus.POWER_UNKNOWN,
    ].includes(current?.ipmiPowerStatus ?? -1) &&
      current?.status === HostStatus.Connected);

  if (selectedList?.length && selectedList?.length > 1) {
    return (
      normalCond && current?.hostNodeInfo?.nodeType !== NodeType.ManagementNode
    );
  }
  return normalCond;
};

/**
 *  电源状态未知，IPMI未纳管
 */
const validUpdateIPMIInfo = async (current: IHost) => {
  return (
    // null === POWER_UNKNOWN
    !current?.ipmiPowerStatus ||
    [
      HostIPMIPowerStatus.UN_CONFIGURED,
      HostIPMIPowerStatus.POWER_UNKNOWN,
    ].includes(current?.ipmiPowerStatus)
  );
};

const validCreateVm = (selectedList: IHost[]) => {
  if (
    selectedList?.[0]?.state === HostState.Disabled ||
    selectedList?.[0]?.status === HostStatus.Disconnected
  ) {
    return false;
  }
  return true;
};

const validTerminal = (current: IHost) => {
  return current.status === HostStatus.Connected;
};

export {
  bindLabel,
  disabled,
  enabled,
  exitMaintenance,
  maintenance,
  many,
  one,
  reconnection,
  unboundLabel,
  validCreateVm,
  validPowerOff,
  validPowerOn,
  validPowerReboot,
  validUpdateIPMIInfo,
  verifyNotSelect,
  validTerminal,
};
