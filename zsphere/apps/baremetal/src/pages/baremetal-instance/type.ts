import type {
  L3Network as IL3Network,
  BaremetalChassis as IBaremetalChassis,
} from "@zstack/zsphere-types/graphql";

export enum IDeviceType {
  Nic = "Nic",
  NicBond = "NicBond",
}

export enum IAddNetWorkType {
  Single = "Single",
  Batch = "Batch",
}

export interface INicConfig {
  nic: string;
  l3Network: IL3Network[];
  ip: string;
  setStaticIp?: boolean;
}

export interface IBondConfig {
  name: string;
  mode: string[];
  nic: string[];
  l3Network: IL3Network[];
  setStaticIp?: boolean;
  ip: string;
}

export interface INetworkConfig {
  type: IDeviceType;
  nicConfig?: INicConfig;
  bondConfig?: IBondConfig;
}

export interface IAllNics {
  chassisUuid: string;
  devname: string;
  mac: string;
  value: string;
  label: string;
}

export interface IInstanceConfig {
  uuid: string;
  displayName: string;
  username: string;
  password: string;
  networkConfigs: INetworkConfig[];
  customConfigurations: any[];
  usedNics: string[];
  distribution: string;
  chassic: IBaremetalChassis;
}
