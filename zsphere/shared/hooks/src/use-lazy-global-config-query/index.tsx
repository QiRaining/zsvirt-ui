import { useLazyQuery, gql } from "@apollo/client";
import { Op } from "@zstack/zsphere-types";
import type { GlobalConfigList } from "@zstack/zsphere-types/graphql";
import { uniq, compact, reduce } from "lodash-es";
import React from "react";

const GLOBAL_CONFIG_LIST = gql`
  query globalConfigList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $extraConditions: [Condition!]
    $type: GlobalConfigQueryType
    $sortBy: String
    $includeUiConfig: Boolean
  ) {
    globalConfigList(
      start: $start
      limit: $limit
      replyWithCount: true
      conditions: $conditions
      extraConditions: $extraConditions
      type: $type
      sortBy: $sortBy
      includeUiConfig: $includeUiConfig
    ) {
      total
      list {
        category
        defaultValue
        description
        name
        value
        uuid
        isValid
      }
    }
  }
`;

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
    categoryList: uniq(categoryList),
    nameList: uniq(nameList),
  };
};

export const buildGlobalConfigListQueryVariables = (
  globalConfigs: globalConfigConfigList,
  includeUiConfig = true,
) => {
  const { categoryList, nameList } =
    getCategoryListAndNameListByGlobalConfig(globalConfigs);

  return {
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
    includeUiConfig,
  };
};

export const useLazyGlobalConfigQuery = (
  globalConfigs: globalConfigConfigList,
  options?: {
    autoQuery: boolean;
    ui: boolean;
    linkStr: string;
    includeUiConfig?: boolean;
  },
) => {
  const {
    autoQuery = false,
    ui = false,
    linkStr = "-",
    includeUiConfig = true,
  } = options ?? {};

  const defaultQuery = buildGlobalConfigListQueryVariables(
    globalConfigs,
    includeUiConfig,
  );

  const [query, { data, refetch }] = useLazyQuery<{
    globalConfigList: GlobalConfigList;
  }>(GLOBAL_CONFIG_LIST, {
    variables: defaultQuery,
  });

  const { list, listMap } = React.useMemo(() => {
    const _list = compact(data?.globalConfigList?.list).filter((it) =>
      ui ? true : it.category !== "ui",
    );

    const _listMap = reduce(
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
