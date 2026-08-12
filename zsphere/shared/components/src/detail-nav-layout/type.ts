import React from "react";

import { IRouterByAuth } from "../a-cloud-old-components/auth/type";

export interface IDetailNavLayoutPage {
  key: string;
  name: string | React.ReactNode;
  count?: number;
  page: React.ReactElement;
  showTitle?: boolean;
  actions?: React.ReactElement;
  auth?: IRouterByAuth;
  className?: string;
}

export interface IDetailNavLayout extends React.HTMLAttributes<HTMLDivElement> {
  pageList: IDetailNavLayoutPage[];
  className?: string;
  cacheConfig?: {
    contentId: string;
  };
}
