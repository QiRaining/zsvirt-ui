import { gql, useLazyQuery } from "@apollo/client";
import { Op } from "@zstack/zsphere-types";
import { FuzzyQueryResponse } from "@zstack/zsphere-types/graphql";
import { uniqBy } from "lodash-es";
import { useEffect, useState, useCallback, useRef } from "react";
import { useIntl } from "react-intl";

import { IQueryProps } from "./index";
import { ICandidate } from "./types";

const FUZZY_QUERY = gql`
  query fuzzyQuery(
    $resourceType: String!
    $resourceConditions: [Condition!]!
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $type: String
  ) {
    fuzzyQuery(
      resourceType: $resourceType
      resourceConditions: $resourceConditions
      conditions: $conditions
      extraConditions: $extraConditions
      type: $type
    ) {
      conditionCount {
        key
        count
      }
    }
  }
`;

function escapeQueryString(value: string) {
  return value
    .replace(/\\/g, "\\\\\\")
    .replace(/_/g, "\\\\_")
    .replace(/%/g, "\\\\%");
}

export const useFuzzyConfig = (queryProps?: IQueryProps) => {
  const intl = useIntl();
  const [keywords, setKeywords] = useState("");
  const [options, setOptions] = useState<ICandidate["options"]>([]);
  const candidatesRef = useRef<ICandidate[]>();

  const [getList, { data, loading }] = useLazyQuery<{
    fuzzyQuery: FuzzyQueryResponse;
  }>(FUZZY_QUERY, { fetchPolicy: "no-cache" });

  useEffect(() => {
    if (data) {
      const conditionCount = data.fuzzyQuery.conditionCount || [];
      const newOptions: ICandidate["options"] = conditionCount
        .filter((item) => item.count > 0)
        .map((item) => {
          const originItem = candidatesRef.current?.find((c) =>
            [c.key, c.searchKey].includes(item.key),
          );
          return {
            key: item.key,
            label: originItem?.label || item.key,
            type: "input",
            extra: {
              keywords,
            },
          };
        });
      setOptions(newOptions);
    }
  }, [data, keywords]);

  const onSearch = useCallback(
    (value?: string) => {
      if (!value || !queryProps || !candidatesRef.current) {
        setOptions([]);
      } else {
        setKeywords(value);
        const queryString = escapeQueryString(value);
        let resourceConditions = candidatesRef.current.map((item) => {
          const key = item.searchKey || item.key;
          const op = Op.like;
          return {
            key,
            op,
            value: queryString,
          };
        });
        resourceConditions = uniqBy(resourceConditions, "key");
        const { defaultQuery, resourceType } = queryProps;
        getList({
          variables: {
            ...defaultQuery,
            resourceConditions,
            resourceType,
          },
        });
      }
    },
    [queryProps, getList],
  );

  const setFuzzyCandidates = (list: ICandidate[]) => {
    const result = list.filter((item) => item.type === "input");

    if (result.length > 0 && result.length !== candidatesRef.current?.length) {
      candidatesRef.current = result;
    }
  };

  const candidate: ICandidate = {
    key: "fuzzy",
    label: intl.formatMessage({
      id: "fuzzy.search",
      defaultMessage: "Automatic",
    }),
    type: "fuzzy",
    loading,
    options,
    onSearch,
  };

  return {
    candidate,
    setCandidates: setFuzzyCandidates,
  };
};
