export const getZoneUuidBySource = (source: any) => {
  if (source?.__typename === "Zone") {
    return source.uuid ?? "";
  }
  if (source?.__typename === "Cluster") {
    return source?.zone?.uuid ?? "";
  }
  if (source?.__typename === "HostVO") {
    return source?.zone?.uuid ?? "";
  }
  if (source?.__typename === "PrimaryStorageVO") {
    return source?.zone?.uuid ?? "";
  }
  if (source?.__typename === "Image") {
    return source?.backupStorage?.zone?.uuid ?? "";
  }
  if (source?.__typename === "VmInstance") {
    return source?.zoneUuid ?? "";
  }
  if (source?.__typename === "VMGroupDirectory") {
    return source?.zoneUuid ?? "";
  }

  if (["VolumeSnapshotGroup", "VolumeSnapshot"].includes(source?.__typename)) {
    return (
      source?.volume?.vmInstance?.[0]?.zoneUuid ??
      source?.vmInstance?.zoneUuid ??
      ""
    );
  }

  if (source?.__typename === "VmTemplate") {
    return source?.vm?.zoneUuid ?? "";
  }

  if (source?.__typename === "BackupData") {
    return source?.vmInstance?.zoneUuid ?? "";
  }

  return "";
};
