import { gql } from "@apollo/client";
import type { ResourceQueryType } from "@zstack/zsphere-types";
import { VmQueryType } from "@zstack/zsphere-types";
import type { Rule } from "antd/es/form";
import _ from "lodash-es";

// 资源名唯一
const queryResourceList = gql`
  query vmInstanceList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $type: VmQueryType
    $extraConditions: [Condition!] = []
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    vmInstanceList(
      start: $start
      limit: $limit
      replyWithCount: true
      conditions: $conditions
      type: $type
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      list {
        name
        uuid
      }
      total
    }
  }
`;

export const validatorUniqName = (
  intl: any,
  resourceType: ResourceQueryType,
  originName?: string,
  message?: string,
  caseSensitive?: boolean,
) => {
  return {
    validator: async (__: Rule, value: any) => {
      if (!value) {
        return;
      }

      if (originName && originName === value) {
        return;
      }

      try {
        const res = await window.g_main.apolloClient.query({
          query: queryResourceList,
          variables: {
            type: VmQueryType.Normal,
            conditions: [
              {
                key: "name",
                value,
              },
            ],
          },
        });

        const isNameUnique = caseSensitive
          ? !_.some(_.get(res, ["data", "resourceList", "list"]), [
              "name",
              value,
            ])
          : res?.data?.resourceCount?.total === 0;

        if (!isNameUnique) {
          const errorMessage =
            message ??
            intl.formatMessage({
              id: "name.validate.should.be.uniq",
              defaultMessage: "The name cannot duplicate existing ones.",
            });
          return Promise.reject(errorMessage);
        }
      } catch (error) {
        console.error("Error occurred during name validation:", error);
        const errorMessage = "校验名称失败，请稍后再试";
        return Promise.reject(errorMessage);
      }

      return;
    },
  };
};
