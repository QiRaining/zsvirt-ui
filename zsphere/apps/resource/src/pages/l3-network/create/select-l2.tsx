import { useQuery } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import { queryL2Network } from "@zstack/virtualization-resource/src/gql/l2-network.gql";
import ZSVL2NetworkList from "@zstack/virtualization-resource/src/pages/l2-network/list";
import type { IQuery } from "@zstack/zsphere-types";
import { Op, L2NetworkQueryType } from "@zstack/zsphere-types";
import { useUpdateEffect } from "ahooks";
import { mergeWith, compact } from "lodash-es";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import styles from "./style.module.less";

const typeCondition = {
  key: "type",
  op: Op.notIn,
  values: ["VxlanNetworkPool", "HardwareVxlanNetworkPool"],
};

const zstackCondition = {
  key: "cluster.hypervisorType",
  op: Op.ne,
  value: "ESX",
};

const tabMap = {
  recommend: L2NetworkQueryType.CreateL3DefaultCandidate,
  all: L2NetworkQueryType.CreateL3AllCandidate,
};

export const L2NetworkSelectTab = ({ reSelect = true, ...props }: any) => {
  const intl = useIntl();
  const [tab, setTab] = useState<"recommend" | "all">("recommend");

  const l2NetworkQuery: IQuery = useMemo(() => {
    return {
      conditions: compact([zstackCondition, typeCondition]),
      type: tabMap[tab],
    };
  }, [tab]);

  const defaultQuery = useMemo(() => {
    return mergeWith(
      {},
      props.defaultQuery,
      l2NetworkQuery,
      (objValue, srcValue) => {
        if (Array.isArray(objValue)) {
          return objValue.concat(srcValue);
        }
      },
    );
  }, [props.defaultQuery, l2NetworkQuery]);

  const { data: totalData, refetch: totalRefetch } = useQuery(queryL2Network, {
    variables: {
      conditions: defaultQuery.conditions,
      type: tabMap.all,
    },
    fetchPolicy: "no-cache",
  });
  const totalList = totalData?.l2NetworkList;

  const { data: recommendData, refetch: recommendRefetch } = useQuery(
    queryL2Network,
    {
      variables: {
        conditions: defaultQuery.conditions,
        type: tabMap.recommend,
      },
      fetchPolicy: "no-cache",
    },
  );
  const recommendList = recommendData?.l2NetworkList;

  useUpdateEffect(() => {
    totalRefetch();
    recommendRefetch();
  }, [tab]);

  return (
    <>
      <RadioGroup
        variant="button"
        className={styles.l2NetworkTableSelectTab}
        onValueChange={(val) => {
          setTab(val as "recommend" | "all");

          if (reSelect) {
            props?.onChange?.([]);
          }
        }}
        value={tab}
        options={[
          {
            value: "recommend",
            label: `${intl.formatMessage({
              id: "not.attached",
              defaultMessage: "Recommended",
            })} (${recommendList?.total ?? 0})`,
          },
          {
            value: "all",
            label: `${intl.formatMessage({ id: "all", defaultMessage: "All" })} (${
              totalList?.total ?? 0
            })`,
          },
        ]}
      />

      <ZSVL2NetworkList
        view="select.virtualization.l3"
        {...props}
        defaultQuery={defaultQuery}
        toolbar={["refresh", "search"]}
      />
    </>
  );
};
