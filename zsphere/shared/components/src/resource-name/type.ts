import { ReactElement, MouseEvent } from "react";

type Link = {
  microAppName: string;
  to: string;
  uuid?: string;
  leftnav?: string;
  navView?: string;
  zoneUuid?: string;
  from?: string;
  keepState?: boolean;
  onClick?: (e: MouseEvent) => void;
};
export interface IResourceNameProps {
  icon?: ReactElement;
  value?: string | boolean | ReactElement;
  className?: string;
  canModify?: boolean;
  copyable?: boolean;
  ellipsis?: boolean;
  link?: Link;
  isRouterManaged?: boolean;
}
