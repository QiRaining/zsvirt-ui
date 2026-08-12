import { useLazyQuery } from "@apollo/client";
import { Op } from "@zstack/zsphere-types";
import type { GlobalConfigList } from "@zstack/zsphere-types/graphql";
import _ from "lodash-es";
import React from "react";

import { globalConfigList } from "../../../gql/global-config.gql";

export type globalConfigConfigList = Array<{
  category: string;
  name: string;
}>;
export const getCategoryListAndNameListByGlobalConfig = (
  globalConfigs: globalConfigConfigList,
) => {
  const categoryList: string[] = [];
  const nameList: string[] = [];

  globalConfigs.forEach((it) => {
    categoryList.push(it.category);
    nameList.push(it.name);
  });

  return {
    categoryList: _.uniq(categoryList),
    nameList: _.uniq(nameList),
  };
};

export const useLazyGlobalConfigQuery = (
  globalConfigs: globalConfigConfigList,
  options?: {
    autoQuery: boolean;
    ui: boolean;
    linkStr: string;
  },
) => {
  const { autoQuery = false, ui = false, linkStr = "-" } = options ?? {};

  const { categoryList, nameList } =
    getCategoryListAndNameListByGlobalConfig(globalConfigs);

  const defaultQuery = {
    conditions: [
      {
        key: "category",
        values: categoryList,
        op: Op.in,
      },
      {
        key: "name",
        values: nameList,
        op: Op.in,
      },
    ],
  };

  const [query, { data, refetch }] = useLazyQuery<{
    globalConfigList: GlobalConfigList;
  }>(globalConfigList, {
    variables: defaultQuery,
  });

  const { list, listMap } = React.useMemo(() => {
    const _list = _.compact(data?.globalConfigList?.list).filter((it) =>
      ui ? true : it.category !== "ui",
    );

    const _listMap = _.reduce(
      _list,
      (obj, curr) => {
        const { category, name } = curr;
        const key = [category, name].join(linkStr);

        if (!obj[key]) {
          obj[key] = curr;
        }

        return obj;
      },
      {} as any,
    );

    return {
      list: _list,
      listMap: _listMap,
    };
  }, [data, linkStr, ui]);

  React.useEffect(() => {
    if (autoQuery) {
      query();
    }
  }, [autoQuery, query]);

  return {
    queryGlobalConfig: query,
    refetchGlobalConfig: refetch,
    globalConfigData: list,
    globalConfigDataMap: listMap,
  };
};
