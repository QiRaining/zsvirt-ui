import React, { useMemo } from "react";

import {
  PrimaryStorageTypeContext,
  SharedResourceDataContext,
  PrimaryStorageResourceContext,
} from "../contexts/storageContexts";
import { usePrimaryStorageState } from "../hooks/usePrimaryStorageState";
import type {
  IPrimaryStorageResourceContext,
  IPrimaryStorageTypeContext,
  ISharedResourceDataContext,
} from "../type";

export function PrimaryStorageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    resource,
    setResource,
    zone,
    setZone,
    initCluster,
    setInitCluster,
    selectedRowKeys,
    setSelectedRowKeys,
    hostDataInTable,
    setHostDataInTable,
    cluster,
    setCluster,
    diskInfo,
    setDiskInfo,
    primaryStorageType,
    setPrimaryStorageType,
    subPrimaryStorageType,
    setSubPrimaryStorageType,
  } = usePrimaryStorageState();

  const typeContextValue: IPrimaryStorageTypeContext = useMemo(
    () => ({
      primaryStorageType: primaryStorageType,
      setPrimaryStorageType: setPrimaryStorageType,
      subPrimaryStorageType: subPrimaryStorageType,
      setSubPrimaryStorageType: setSubPrimaryStorageType,
    }),
    [primaryStorageType, subPrimaryStorageType],
  );

  const sharedDataContextValue: ISharedResourceDataContext = useMemo(
    () => ({
      hostDataInTable: hostDataInTable,
      setHostDataInTable: setHostDataInTable,
      diskInfo: diskInfo,
      setDiskInfo: setDiskInfo,
    }),
    [hostDataInTable, diskInfo],
  );

  const resourceContextValue: IPrimaryStorageResourceContext = useMemo(
    () => ({
      zone: zone,
      setZone: setZone,
      initCluster: initCluster,
      setInitCluster: setInitCluster,
      resource: resource,
      setResource: setResource,
      cluster: cluster,
      setCluster: setCluster,
      selectedRowKeys: selectedRowKeys,
      setSelectedRowKeys: setSelectedRowKeys,
    }),
    [zone, initCluster, resource, cluster, selectedRowKeys],
  );

  return (
    <SharedResourceDataContext.Provider value={sharedDataContextValue}>
      <PrimaryStorageTypeContext.Provider value={typeContextValue}>
        <PrimaryStorageResourceContext.Provider value={resourceContextValue}>
          {children}
        </PrimaryStorageResourceContext.Provider>
      </PrimaryStorageTypeContext.Provider>
    </SharedResourceDataContext.Provider>
  );
}
