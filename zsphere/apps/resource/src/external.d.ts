// MF Remote Module declarations for zsv_baremetal consumed by resource

declare module "zsv_baremetal/baremetal-chassis/list" {
  const BareMetalChassisList: React.ComponentType<any>;
  export default BareMetalChassisList;
}

declare module "zsv_baremetal/baremetal-cluster/list" {
  const BareMetalClusterList: React.ComponentType<any>;
  export default BareMetalClusterList;
}

declare module "zsv_baremetal/baremetal-cluster/action/create-modal" {
  const CreateBaremetalCluster: React.ComponentType<any>;
  export default CreateBaremetalCluster;
}

declare module "zsv_baremetal/baremetal-cluster/action/attach-l2-network" {
  const AttachL2NetworkModal: React.ComponentType<any>;
  export default AttachL2NetworkModal;
}

declare module "zsv_baremetal/baremetal-instance/list" {
  const BareMetalInstanceList: React.ComponentType<any>;
  export default BareMetalInstanceList;
}

declare module "zsv_baremetal/baremetal-pre-config-template/list" {
  const PreconfigurationTemplateList: React.ComponentType<any>;
  export default PreconfigurationTemplateList;
}

declare module "zsv_baremetal/baremetal-chassis/config" {
  export function useActionConfig(): any;
}

declare module "zsv_baremetal/baremetal-cluster/config" {
  export function useActionConfig(): any;
}

declare module "zsv_baremetal/baremetal-instance/config" {
  export function useActionConfig(): any;
}

declare module "zsv_baremetal/action-config-bridge" {
  interface BaremetalActionConfigBridgeProps {
    onConfigReady: (configs: {
      "baremetal-chassis": any;
      "baremetal-cluster": any;
      "baremetal-instance": any;
    }) => void;
  }
  const BaremetalActionConfigBridge: React.ComponentType<BaremetalActionConfigBridgeProps>;
  export default BaremetalActionConfigBridge;
}
