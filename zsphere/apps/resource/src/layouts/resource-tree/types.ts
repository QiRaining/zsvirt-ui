import React from "react";

export enum LeftNavType {
  ClusterHost = "virtualization.cluster.host",
  Network = "virtualization.network",
  TemplateVm = "virtualization.template.vm",
  DataStorage = "virtualization.data.storage",
  BareMetal = "virtualization.bare.metal",
  //VmTemplate = 'virtualization.vm.template'
}

export enum VirRscTreeType {
  ClusterHost = "virtualization.cluster.host",
  Network = "virtualization.network",
  TemplateVm = "virtualization.template.vm", //模板镜像
  DataStorage = "virtualization.data.storage",
  Directory = "virtualization.directory",
  VmTemplate = "virtualization.vm.template", //虚拟机模板，这个名字起的会与上面的“TemplateVm”有些相像，修改bug时不要改错了
  BareMetal = "virtualization.bare.metal", //裸金属
}

export const TREE_STRUCTURE = {
  [VirRscTreeType.ClusterHost]: ["root-node", "zone", "cluster", "host", "vm"],
  [VirRscTreeType.DataStorage]: ["root-node", "zone", "primary-storage"],
  [VirRscTreeType.Network]: ["root-node", "zone", "l2-network", "l3-network"],
  [VirRscTreeType.TemplateVm]: ["root-node", "zone", "backup-storage", "image"],
  [VirRscTreeType.Directory]: ["root-node", "zone", "directory", "vm"],
  [VirRscTreeType.VmTemplate]: ["root-node", "zone", "vm-template"],
  [VirRscTreeType.BareMetal]: [
    "root-node",
    "zone",
    "cluster",
    "bm-chassis",
    "bm-instance",
  ],
};

export enum NavView {
  Group = "group",
  Resource = "resource",
  Template = "template",
}

export type TreeResourceType =
  | "root-node"
  | "zone"
  | "cluster"
  | "host"
  | "vm"
  | "primary-storage"
  | "iscsi-server"
  | "iscsi-iqn"
  | "iscsi-lun"
  | "fiber-channel-lun"
  | "nvme-lun"
  | "l2-network"
  | "l3-network"
  | "security-group"
  | "backup-storage"
  | "image"
  | "directory"
  | "vm-template"
  | "baremetal-chassis"
  | "baremetal-instance"
  | "baremetal-cluster";

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
