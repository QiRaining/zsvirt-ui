import type { IRouterByAuth } from "../a-cloud-old-components/auth/type";

export interface IDetailNavPage {
  key: string;
  name: string;
  count?: number;
  page: React.ReactElement;
  showTitle?: boolean;
  auth?: IRouterByAuth;
}

export interface IPageGroup {
  key: string;
  name: string;
  children: IDetailNavPage[];
}

export interface IPageProps extends React.HTMLAttributes<HTMLDivElement> {
  pageList: IPageGroup[];
}
