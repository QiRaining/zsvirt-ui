import { ActionTaskResult, Identity, CCSCertificate } from "../graphql";
import { Op } from "./enum";

export interface CurrentUser {
  username: string;
  sessionId: string;
  userUuid: string;
  accountUuid: string;
  currentIdentity: Identity;
  ccsCertificate?: CCSCertificate;
  IAM1: {
    systemRoles: Array<{ name: string; uuid: string }>;
    customRoles: Array<{ name: string; uuid: string }>;
    customUIPrivilege: string;
  };
}

// resource 子应用 目录树部分
export enum LeftNavType {
  ClusterHost = "virtualization.cluster.host",
  Network = "virtualization.network",
  TemplateVm = "virtualization.template.vm",
  DataStorage = "virtualization.data.storage",
  BareMetal = "virtualization.bare.metal",
}

export enum NavView {
  Group = "group",
  Resource = "resource",
  Template = "template",
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

export interface ICommonHelper {
  authKey?: string;
  search?: string;
  text?: React.ReactNode;
  linkText?:
    | React.ReactNode
    | ((data: { go: Function }) => React.ReactNode)
    | false;
  injectRouteStateBackMark?: boolean;
  defaultQuery?: IQuery;
}

export type IHelper =
  | ICommonHelper
  | (ICommonHelper & {
      microAppName: string;
      to: string;
      cacheKey: string;
    });

export type IMenuTab = {
  key: string;
  name?: string;
  i18n?: {
    id: string;
    defaultMessage: string;
  };
};

export interface IMenu {
  _id?: string;
  source?: "system" | "vendor";
  name: string;
  enName?: string;
  key: string;
  menuKey?: string;
  description?: string;
  i18nKey?: string;
  prevKey: string;
  nextKey: string;
  parentKey: string;
  iconKey?: string;
  iconPath?: string;
  showType?: "page" | "catalog";
  target?: "_blank" | "iframe" | "app" | "page";
  url?: string;
  path?: string;
  resourceType?: string | string[];
  isTab?: boolean;
  tokenReg?: string;
  privilege?: "admin" | "all";
  visible?: boolean;
  children?: IMenu[];
  tabs?: IMenuTab[];
}

export interface Condition {
  key: string;
  value?: string | number | boolean;
  values?: (string | number | boolean)[];
  op?: Op;
}

export interface Item {
  [prop: string]: any;
}

export interface IQuery {
  start?: number;
  limit?: number;
  count?: boolean;
  groupBy?: string;
  replyWithCount?: boolean;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  fields?: string[];
  conditions?: Condition[];
  type?: string;
  extraConditions?: Condition[];
}

// 联合类型为 string
export type IListView = "main" | "sub" | "select" | "recycle" | string;

export type IListProps<T extends Item, U extends Item = Item> = {
  defaultQuery?: IQuery;
  selectType?: "checkbox" | "radio";
  columnKeys?: Array<keyof T>;
  source?: U;
  value?: Array<T>;
  onChange?: (newValue: Array<T>) => void;
  onFetchChange?: (params: { list: Array<T>; total: number }) => void;
  renderAction?: (
    params: {
      node: React.ReactNode;
      current: T;
    } & Pick<
      IActionProps<T>,
      | "view"
      | "position"
      | "selectedList"
      | "source"
      | "refetch"
      | "setSelectedList"
    >,
  ) => React.ReactNode;
  view: IListView;
  helper?: Partial<IHelper>;
  hideHelper?: boolean;
  skip?: boolean;
  clickRowToggleSelected?: boolean;
  onClear?: () => void;
  className?: string;
  showClear?: boolean;
  customView?: string;
  customRefresh?: number;
  useActionConfig?: any;
  useColumnConfig?: any;
  useQueryConfig?: any;
};

export interface IToolbarProps<T, U extends Item = Item> {
  view: IListView;
  query: IQuery;
  setQuery: (newQuery: IQuery) => void;
  refetch: any;
  source?: U;
  selectedList: T[];
  setSelectedList?: (selectedList: T[]) => void;
}

export interface ISearchProps {
  container: React.RefObject<HTMLElement>;
  query: IQuery;
  setQuery: (newQuery: IQuery) => void;
}

export interface IActionProps<T, U extends Item = Item> {
  view: IListView;
  selectedList: Array<T>;
  originSelectedList?: Array<T>;
  setSelectedList?: (selectedList: T[]) => void;
  position: "toolbar" | "row" | "header" | "directory";
  refetch?: Function;
  source?: U;
  activeKeys?: string[] | false;
  extraKeys?: string[] | false;
}

export interface IActionRef {
  reVerify: () => void;
}

export interface IActionWrapperProps<T, U extends Item = Item> extends Pick<
  IActionProps<T, U>,
  | "view"
  | "selectedList"
  | "originSelectedList"
  | "setSelectedList"
  | "refetch"
  | "source"
  | "position"
> {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  reVerify?: () => void;
}

export enum FormCreateType {
  Normal,
  VisualizationEditor,
}

export interface IActionSubscribe {
  resourceTypeList?: string[];
  onProgress?: (result: ActionTaskResult, isCurrentWindow?: boolean) => void;
  onFinish?: (type: string, isCurrentWindow?: boolean) => void;
  onlyCurrentWindow?: boolean;
}

export enum LicenseModuleNameType {
  ProjectManagement = "project-management",
  Vmware = "vmware",
  DisasterRecovery = "disaster-recovery",
  Baremetal = "baremetal",
  V2v = "v2v",
  Service5x8 = "service-5x8",
  Service7x24 = "service-7x24",
  Arm64 = "arm64",
  Service = "service",
  ElasticBaremetal = "elastic-baremetal",
  Hybrid = "hybrid",
  SRIOV = "sriov-ui",
  Cdp = "cdp",
  GPU = "gpu-ui",
  Billing = "billing-ui",
  CloudFormation = "cloud-formation-ui",
  AutoScaling = "auto-scaling-ui",
  SmartNic = "smart-nic-ui",
  CryptoCompliance = "crypto-compliance",
  SecurityElementUi = "security-element-ui",
  ZStoneRBD = "ZStone.RBD",
  ZStoneRGW = "ZStone.RGW",
  ZStoneProd = "ThirdPartyStorage.Prod",
}

export enum LicenseDescType {
  DisasterRecovery = "disaster-recovery",
  Baremetal = "baremetal",
  V2v = "v2v",
  Service5x8 = "service-5x8",
  Service7x24 = "service-7x24",
  Arm64 = "arm64",
  Service = "service",
  ElasticBaremetal = "elastic-baremetal",
  Hybrid = "hybrid",
  SRIOV = "sriov-ui",
  Cdp = "cdp",
  GPU = "gpu-ui",
  CloudFormation = "cloud-formation-ui",
  AutoScaling = "auto-scaling-ui",
  SmartNic = "smart-nic-ui",
  CryptoCompliance = "crypto-compliance",
  ZStoneRBD = "ZStone.RBD",
  ZStoneRGW = "ZStone.RGW",
  SecurityElementUi = "security-element-ui",
  ZStoneProd = "ThirdPartyStorage.Prod",
}

export * from "./enum";
