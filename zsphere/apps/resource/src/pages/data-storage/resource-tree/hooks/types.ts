import type { IconTypes } from "@zstack/icon";
import type {
  TreeResourceType,
  VirtualizationDirDataNode,
} from "@zstack/zsphere-types";

export interface TreeNodeOptions {
  parentUuid?: string;
  hideIcon?: boolean;
  icon?: IconTypes;
  isLeaf?: boolean;
  children?: VirtualizationDirDataNode[];
}

export interface IResourceType {
  uuid?: string;
  resource?: TreeResourceType;
}

export interface ITreeStatus {
  expandedKeys: any[];
  selectedKey: string;
  selectedResource: string;
}
