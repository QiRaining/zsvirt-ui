import { gql, useLazyQuery } from "@apollo/client";
import { ProfileType } from "@zstack/zsphere-types";
import { MetricData, MetricLabelValue } from "@zstack/zsphere-types/graphql";
import { isEmpty, replace, sortBy } from "lodash-es";
import { useMemo, useState } from "react";

const getMetricDataList = gql`
  query getMetricDataList(
    $type: GetMetricDataQueryType!
    $metricParams: [MetricParam!]!
    $conditions: [Condition!]
  ) {
    getMetricDataList(
      type: $type
      metricParams: $metricParams
      conditions: $conditions
    ) {
      time
      value
      type
      metricName
      label
    }
  }
`;

const queryMetricLabelValueList = gql`
  query queryMetricLabelValueList(
    $namespace: String!
    $metricName: String!
    $labelName: String!
    $filterLabels: String
    $startTime: Float
    $endTime: Float
  ) {
    metricLabelValueList(
      namespace: $namespace
      metricName: $metricName
      labelName: $labelName
      filterLabels: $filterLabels
      startTime: $startTime
      endTime: $endTime
    ) {
      value
    }
  }
`;

const queryPersonalizationConfig = gql`
  query queryPersonalizationConfig(
    $profileType: ProfileType!
    $resourceType: String!
  ) {
    queryPersonalizationConfig(
      profileType: $profileType
      resourceType: $resourceType
    ) {
      userId
      profileType
      resourceType
      value
    }
  }
`;

export function useMonitorNameFormatter(metricNameMap?: Map<string, string>) {
  return (name: string) => {
    const realName = metricNameMap?.get(name) || name;
    return realName;
  };
}

export function useMonitorNameOptions(metricNameMap?: Map<string, string>) {
  if (!metricNameMap) return undefined;
  const options = Array.from(metricNameMap, ([key, value]) => ({
    label: value,
    value: key,
  }));
  return options;
}

export function useMonitorData() {
  const [monitorData, setMonitorData] = useState<MetricData[]>([]);

  const [getMonitorData] = useLazyQuery<{
    getMetricDataList: MetricData[];
  }>(getMetricDataList, {
    fetchPolicy: "no-cache",
    onCompleted(data) {
      let dataList = data?.getMetricDataList || [];

      const systemMetricPrefix = "OperatingSystem";
      const systemMetricDataList = dataList.filter((item) =>
        item.metricName.includes(systemMetricPrefix),
      );
      // 如果同时存在基础监控和高级监控，且高级监控数值不为 0，则合并数据，取高级监控数值；
      // 为了使基础监控和高级监控展示在一条线上，type需要相同。
      if (
        systemMetricDataList.length > 0 &&
        systemMetricDataList.length < dataList.length
      ) {
        const dataMap: Map<string, MetricData> = new Map();
        dataList.forEach((item) => {
          const key = `${item.time}-${item.type}`;
          if (item.type.includes(systemMetricPrefix)) {
            const relatedBasicType = replace(item.type, systemMetricPrefix, "");
            const relatedBasicKey = `${item.time}-${relatedBasicType}`;
            if (item.value > 0) {
              if (dataMap.get(relatedBasicKey)) {
                dataMap.delete(relatedBasicKey);
              }
              dataMap.set(key, { ...item, type: relatedBasicType });
            }
          } else if (!dataMap.has(key)) {
            dataMap.set(key, item);
          }
        });
        dataList = sortBy(Array.from(dataMap.values()), "time");
      }
      setMonitorData(dataList);
    },
  });

  return {
    getMonitorData,
    monitorData,
  };
}

export function useMonitorLabels() {
  const [getMonitorLabels, result] = useLazyQuery<{
    metricLabelValueList: MetricLabelValue[];
  }>(queryMetricLabelValueList, { fetchPolicy: "no-cache" });

  const monitorLabels = useMemo(() => {
    const data = (result as any).data;
    const list: any[] =
      data?.metricLabelValueList?.map(({ value }: { value: string }) => ({
        value,
        label: value,
      })) || [];
    return sortBy(list, ({ value }: any) => {
      if (!Number.isNaN(Number(value))) {
        return Number(value);
      }
      return value;
    });
  }, [result]);

  return {
    getMonitorLabels,
    monitorLabels,
  };
}

export function useMonitorItems(
  resourceType: string,
  defaultItems: string[] = [],
) {
  const [monitorItems, setMonitorItems] = useState<string[]>([]);

  const [getMonitorItems, result] = useLazyQuery(queryPersonalizationConfig, {
    variables: {
      profileType: ProfileType.MonitoringItemsConfig,
      resourceType,
    },
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
    onCompleted(data) {
      let items: string[] = JSON.parse(
        data?.queryPersonalizationConfig?.value || "[]",
      );
      if (isEmpty(items) && !isEmpty(defaultItems)) {
        items = defaultItems;
      }
      setMonitorItems(items);
    },
  });

  return {
    getMonitorItems,
    loadingMonitorItems: (result as any).loading,
    monitorItems,
    refetchMonitorItems: (result as any).refetch,
  };
}
