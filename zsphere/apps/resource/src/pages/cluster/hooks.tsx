import { useLazyQuery } from "@apollo/client";
import { queryClusterList } from "@zstack/virtualization-resource/src/gql/cluster.gql";
import type { IQuery } from "@zstack/zsphere-types";
import type { QueryClusterResp } from "@zstack/zsphere-types/graphql";
import { getGQL } from "@zstack/zsphere-utils";
import { compact, reduce } from "lodash-es";
import React from "react";

const _queryClusterList = getGQL(queryClusterList, ["uuid", "name"]);

export const useCluster = (
  defalultQuery: IQuery,
  autoQuery: boolean = true,
) => {
  const [query, { data, loading, refetch }] = useLazyQuery<{
    clusterList: QueryClusterResp;
  }>(_queryClusterList);

  const { clusterList, clusterMap, clusterNameMap } = React.useMemo(() => {
    const _clusterList = compact(data?.clusterList?.list);

    const _clusterMap = reduce(
      _clusterList,
      (obj, curr) => {
        if (!obj[curr.uuid]) {
          obj[curr.uuid] = curr;
        }

        return obj;
      },
      {} as any,
    );

    const _clusterNameMap = reduce(
      _clusterList,
      (obj, curr) => {
        if (!obj[curr.name]) {
          obj[curr.name] = curr;
        }

        return obj;
      },
      {} as any,
    );

    return {
      clusterList: _clusterList,
      clusterMap: _clusterMap,
      clusterNameMap: _clusterNameMap,
    };
  }, [data]);

  const dq = React.useMemo(() => defalultQuery, [defalultQuery]);

  React.useEffect(() => {
    if (autoQuery) {
      query({
        variables: dq,
      });
    }
  }, [autoQuery, dq, query]);

  return {
    queryCluster: query,
    loading,
    refetchCluster: refetch,
    clusterList,
    clusterMap,
    clusterNameMap,
  };
};
