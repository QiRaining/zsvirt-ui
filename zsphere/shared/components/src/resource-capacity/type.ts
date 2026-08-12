import { IResourceCapacity } from "../a-cloud-old-components/resource-capacity/type";

type IResourceType = "cpu" | "memory" | "storage";

export interface ITitleProps {
  type: IResourceType;
}

interface IBaseProps {
  title?: IResourceCapacity["title"];
  resourceType: IResourceType;
  usedNum?: number;
  availableNum?: number;
  reservedNum?: number;
  totalNum?: number;
  loading?: boolean;
  isEmpty?: boolean;
}

export interface IPercentageProps extends IBaseProps {
  isPhysical?: boolean;
  resourceCategory?: string;
  extra?: string | React.ReactNode;
}

export interface IRatioProps extends IBaseProps {
  overTotalNum?: number;
  systemUsedNum?: number;
  snapshotNum?: number;
  imageNum?: number;
  migrationNum?: number;
  vmTemplateCacheNum?: number;
  diskNum?: number;
  overProvisioning?: number;
}

export interface IDistributionProps extends IBaseProps {
  overTotalNum?: number;
  systemUsedNum?: number;
  snapshotNum?: number;
  imageNum?: number;
  migrationNum?: number;
  diskNum?: number;
  vmTemplateCacheNum?: number;
  overProvisioning?: number;
  isLocal?: boolean;
}

export interface IRuleProps {
  showCPU?: boolean;
  showMemory?: boolean;
  showStorage?: boolean;
}

export interface ICardProps {
  title: React.ReactNode;
  children?: React.ReactNode;
}
