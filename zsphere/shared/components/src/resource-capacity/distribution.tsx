import { Color, formatBytesToSize } from "@zstack/zsphere-utils";
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
import type { IDistributionProps } from "./type";

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

const Distribution: FC<IDistributionProps> = ({
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
  systemUsedNum = 0,
  diskNum = 0,
  loading,
  isEmpty: originEmpty,
  overProvisioning = 1,
  isLocal = false,
}) => {
  const intl = useIntl();
  const isCpu = resourceType === "cpu";
  const isMemory = resourceType === "memory";
  const isStorage = resourceType === "storage";
  const isEmpty = originEmpty || totalNum === 0 || overTotalNum === 0;
  const formatValue = isCpu ? formatCPU(intl) : formatBytesToSize;
  let usedNum = 0;
  let usedValue = "";
  let availableNum = 0;
  let availableValue = "";
  let reservedValue = "";
  let overTotalValue = "";
  let snapshotValue = "";
  let imageValue = "";
  let diskValue = "";
  let systemUsedValue = "";
  let vmTemplateCacheValue = "";

  // 超配比
  let allocationRatio = 1;
  // 可超配总量
  let totalDistributable = 0;
  // 可分配总量
  let totalAllocatable = 0;

  let progress: IResourceCapacity["progress"] = [];
  let legend: IResourceCapacity["legend"] = [];

  try {
    usedNum = originUsedNum || overTotalNum - originAvailableNum;
    usedValue = formatValue(usedNum);

    availableNum = originAvailableNum ?? overTotalNum - originUsedNum;
    availableValue = formatValue(availableNum);

    //cpu直接用，memory和storage下面被重新计算了
    overTotalValue = formatValue(overTotalNum);

    // 超配比 (overProvisioning 是系统参数配置的值)
    allocationRatio = floor(
      isCpu ? overTotalNum / totalNum : overProvisioning,
      2,
    );

    if (isMemory) {
      //可分配总量
      totalAllocatable =
        (overTotalNum / allocationRatio - reservedNum) * allocationRatio;

      //剩余可分配 = 可分配总量 - 已分配容量 - 保留容量
      availableValue = formatValue(totalAllocatable - usedNum);

      //超配后总量 =  可分配总量 + 保留容量
      overTotalValue = formatValue(totalAllocatable + reservedNum);
    }

    if (isStorage) {
      // 已分配容量 = 快照容量 + 镜像缓存 + 虚拟机硬盘 + 模版缓存
      usedNum =
        snapshotNum + imageNum + diskNum + vmTemplateCacheNum + systemUsedNum;

      // 可超配总量 = 物理总量 - 保留容量
      totalDistributable = overTotalNum - reservedNum;

      // 可分配总量 = 可超配总量 * 超配比
      totalAllocatable = totalDistributable * allocationRatio;

      // 剩余可分配 = 可分配总量 - 已分配容量
      availableNum = totalAllocatable - usedNum;
      availableValue = formatValue(availableNum);

      // 超配后总量 = 可分配总量 + 保留容量
      overTotalNum = totalAllocatable + reservedNum;
      overTotalValue = formatValue(overTotalNum);
    }

    // 不需要额外计算
    reservedValue = formatValue(reservedNum);
    snapshotValue = formatValue(snapshotNum);
    imageValue = formatValue(imageNum);
    diskValue = formatValue(diskNum);
    systemUsedValue = formatValue(systemUsedNum);
    vmTemplateCacheValue = formatValue(vmTemplateCacheNum);
  } catch (error) {
    console.error(error);
  }

  const reservedLabel = intl.formatMessage({
    id: "reserved.capacity",
    defaultMessage: "Reserved Capacity",
  });
  const reservedMemoryLabel = intl.formatMessage({
    id: "reserved.memory",
    defaultMessage: "Reserved Memory",
  });

  const usedLabel = intl.formatMessage({
    id: "allocated",
    defaultMessage: "Allocated",
  });
  const availableLabel = intl.formatMessage({
    id: "remaining.allocatable",
    defaultMessage: "Free to Allocate",
  });

  const snapshotLabel = intl.formatMessage({
    id: "snapshot.capacity",
    defaultMessage: "Snapshot Capacity",
  });

  const imageLabel = intl.formatMessage({
    id: "image.cache",
    defaultMessage: "Image Cache",
  });

  const templateLabel = intl.formatMessage({
    id: "template.cache",
    defaultMessage: "Template Cache",
  });

  const hardDriveLabel = intl.formatMessage({
    id: "hard.drive",
    defaultMessage: "Disk",
  });

  const systemCapacityLabel = intl.formatMessage({
    id: "system.capacity",
    defaultMessage: "System Capacity",
  });

  const name: IResourceCapacity["name"] = {
    label: intl.formatMessage({
      id: "overallocation.amount",
      defaultMessage: "Overcommitted Total",
    }),
    value: overTotalValue,
  };

  switch (resourceType) {
    case "cpu":
      progress = [
        {
          percentage: usedNum,
          color: "info",
          tooltip: [
            {
              label: usedLabel,
              value: usedValue,
            },
          ],
        },
        {
          percentage: availableNum,
          tooltip: [
            {
              label: availableLabel,
              value: availableValue,
            },
          ],
        },
      ];
      break;
    case "memory":
      progress = [
        {
          percentage: reservedNum,
          color: "disabled",
          tooltip: [
            {
              label: reservedMemoryLabel,
              value: reservedValue,
            },
          ],
        },
        {
          percentage: usedNum,
          color: "info",
          tooltip: [
            {
              label: usedLabel,
              value: usedValue,
            },
          ],
        },
        {
          percentage: availableNum,
          tooltip: [
            {
              label: availableLabel,
              value: availableValue,
            },
          ],
        },
      ];
      break;
    case "storage":
      progress = [
        {
          percentage: reservedNum,
          color: "disabled",
          tooltip: [
            {
              label: reservedLabel,
              value: reservedValue,
            },
          ],
        },
        ...(isLocal
          ? [
              {
                percentage: systemUsedNum,
                color: "positive" as Color.ISemantic,
                tooltip: [
                  {
                    label: systemCapacityLabel,
                    value: systemUsedValue,
                  },
                ],
              },
            ]
          : []),
        {
          percentage: snapshotNum,
          color: "danger",
          tooltip: [
            {
              label: snapshotLabel,
              value: snapshotValue,
            },
          ],
        },
        {
          percentage: imageNum,
          color: "pending",
          tooltip: [
            {
              label: imageLabel,
              value: imageValue,
            },
          ],
        },
        {
          percentage: vmTemplateCacheNum,
          color: "alert",
          tooltip: [
            {
              label: templateLabel,
              value: vmTemplateCacheValue,
            },
          ],
        },
        {
          percentage: diskNum,
          color: "info",
          tooltip: [
            {
              label: hardDriveLabel,
              value: diskValue,
            },
          ],
        },
        {
          percentage: availableNum,
          tooltip: [
            {
              label: availableLabel,
              value: availableValue,
            },
          ],
        },
      ];
      break;
  }

  switch (resourceType) {
    case "cpu":
      legend = [
        {
          label: usedLabel,
          color: "info",
          value: usedValue,
        },
        {
          label: availableLabel,
          value: availableValue,
        },
      ];
      break;
    case "memory":
      legend = [
        {
          label: reservedMemoryLabel,
          color: "disabled",
          value: reservedValue,
        },
        {
          label: usedLabel,
          color: "info",
          value: usedValue,
        },
        {
          label: availableLabel,
          value: availableValue,
        },
      ];
      break;
    case "storage":
      legend = [
        {
          label: reservedLabel,
          color: "disabled",
          value: reservedValue,
        },
        ...(isLocal
          ? [
              {
                label: systemCapacityLabel,
                color: "positive" as Color.ISemantic,
                value: systemUsedValue,
              },
            ]
          : []),
        {
          label: snapshotLabel,
          color: "danger",
          value: snapshotValue,
        },
        {
          label: imageLabel,
          color: "pending",
          value: imageValue,
        },
        {
          label: templateLabel,
          color: "alert",
          value: vmTemplateCacheValue,
        },
        {
          label: hardDriveLabel,
          color: "info",
          value: diskValue,
        },
        {
          label: availableLabel,
          value: availableValue,
        },
      ];
      break;
  }

  return (
    <Spin spinning={loading}>
      <ResourceCapacity
        type={IResourceCapacityType.Distribution}
        title={
          title || {
            label: <Title type={resourceType} />,
            extra: (
              <span>
                {intl.formatMessage({
                  id: "overallocation.ratio",
                  defaultMessage: "Overcommit Ratio",
                })}{" "}
                {`${allocationRatio} : 1`}
              </span>
            ),
          }
        }
        name={name}
        progress={progress}
        legend={legend}
        isEmpty={isEmpty}
      />
    </Spin>
  );
};

export default Distribution;
