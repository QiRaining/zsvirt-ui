import { formatBytesToSize } from "@zstack/zsphere-utils";
import { Spin } from "antd";
import { clamp, floor } from "lodash-es";
import React, { FC } from "react";
import { useIntl } from "react-intl";

import ResourceCapacity from "../a-cloud-old-components/resource-capacity";
import {
  IResourceCapacity,
  IResourceCapacityType,
} from "../a-cloud-old-components/resource-capacity/type";
import Title from "./title";
import type { IRatioProps } from "./type";

const formatCPU = (intl: any) => {
  return (value: number) => {
    return intl.formatMessage(
      {
        id: "cpuCount.withUnit",
        defaultMessage: "{num} Cores",
      },
      {
        num: value,
      },
    );
  };
};

const Ratio: FC<IRatioProps> = ({
  title,
  resourceType,
  usedNum: originUsedNum = 0,
  availableNum: originAvailableNum = 0,
  reservedNum = 0,
  totalNum = 0,
  overTotalNum = 0,
  snapshotNum = 0,
  imageNum = 0,
  vmTemplateCacheNum = 0,
  diskNum = 0,
  systemUsedNum = 0,
  loading,
  isEmpty: originEmpty,
  overProvisioning = 1,
}) => {
  const intl = useIntl();
  const isCpu = resourceType === "cpu";
  const isStorage = resourceType === "storage";
  const isMemory = resourceType === "memory";
  const isEmpty = originEmpty || totalNum === 0 || overTotalNum === 0;
  const formatValue = isCpu ? formatCPU(intl) : formatBytesToSize;

  let usedNum = 0;
  let usedValue = "";
  let availableNum = 0;
  let availableValue = "";

  let totalValue = "";
  let overTotalValue = "";

  // 分配比
  let allocationRate = 1;
  // 超配比
  let allocationRatio = 1;

  try {
    usedNum = originUsedNum || overTotalNum - originAvailableNum;
    usedValue = formatValue(usedNum);

    availableNum = originAvailableNum ?? overTotalNum - originUsedNum;
    availableValue = formatValue(availableNum);

    totalValue = formatValue((totalNum - reservedNum) * overProvisioning);
    overTotalValue = formatValue(overTotalNum);

    allocationRate = floor(usedNum / (totalNum - reservedNum), 2);
    allocationRatio = floor(
      isCpu ? overTotalNum / totalNum : overProvisioning,
      2,
    );

    if (isMemory) {
      availableValue = formatValue(overTotalNum - usedNum - reservedNum);
      //资源分配比-可分配总量
      overTotalValue = formatValue(overTotalNum - reservedNum);
      totalValue = formatValue(overTotalNum - reservedNum);
    }

    if (isStorage) {
      // 已分配容量 = 快照容量 + 镜像缓存 + 虚拟机硬盘 + 模版缓存 + 系统容量
      usedNum =
        snapshotNum + imageNum + diskNum + vmTemplateCacheNum + systemUsedNum;
      usedValue = formatValue(usedNum);

      availableNum = (overTotalNum - reservedNum) * allocationRatio - usedNum;
      availableValue = formatValue(availableNum);

      overTotalValue = formatValue(
        (overTotalNum - reservedNum) * overProvisioning,
      );
      //可超配总量
      totalValue = formatValue(overTotalNum - reservedNum);
      // 分配比
      allocationRate = usedNum / (overTotalNum - reservedNum);
      const precision = clamp(-floor(Math.log10(allocationRate)), 2, 8);
      allocationRate = floor(allocationRate, precision);
    }
  } catch (error) {
    console.error(error);
  }

  const usedLabel = intl.formatMessage({
    id: "allocated",
    defaultMessage: "Allocated",
  });
  const availableLabel = intl.formatMessage({
    id: "remaining.allocatable",
    defaultMessage: "Free to Allocate",
  });
  const totalLabel = intl.formatMessage({
    id: "allocatable.total.amount",
    defaultMessage: "Total Allocatable",
  });

  const name: IResourceCapacity["name"] = {
    label: intl.formatMessage({
      id: "allocation.rate",
      defaultMessage: "Allocation Ratio",
    }),
    value: allocationRate ? `${allocationRate} : 1` : "-",
  };
  const progress: IResourceCapacity["progress"] = [
    {
      percentage: allocationRate,
      tooltip: [
        {
          label: usedLabel,
          value: usedValue,
        },
      ],
    },
    {
      percentage: 1,
      tooltip: [
        {
          label: intl.formatMessage({
            id: "total.overallocatable.amount",
            defaultMessage: "Exceeds total capacity.",
          }),
          value: totalValue,
        },
        {
          label: intl.formatMessage({
            id: "overallocation.ratio",
            defaultMessage: "Overcommit Ratio",
          }),
          value: allocationRatio ? `${allocationRatio} : 1` : "-",
        },
      ],
    },
  ];
  const legend: IResourceCapacity["legend"] = [
    {
      label: availableLabel,
      value: availableValue,
    },
    {
      label: usedLabel,
      value: usedValue,
    },
    {
      label: totalLabel,
      value: overTotalValue,
    },
  ];

  return (
    <Spin spinning={loading}>
      <ResourceCapacity
        type={IResourceCapacityType.Ratio}
        title={title || <Title type={resourceType} />}
        name={name}
        progress={progress}
        legend={legend}
        isEmpty={isEmpty}
      />
    </Spin>
  );
};

export default Ratio;
