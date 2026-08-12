import type { PrimaryStorageType } from "@zstack/zsphere-types";
import type {
  Zone,
  Cluster,
  Host as IHost,
} from "@zstack/zsphere-types/graphql";

export type IZone = Pick<Zone, "uuid" | "name">;
export type ICluster = Pick<
  Cluster,
  "uuid" | "name" | "isHugePageMemoryCanOpen"
>;
export type ISubPrimaryStorageType = "ZCE" | "";

export interface IPrimaryStorageTypeContext {
  primaryStorageType: PrimaryStorageType;
  setPrimaryStorageType: (primaryStorageType: PrimaryStorageType) => void;
  subPrimaryStorageType: ISubPrimaryStorageType;
  setSubPrimaryStorageType: (
    subPrimaryStorageType: ISubPrimaryStorageType,
  ) => void;
}
export interface ISharedResourceDataContext {
  hostDataInTable: IHost[];
  setHostDataInTable: (hostDataInTable: IHost[]) => void;
  diskInfo: any[];
  setDiskInfo: (diskInfo: any[]) => void;
}
export interface IPrimaryStorageResourceContext {
  resource: any;
  setResource: (resource: any) => void;
  zone: IZone;
  setZone: (zone: IZone) => void;
  initCluster: ICluster;
  setInitCluster: (initCluster: ICluster) => void;
  selectedRowKeys: string[];
  setSelectedRowKeys: (selectedRowKeys: string[]) => void;
  cluster: ICluster[];
  setCluster: (cluster: ICluster[]) => void;
}
