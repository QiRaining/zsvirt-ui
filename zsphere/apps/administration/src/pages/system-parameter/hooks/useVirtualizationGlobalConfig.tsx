import { gql, useLazyQuery } from "@apollo/client";
import { useGlobalConfig } from "@zstack/zsphere-engine/src/global-config";
import { Op } from "@zstack/zsphere-types";
import type { GlobalConfig } from "@zstack/zsphere-types/graphql";
import * as _ from "lodash-es";
import { useCallback, useEffect, useMemo } from "react";

import { useFormatFunction } from "../utils/useFormatFunction";
import { useTranslateValue } from "../utils/useTranslateValue";
import { useValidator } from "../utils/useValidator";

const globalConfigList = gql`
  query globalConfigList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $extraConditions: [Condition!]
    $type: GlobalConfigQueryType
    $sortBy: String
  ) {
    globalConfigList(
      start: $start
      limit: $limit
      replyWithCount: true
      conditions: $conditions
      extraConditions: $extraConditions
      type: $type
      sortBy: $sortBy
    ) {
      total
      list {
        category
        defaultValue
        description
        name
        value
        uuid
      }
    }
  }
`;

/**
 * Splits each string in the array based on the first dot separator.
 * The segment before the dot goes into the nameList and the segment after goes into the categoryList.
 * Both lists will contain unique values only.
 *
 * @param {string[]} strs - The array of strings to be processed.
 * @returns {object} An object with two properties: nameList and categoryList.
 */
const splitAndCategorize = (
  strs: string[],
): { nameList: string[]; categoryList: string[] } => {
  const accumulator = {
    nameList: new Set<string>(),
    categoryList: new Set<string>(),
  };

  for (const str of strs) {
    const [category, ...name] = _.split(str, ".");

    if (category && name.length) {
      accumulator.categoryList.add(category);
      accumulator.nameList.add(_.join(name, "."));
    }
  }

  return {
    nameList: [...accumulator.nameList],
    categoryList: [...accumulator.categoryList],
  };
};

export const useVirtualizationGlobalConfig = (
  globalConfigsFromArgs?: any[],
) => {
  const globalConfigsFromEngine = useGlobalConfig();
  const genTranslateFn = useTranslateValue();
  const genFormatFn = useFormatFunction();
  const genValidatorFn = useValidator();

  const globalConfigs = globalConfigsFromArgs || globalConfigsFromEngine;

  const keys = _.reduce(
    globalConfigs,
    (arr, globalConfig) => {
      const key = globalConfig?.key;
      if (_.includes(key, "virtualization.")) {
        const _key = _.replace(key, "virtualization.", "");
        arr.push(_key);
      }
      return arr;
    },
    [] as string[],
  );

  const result = splitAndCategorize(keys);

  const [getGlobalConfigList, { data }] = useLazyQuery(globalConfigList, {
    variables: {
      conditions: [
        {
          key: "name",
          op: Op.in,
          values: result?.nameList || [],
        },
        {
          key: "category",
          op: Op.in,
          values: result?.categoryList || [],
        },
      ],
    },
    fetchPolicy: "cache-first",
  });

  const defaultQuery = useMemo(() => {
    const conditions =
      result?.nameList?.length && result?.categoryList?.length
        ? [
            {
              key: "name",
              op: Op.in,
              values: result?.nameList || [],
            },
            {
              key: "category",
              op: Op.in,
              values: result?.categoryList || [],
            },
          ]
        : [];

    return {
      conditions,
    };
  }, [result?.nameList?.length]);

  useEffect(() => {
    getGlobalConfigList({
      variables: defaultQuery,
      fetchPolicy: "cache-first",
    });
  }, [defaultQuery]);

  const refetchGlobalConfig = useCallback(() => {
    getGlobalConfigList({
      variables: defaultQuery,
      fetchPolicy: "network-only",
    });
  }, [defaultQuery, getGlobalConfigList]);

  const globalConfigValueMap: { [key: string]: GlobalConfig } = useMemo(() => {
    return _.reduce(
      _.get(data, ["globalConfigList", "list"], []) || [],
      (obj, globalConfig) => {
        obj[`${globalConfig.category}.${globalConfig.name}`] = globalConfig;

        return obj;
      },
      {} as { [key: string]: GlobalConfig },
    );
  }, [data]);

  const { basicGlobalConfigs, advancedGlobalConfigs, allGlobalConfig } =
    useMemo(() => {
      const _basicGlobalConfigs = [];
      const _advancedGlobalConfigs = [];
      let _allGlobalConfig = [];

      for (const globalConfig of globalConfigs) {
        const formItem = _.cloneDeep(globalConfig.formItem);

        if (formItem?.formatFunction) {
          formItem.formatFunction = _.get(
            genFormatFn,
            formItem?.formatFunction,
          );
        }
        if (formItem?.translateValue) {
          formItem.translateValue = _.get(
            genTranslateFn,
            formItem?.translateValue,
          );
        }
        if (formItem?.validatorName) {
          _.set(formItem, "rules", [
            {
              validator: _.get(genValidatorFn, formItem?.validatorName),
            },
          ]);
        }

        if (_.isEqual(globalConfig.categoryType, "Basic")) {
          _basicGlobalConfigs.push({
            ...globalConfig,
            formItem,
          });
        }

        if (_.isEqual(globalConfig.categoryType, "Advanced")) {
          _advancedGlobalConfigs.push({
            ...globalConfig,
            formItem,
          });
        }
      }

      _allGlobalConfig = _.concat(_basicGlobalConfigs, _advancedGlobalConfigs);

      return {
        basicGlobalConfigs: _basicGlobalConfigs,
        advancedGlobalConfigs: _advancedGlobalConfigs,
        allGlobalConfig: _allGlobalConfig,
      };
    }, [globalConfigs, globalConfigValueMap]);

  return {
    basicGlobalConfigs,
    advancedGlobalConfigs,
    allGlobalConfig,
    globalConfigValueMap,
    refetchGlobalConfig,
  };
};

export default useVirtualizationGlobalConfig;
