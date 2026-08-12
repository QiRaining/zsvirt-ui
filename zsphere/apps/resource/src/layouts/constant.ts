export const actionList = ["add", "delete", "update"];

export const DEFAULT_LEFT_NAV_KEY = "leftnav";

export const DEFAULT_NAV_VIEW = "navView";

export type TreeResourceType =
  | "root-node"
  | "zone"
  | "cluster"
  | "host"
  | "vm"
  | "primary-storage"
  | "l2-network"
  | "l3-network"
  | "backup-storage"
  | "image"
  | "directory"
  | "iscsi-server"
  | "iscsi-iqn"
  | "iscsi-lun"
  | "fiber-channel-storage"
  | "fiber-channel-lun"
  | "nvme-server"
  | "nvme-nqn"
  | "nvme-lun"
  | "baremetal-cluster"
  | "baremetal-chassis"
  | "baremetal-instance";

export enum LeftNavType {
  ClusterHost = "virtualization.cluster.host",
  Network = "virtualization.network",
  TemplateVm = "virtualization.template.vm",
  DataStorage = "virtualization.data.storage",
  BareMetal = "virtualization.bare.metal",
}

export enum TopTabType {
  IscsiServer = "virtualization.iscsi.server",
  FiberChannelStorage = "virtualization.fiber.channel.storage",
  NvmeServer = "virtualization.nvme.server",
}

export type NavigationType = LeftNavType | TopTabType;

export type ITreeStructure = {
  [key in NavigationType]: TreeResourceType[];
};

export const TREE_STRUCTURE: ITreeStructure = {
  [LeftNavType.ClusterHost]: ["root-node", "zone", "cluster", "host", "vm"],
  [LeftNavType.DataStorage]: ["root-node", "zone", "primary-storage"],
  [LeftNavType.Network]: ["root-node", "zone", "l2-network", "l3-network"],
  [LeftNavType.TemplateVm]: ["root-node", "zone", "backup-storage", "image"],
  [LeftNavType.BareMetal]: [
    "root-node",
    "zone",
    "baremetal-cluster",
    "baremetal-chassis",
    "baremetal-instance",
  ],
  [TopTabType.IscsiServer]: ["iscsi-server", "iscsi-iqn", "iscsi-lun"],
  [TopTabType.FiberChannelStorage]: [
    "fiber-channel-storage",
    "fiber-channel-lun",
  ],
  [TopTabType.NvmeServer]: ["nvme-server", "nvme-nqn", "nvme-lun"],
};

export enum VirRscTreeType {
  ClusterHost = "virtualization.cluster.host",
  Network = "virtualization.network",
  TemplateVm = "virtualization.template.vm", //模板镜像
  DataStorage = "virtualization.data.storage",
  Directory = "virtualization.directory",
  VmTemplate = "virtualization.vm.template", //虚拟机模板，这个名字起的会与上面的“TemplateVm”有些相像，修改bug时不要改错了
  BareMetal = "virtualization.bare.metal", //裸金属
}

export enum NavView {
  Group = "group",
  Resource = "resource",
  Template = "template",
}

export interface NodeAttribute {
  type: string;
  value: string;
}

export interface VirtualizationDirDataNode {
  title: string;
  titleNode?: React.ReactNode;
  name?: string;
  key: string;
  iconType?: string;
  isLeaf?: boolean;
  resourceType?: TreeResourceType;
  attr?: any;
  parentUuid?: string | React.Key;
  children?: VirtualizationDirDataNode[];
  loadStatus?: boolean;
  extraAttrib?: NodeAttribute[];
}

export interface TreeInfo {
  treeData: VirtualizationDirDataNode[];
  expandableKeySet: Set<string>;
  defaultExpandedKeys: Set<string>;
  selectionInfo: {
    selectedKey: string | null | undefined;
    treeHasSelectedKey: boolean;
  };
}
