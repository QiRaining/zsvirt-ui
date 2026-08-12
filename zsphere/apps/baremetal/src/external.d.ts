// MF Remote Module declarations for zsv-baremetal

declare module "zsv_resource/l2-network/list" {
  const L2NetworkList: React.ComponentType<any>;
  export default L2NetworkList;
}

declare module "zsv_resource/l2-network/create" {
  const CreateL2Network: React.ComponentType<any>;
  export default CreateL2Network;
}

declare module "zsv_resource/l2-network/action/detach-cluster-in-sub" {
  const DetachClusterInSub: React.ComponentType<any>;
  export default DetachClusterInSub;
}

declare module "zsv_resource/l3-network/list" {
  const L3NetworkList: React.ComponentType<any>;
  export default L3NetworkList;
}

declare module "zsv_resource/image/list" {
  const ImageList: React.ComponentType<any>;
  export default ImageList;
}

declare module "zsv_resource/vm/action/tag" {
  const TagAction: React.ComponentType<any>;
  export default TagAction;
}

declare module "zsv_auditing/auditing-sub-list" {
  const AuditList: React.ComponentType<any>;
  export default AuditList;
}

declare module "zsv_shared/zwatch-alarm/alarm-tab" {
  const ZWatchAlarmInDetailTab: React.ComponentType<any>;
  export default ZWatchAlarmInDetailTab;
}
