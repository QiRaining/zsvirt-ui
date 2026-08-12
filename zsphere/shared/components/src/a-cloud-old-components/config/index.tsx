import { QueryHookOptions } from "@apollo/client";
import React from "react";
import { RawIntlProvider } from "react-intl";

import { ICustomTableOnChange } from "../table-list/base-type";
import {
  ITableListPaginationProps,
  ITableListSearchProps,
} from "../table-list/type";

export enum SearchVersion {
  // version1 对应老版本的Search 路径: ./search
  V1,
  // version2 对应新版本Search 路径: ./search-advanced ,默认开启V2 ，可以在 ConfigContext 配置
  V2,
}

export interface ConfigProps {
  constant?: {
    constantMap?: Map<string, any>;
    constantGroupMap?: Map<string, any>;
  };
  RawIntlProvider?: typeof RawIntlProvider;
  auth?: {
    disabled?: boolean;
  };
  leftNav?: {
    showAppIcon?: boolean;
  };
  // 也支持在 tablelist 配置，属性需要考虑业务代码
  tableList?: {
    tableProps?: {
      onChange: (args: ICustomTableOnChange) => void;
    };
    paginationProps?: ITableListPaginationProps;
    searchProps?: ITableListSearchProps;
    apolloQueryOptions?: QueryHookOptions;
    resultMapper?: (result: any) => any;
    searchVersion?: SearchVersion;
  };

  // 是否是ZSTACK UI
  isZStack?: boolean;
  children?: React.ReactNode;
}

export const ConfigContext = React.createContext<ConfigProps>({
  isZStack: true,
});

const ConfigProvider: React.FC<ConfigProps> & {
  ConfigContext: typeof ConfigContext;
} = (props) => {
  const { children, ...config } = props;

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
};

ConfigProvider.ConfigContext = ConfigContext;

export default ConfigProvider;
