import {
  Select,
  useAuth,
  AuthHander,
  useMetricNameConfig,
} from "@zstack/zsphere-components";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { usePersistFn } from "ahooks";
import {
  isEmpty as _isEmpty,
  intersectionBy as _intersectionBy,
} from "lodash-es";
import type { FC } from "react";
import { useState, useEffect, useMemo } from "react";
import { useIntl } from "react-intl";

import METRICS_JSON from "../constant/Metrics.json";
import METRICS_CAT_JSON from "../constant/MetricsCat.json";

const { Option } = Select;
const NORMALWIDTH = 400;
const CONDITIONWIDTH = 232;

export interface IProps {
  namespace: string;
  resource?: string; // 从各个资源里传递过来的namespace
  value?: string;
  onChange?: (value?: string) => void;
  sourcefilterMetricValues: string[];
  setFields: Function;
}

export const hidenMetricMap: { [key: string]: { [key: string]: string[] } } = {
  "ZStack/PrimaryStorage": {
    PoolUuid: ["Ceph"],
  },
};

const MetricSelect: FC<IProps> = ({
  onChange,
  namespace,
  resource,
  sourcefilterMetricValues,
  setFields,
}) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const [showMetricItemType, setShowMetricItemType] = useState(true);
  const [metricItemDatas, setMetricItemDatas] = useState<string[]>();
  const [metricType, setMetricType] = useState<string>();
  const [metricName, setMetricName] = useState<string>();
  const {
    translateSelectMetricName,
    translateMetricNameGroupAllType,
    getMetricAuth,
  } = useMetricNameConfig();
  const initMetricName = "";

  const METRICS: any = METRICS_JSON;
  const METRICS_CAT: any = METRICS_CAT_JSON;

  const { currentEnv } = usePlatformStore();
  const isCube = currentEnv === "cube";

  if (isCube === false) {
    const HOST_METRICS = METRICS["ZStack/Host"];
    delete HOST_METRICS.RaidState;
    delete HOST_METRICS.PowerSupply;
    delete HOST_METRICS.PhysicalNetworkInterface;

    const HOST_METRICS_CAT = METRICS_CAT["ZStack/Host"];
    delete HOST_METRICS_CAT.Raid;
    const PowerSupplyIndex = HOST_METRICS_CAT.Other.findIndex(
      (i: string) => i === "PowerSupply",
    );
    if (PowerSupplyIndex > -1) {
      HOST_METRICS_CAT.Other.splice(PowerSupplyIndex, 1);
    }
    const PhysicalNetworkInterfaceIndex = HOST_METRICS_CAT.Network.findIndex(
      (i: string) => i === "PhysicalNetworkInterface",
    );
    if (PhysicalNetworkInterfaceIndex > -1) {
      HOST_METRICS_CAT.Network.splice(PhysicalNetworkInterfaceIndex, 1);
    }
  }

  // 获取过滤后的报警条目
  const filterMetricsFn = usePersistFn(() => {
    const metrics = Object.keys(METRICS[namespace] || {});
    if (!resource) {
      return metrics;
    }
    const obj: { [key: string]: string } = {
      "ZStack/VRouter": "VMUuid",
      "ZStack/VM": "VMUuid",
      "ZStack/BaremetalVM": "BaremetalVMUuid",
      "ZStack/Baremetal2VM": "Baremetal2VMUuid",
      "ZStack/Host": "HostUuid",
      "ZStack/LoadBalancer": "ListenerUuid",
      "ZStack/VIP": "VipUUID",
      "ZStack/L3Network": "L3NetworkUuid",
      "ZStack/BackupStorage": "BackupStorageUuid",
      "ZStack/PrimaryStorage": "PrimaryStorageUuid",
    };

    const filterLabels: string[] = [];
    filterLabels.push(obj[resource]);

    for (const key in hidenMetricMap[resource]) {
      if (
        !_isEmpty(
          _intersectionBy(
            hidenMetricMap[resource][key],
            sourcefilterMetricValues,
          ),
        )
      ) {
        filterLabels.push(key);
      }
    }

    const filterMetrics: string[] = [];
    metrics.forEach((metric) => {
      const item = METRICS[namespace][metric];
      const isFilterLabel = item.labelNames.some((cv: string) =>
        filterLabels.includes(cv),
      );
      if (isFilterLabel) {
        filterMetrics.push(metric);
      }
    });
    return filterMetrics;
  });

  const filterMetricsForCat = (type?: string) => {
    if (!type) {
      return filterMetricsFn();
    }
    const metricKeys = METRICS_CAT[namespace][type];
    if (!resource) {
      return metricKeys;
    }
    const filterMetrics = filterMetricsFn();
    const metrics = metricKeys.filter((item: string) =>
      filterMetrics?.some((it) => it === item),
    );
    return metrics;
  };

  const metricTypesNamespace = useMemo(() => Object.keys(METRICS_CAT), []);
  const metricItemTypes = useMemo(() => {
    // FIXME 临时过滤掉vGPU，待后端支持后再开放
    const cats = Object.keys(METRICS_CAT?.[namespace] || {}).filter(
      (val) => val !== "vGPU",
    );
    if (!resource) {
      return cats;
    }
    // 具体资源跳过来的创建
    return cats.filter((item) => {
      const metrics = filterMetricsForCat(item);
      if (metrics.length === 0) {
        return false;
      }
      return true;
    });
  }, [namespace]);

  const renderMetricItem = (_namespace: string, _cv: string) => {
    const alarmWithNoThreshold = [
      "PhysicalNetworkInterface",
      "RaidState",
      "PowerSupply",
    ];
    const translatedMetricName = translateSelectMetricName(_namespace, _cv);
    if (alarmWithNoThreshold.includes(_cv)) {
      return (
        translatedMetricName +
        intl.formatMessage({
          id: "abnormal",
          defaultMessage: "Abnormal",
        })
      );
    }
    return translatedMetricName;
  };

  useEffect(() => {
    let _metricType;
    const filteredMetrics = filterMetricsFn();
    const isExistType = metricTypesNamespace?.includes(namespace);
    const isExistMetricName = filteredMetrics?.includes(initMetricName); // 已选的“报警条目”是否属于所选“资源类型”
    const _metricName = isExistMetricName ? initMetricName : undefined;

    // 存在 “类型” Select
    if (isExistType) {
      let _metricItemDatas = [];
      const _curNamespaceObj = METRICS_CAT?.[namespace];
      for (const k in _curNamespaceObj) {
        // 通过 initMetricName 找到所属的 metricType，f5刷新后赋值
        if (_curNamespaceObj?.[k]?.includes(initMetricName)) {
          _metricItemDatas = _curNamespaceObj?.[k];
          _metricType = k;
          break;
        }
      }
      setShowMetricItemType(true);
      setMetricItemDatas(_metricItemDatas);
    } else {
      setShowMetricItemType(false);
      setMetricItemDatas(filteredMetrics);
    }
    setMetricType(_metricType);
    setMetricName(_metricName);
    onChange?.(_metricName);
  }, [namespace]);

  // 改变第一个下拉框
  const metricItemTypesChange = (v: string) => {
    setMetricType(v);
    setMetricName(undefined);
    setMetricItemDatas(filterMetricsForCat(v));
    onChange?.();
  };

  // 改变第二个下拉框
  const metricItemDatasChange = (v: string) => {
    setFields([
      {
        name: "resouces",
        value: [],
      },
    ]);

    setMetricName(v);
    onChange?.(v);
  };

  return (
    <div className="flex items-center gap-2">
      {showMetricItemType && (
        <Select
          value={metricType}
          width="s"
          onChange={metricItemTypesChange}
          placeholder={intl.formatMessage({
            id: "zwatchAlarm.field.type.placeholder",
            defaultMessage: "Select Type",
          })}
        >
          {metricItemTypes?.map((cv) => (
            <Option value={cv} key={cv}>
              {translateMetricNameGroupAllType(namespace, cv)}
            </Option>
          ))}
        </Select>
      )}
      <Select
        style={{ width: showMetricItemType ? CONDITIONWIDTH : NORMALWIDTH }}
        value={metricName}
        onChange={metricItemDatasChange}
        placeholder={intl.formatMessage({
          id: "zwatchAlarm.field.alarmEntry.placeholder",
          defaultMessage: "Select Metric Item",
        })}
      >
        {metricItemDatas?.map((cv) => {
          const auth = getMetricAuth(namespace, cv);
          if (auth) {
            return hasAuth(auth) ? (
              <Option value={cv} key={cv}>
                <AuthHander {...auth}>
                  {renderMetricItem(namespace, cv)}
                </AuthHander>
              </Option>
            ) : null;
          }
          return (
            <Option value={cv} key={cv}>
              {renderMetricItem(namespace, cv)}
            </Option>
          );
        })}
      </Select>
    </div>
  );
};

MetricSelect.displayName = "MetricSelect";

export default MetricSelect;
