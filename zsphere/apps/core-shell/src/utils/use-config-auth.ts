import { useQuery, gql } from "@apollo/client";
import { Op } from "@zstack/zsphere-types";
import type { GlobalConfig } from "@zstack/zsphere-types/graphql";
import { useCallback, useMemo } from "react";

const GLOBAL_CONFIG_LIST = gql`
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
        isValid
      }
    }
  }
`;

export const useConfigAuth = () => {
  const { data, loading } = useQuery(GLOBAL_CONFIG_LIST, {
    variables: {
      conditions: [
        { key: "category", op: Op.in, values: ["accessControl", "zwatch"] },
        {
          key: "name",
          op: Op.in,
          values: [
            "enable.request.source.ip.address.check",
            "thirdpartyAlert.enable",
          ],
        },
      ],
    },
  });
  const list: GlobalConfig[] = useMemo(
    () => data?.globalConfigList?.list ?? [],
    [data],
  );

  const getGlobalConfigValue = useCallback(
    (name: string, category: string) => {
      if (!list.length) {
        return true;
      }
      const config = list.find(
        (item) => item.name === name && item.category === category,
      );
      return config?.value;
    },
    [list],
  );

  const hasConfig = useCallback(
    (pathName: string) => {
      if (pathName.indexOf("/ip-blocklist-allowlist") > -1) {
        return (
          loading ||
          getGlobalConfigValue(
            "enable.request.source.ip.address.check",
            "accessControl",
          ) === "true"
        );
      }
      if (pathName.indexOf("/message-source") > -1) {
        return (
          loading ||
          getGlobalConfigValue("thirdpartyAlert.enable", "zwatch") === "true"
        );
      }
      return true;
    },
    [getGlobalConfigValue, loading],
  );

  return {
    hasConfig,
    configLoading: loading,
  };
};
