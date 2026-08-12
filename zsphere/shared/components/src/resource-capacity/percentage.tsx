import { formatBytesToSize, formatPercent } from "@zstack/zsphere-utils";
import { Spin } from "antd";
import { floor } from "lodash-es";
import React, { FC } from "react";
import { useIntl } from "react-intl";

import ResourceCapacity from "../a-cloud-old-components/resource-capacity";
import {
  IResourceCapacity,
  IResourceCapacityType,
} from "../a-cloud-old-components/resource-capacity/type";
import Title from "./title";
import type { IPercentageProps } from "./type";

const formatCPU = (intl: any, isPhysical?: boolean) => {
  return (value: number) => {
    if (!value) return "-";
    const num = floor(value, 2);
    return isPhysical
      ? `${num} GHz`
      : intl.formatMessage(
          {
            id: "cpuCount.withUnit",
            defaultMessage: "{num} Cores",
          },
          {
            num,
          },
        );
  };
};

const calculateCpuValues = (usedNum: number) => {
  const usedPercentage = usedNum;
  const availablePercentage = 100 - usedPercentage;
  return { usedPercentage, availablePercentage };
};

const Percentage: FC<IPercentageProps> = ({
  title,
  resourceType,
  usedNum: originUsedNum = 0,
  availableNum: originAvailableNum = 0,
  reservedNum = 0,
  totalNum = 0,
  loading,
  isEmpty: originEmpty,
  isPhysical = true,
  resourceCategory,
  extra,
}) => {
  const intl = useIntl();
  const isCpu = resourceType === "cpu";
  const isStorage = resourceType === "storage";
  const isEmpty = originEmpty || totalNum === 0;
  const formatValue = isCpu ? formatCPU(intl, isPhysical) : formatBytesToSize;

  let usedNum = 0;
  let usedPercentage = 0;
  let usedPercentageValue = "";
  let usedValue = "";

  let availableNum = 0;
  let availablePercentage = 0;
  let availablePercentageValue = "";
  let availableValue = "";

  let reservedPercentage = 0;
  let reservedValue = "";

  let totalValue = "";

  try {
    usedNum = originUsedNum ?? totalNum - originAvailableNum - reservedNum;
    availableNum = originAvailableNum || totalNum - originUsedNum - reservedNum;
    reservedPercentage = (100 * reservedNum) / totalNum;
    reservedValue = formatValue(reservedNum);
    totalValue = formatValue(totalNum);

    if (isCpu) {
      // CPU较为特殊 资源计算逻辑需要特殊处理
      const cpuValues = calculateCpuValues(usedNum);
      usedPercentage = cpuValues.usedPercentage;
      availablePercentage = cpuValues.availablePercentage;

      // CPU 特殊值格式化
      usedPercentageValue = formatPercent(usedPercentage);
      usedValue = usedPercentageValue; // CPU specific value
      availablePercentageValue = formatPercent(availablePercentage);
      availableValue = availablePercentageValue; // CPU specific value
    } else {
      // 其他资源计算逻辑(内存、存储)
      usedPercentage = Math.min(100, (100 * usedNum) / totalNum);
      availablePercentage =
        availableNum < 0 ? 0 : (100 * availableNum) / totalNum;
      // 其他资源通用值格式化
      usedPercentageValue = formatPercent(usedPercentage);
      usedValue = formatValue(usedNum);
      availablePercentageValue = formatPercent(availablePercentage);
      availableValue = formatValue(availableNum);
    }
  } catch (error) {
    console.error(error);
  }

  const usedLabel = isPhysical
    ? intl.formatMessage({ id: "physical.used", defaultMessage: "Physical Used" })
    : intl.formatMessage({ id: "used", defaultMessage: "Used" });

  const availableLabel = isPhysical
    ? intl.formatMessage({
        id: "physical.available",
        defaultMessage: "Physical Available",
      })
    : intl.formatMessage({
        id: "available",
        defaultMessage: "Available ",
      });

  const totalLabel = isPhysical
    ? intl.formatMessage({ id: "physical.total", defaultMessage: "Physical Total" })
    : intl.formatMessage({ id: "total.amount", defaultMessage: "Total" });

  const reservedCurrentLabel = intl.formatMessage({
    id: "current.reservedPhysicalCapacity",
    defaultMessage: "Current Safety Threshold Capacity",
  });

  const reservedLabel = intl.formatMessage({
    id: "reservedPhysicalCapacity",
    defaultMessage: "Safety Threshold Capacity",
  });

  const name: IResourceCapacity["name"] = {
    label: usedLabel,
    value: usedPercentageValue,
  };

  const progress: IResourceCapacity["progress"] = [
    {
      percentage: usedPercentage,
      tooltip: [
        {
          label: usedLabel,
          value: usedValue,
        },
      ],
    },
    {
      percentage: availablePercentage,
      tooltip: [
        {
          label: availableLabel,
          value: availableValue,
        },
      ],
    },
  ];

  if (isStorage) {
    progress.push({
      percentage: reservedPercentage,
      tooltip: [
        {
          label: reservedCurrentLabel,
          value: reservedValue,
        },
        {
          value: intl.formatMessage({
            id: "reservedPhysicalCapacity.desc",
            defaultMessage:
              "Safety Threshold Capacity = Physical Storage Total x (1 - Storage Utilization Threshold)",
          }),
        },
      ],
      dash: true,
    });
  }

  const legend: IResourceCapacity["legend"] = isCpu
    ? [
        {
          label: availableLabel,
          value: availableValue,
        },
        {
          label: totalLabel,
          value: totalValue,
        },
      ]
    : [
        {
          label: availableLabel,
          value: availableValue,
        },
        ...(isStorage && resourceCategory !== "vm"
          ? [
              {
                label: reservedLabel,
                value: reservedValue,
              },
            ]
          : []),
        {
          label: totalLabel,
          value: totalValue,
        },
      ];

  return (
    <Spin spinning={loading}>
      <ResourceCapacity
        type={IResourceCapacityType.Percentage}
        title={{
          label: (title || <Title type={resourceType} />) as React.ReactNode,
          extra,
        }}
        name={name}
        progress={progress}
        legend={legend}
        isEmpty={isEmpty}
      />
    </Spin>
  );
};

export default Percentage;
