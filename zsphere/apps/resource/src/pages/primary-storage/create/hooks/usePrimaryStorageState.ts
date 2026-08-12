import { PrimaryStorageType } from "@zstack/zsphere-types";
import type {
  Cluster as ICluster,
  Host as IHost,
} from "@zstack/zsphere-types/graphql";
import { useState } from "react";

import type { ISubPrimaryStorageType, IZone } from "../type";

export function usePrimaryStorageState() {
  const [resource, setResource] = useState<any>({});
  const [zone, setZone] = useState<IZone>({ uuid: "", name: "" });
  const [initCluster, setInitCluster] = useState<ICluster>({
    uuid: "",
    name: "",
    isHugePageMemoryCanOpen: false,
  } as ICluster);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [hostDataInTable, setHostDataInTable] = useState<IHost[]>([]);
  const [cluster, setCluster] = useState<ICluster[]>([]);
  const [diskInfo, setDiskInfo] = useState<any[]>([]);
  const [primaryStorageType, setPrimaryStorageType] =
    useState<PrimaryStorageType>(PrimaryStorageType.LocalStorage);
  const [subPrimaryStorageType, setSubPrimaryStorageType] =
    useState<ISubPrimaryStorageType>("ZCE");

  return {
    // Resource related
    resource,
    setResource,
    zone,
    setZone,
    initCluster,
    setInitCluster,
    cluster,
    setCluster,
    selectedRowKeys,
    setSelectedRowKeys,

    // Type related
    primaryStorageType,
    setPrimaryStorageType,
    subPrimaryStorageType,
    setSubPrimaryStorageType,

    // Shared data related
    hostDataInTable,
    setHostDataInTable,
    diskInfo,
    setDiskInfo,
  };
}
