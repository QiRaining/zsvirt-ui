import { InfoPopover } from "@zstack/design";
import { calculateStorageMetrics } from "@zstack/virtualization-resource/src/pages/primary-storage/utils";
import {
  Constant,
  ResourceName,
  ResourceUsageProgress,
} from "@zstack/zsphere-components";
import { useAuth } from "@zstack/zsphere-components";
import type { ConstantEnum } from "@zstack/zsphere-constant";
import { ConstantType } from "@zstack/zsphere-constant";
import { useColumnConfig } from "@zstack/zsphere-engine/src/primary-storage";
import {
  PrimaryStorageState as IPrimaryStorageState,
  PrimaryStorageStatus as IPrimaryStorageStatus,
  PrimaryStorageType as IPrimaryStorageType,
  Op,
  PrimaryStorageQueryType,
  PrimaryStorageType,
} from "@zstack/zsphere-types";
import { LeftNavType } from "@zstack/zsphere-types";
import type {
  PrimaryStorageVO as IPrimaryStorageVO,
  PrimaryStorage,
} from "@zstack/zsphere-types/graphql";
import { isVhostStorage, isZbsStorage } from "@zstack/zsphere-utils";
import { pick, includes } from "lodash-es";
import { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import ClusterNameList from "../components/cluster-list";

import style from "./style.module.less";

const typeDisplayStyle = { display: "flex", alignItems: "center" } as const;

export enum EPrimaryStorageType {
  LocalStorage = "local-storage",
  NFS = "nfs",
  Ceph = "ceph",
  SharedMountPoint = "smp",
  SharedBlock = "SharedBlock",
}

interface IColumnProp {
  view: string;
  defaultQuery?: any;
}

export const renderPrimaryStorageType = (current: IPrimaryStorageVO) => {
  if (!current) {
    return "";
  }

  const getSubType = () => {
    if (isZbsStorage(current)) {
      return "ZBS";
    }
    if (isVhostStorage(current)) {
      return "ZHPS";
    }
    if (current.type === PrimaryStorageType.Ceph) {
      return "ZCE";
    }
    return "";
  };

  const subType = getSubType();
  const displayType =
    current.type === PrimaryStorageType.Addon
      ? PrimaryStorageType.Ceph
      : current.type;

  const showSubType =
    [PrimaryStorageType.Ceph, PrimaryStorageType.Addon].includes(
      current?.type as IPrimaryStorageType,
    ) && subType;

  return (
    <div style={typeDisplayStyle}>
      <Constant
        className={style.primaryStorageType}
        enumType={ConstantType.PrimaryStorageType}
        value={displayType as ConstantEnum}
      />
      {showSubType && <span>({subType})</span>}
    </div>
  );
};

export default ({ view, defaultQuery }: IColumnProp) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();

  const queryType = defaultQuery?.type ?? "";

  const hasNfsAuth = hasAuth({
    type: "block",
    resource: "primary.storage",
    authKey: "NFS",
  });

  // 动态指定过滤类型
  const typeFilterOpetions = useMemo(() => {
    const types = [
      IPrimaryStorageType.SharedBlock,
      IPrimaryStorageType.Ceph,
      IPrimaryStorageType.LocalStorage,
    ];

    if (hasNfsAuth) {
      types.push(IPrimaryStorageType.NFS);
    }

    return pick(IPrimaryStorageType, types);
  }, [hasNfsAuth]);

  return useColumnConfig<IPrimaryStorageVO>([
    {
      key: "name",
      render: (value: IPrimaryStorageVO) => {
        if (value?.expired?.isExpired) {
          // Icon element would be rendered here (legacy code)
        } else if (
          value?.expired?.dayDifference &&
          value?.expired?.dayDifference <= 14
        ) {
          // Warning icon element would be rendered here (legacy code)
        }

        return (
          <ResourceName
            value={value.name}
            link={{
              uuid: value?.uuid,
              to: "/primary-storage",
              microAppName: "virtualization-resource",
              leftnav: LeftNavType.DataStorage,
            }}
          />
        );
      },
    },
    {
      key: "primaryStorageUsage",
      title: (
        <div className="flex items-center gap-1">
          <span>
            {intl.formatMessage({
              id: "primaryStorage.usage",
              defaultMessage: "Storage Utilization",
            })}
          </span>
          <InfoPopover
            content={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "primaryStorage.storage.usage.tooltip",
                  defaultMessage: `### Storage Utilization

Displays the storage capacity and usage in the data storage.

1. Storage Utilization = Physical Used ÷ Physical Total
2. Physical Available = Physical Total − Physical Used − Safety Threshold Capacity
3. Safety Threshold Capacity = Physical Total × (1 − Storage Utilization Threshold)`,
                })}
              </ReactMarkdown>
            }
          />
        </div>
      ),
      render: (row) => {
        const { type = PrimaryStorageType.LocalStorage } = row;
        const {
          totalPhysicalCapacity = 0,
          availablePhysicalCapacity = 0,
          reservedPhysicalCapacity = 0,
        } = type === PrimaryStorageType.LocalStorage &&
        queryType ===
          PrimaryStorageQueryType.CreateInstanceDiskOptionFromHostInLocalStorageType
          ? (row?.storageCapacityForLocalStorage ?? {})
          : row;

        const {
          primaryStorageCapacity = {
            totalPhysicalCapacity: 0,
            availablePhysicalCapacity: 0,
            thresholdPrimaryStoragePhysicalCapacity: 0.9,
          },
        } = row;

        const {
          totalPhysicalCapacity: cephTotalPhysicalCapacity,
          availablePhysicalCapacity: cephAvailablePhysicalCapacity,
          thresholdPrimaryStoragePhysicalCapacity,
        } = primaryStorageCapacity;

        //处理每个存储正确的数据源
        const { totalNum, availableNum, reservedNum } = calculateStorageMetrics(
          type,
          {
            totalPhysicalCapacity,
            availablePhysicalCapacity,
            reservedPhysicalCapacity,
            cephAvailablePhysicalCapacity,
            cephTotalPhysicalCapacity,
            thresholdPrimaryStoragePhysicalCapacity,
          },
        );

        return (
          <ResourceUsageProgress
            resourceType="storage"
            poolType="primary"
            metric="capacityUtilization"
            total={totalNum}
            available={availableNum}
            reservedNum={reservedNum}
          />
        );
      },
    },
    {
      key: "virtualCapacityAllocationRatio",
      title: (
        <div className="flex items-center gap-1">
          <span>
            {intl.formatMessage({
              id: "storage.capacityAllocationRatio",
              defaultMessage: "Storage Allocation Rate",
            })}
          </span>
          <InfoPopover
            content={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "virtualCapacity.allocation.ratio.tooltip",
                  defaultMessage: `### Storage Allocation Rate

Displays the total allocatable capacity and allocation status of the data storage.

1. Storage Allocation Rate = Allocated ÷ Total Allocatable
2. Total Overcommit Capacity = Physical Total - Reserved Physical Capacity
3. Total Allocatable = Total Overcommit Capacity × Overcommit Ratio
4. Free to Allocate = Total Allocatable - Allocated`,
                })}
              </ReactMarkdown>
            }
          />
        </div>
      ),
      render: (row: PrimaryStorage) => {
        const { availablePhysicalCapacity, reservedCapacity } =
          row?.primaryStorageCapacity || {};

        const availableNum =
          row.type === "Ceph"
            ? availablePhysicalCapacity
            : row?.availableCapacity;

        return (
          <ResourceUsageProgress
            poolType="primary"
            resourceType="storage"
            metric="virtualCapacityAllocationRatio"
            total={row?.totalPhysicalCapacity || 0}
            available={availableNum || 0}
            reservedNum={reservedCapacity}
            primaryStorageCapacity={row?.primaryStorageCapacity}
          />
        );
      },
    },
    {
      key: "state",
      filterOptions: IPrimaryStorageState,
    },
    {
      key: "status",
      filterOptions: IPrimaryStorageStatus,
      defaultFilteredValue: [],
    },
    {
      key: "clusters",
      render: ({ clusters = [] }: IPrimaryStorageVO) => {
        return <ClusterNameList clusters={clusters} />;
      },
    },
    {
      key: "type",
      filterOptions: typeFilterOpetions,
      filterEnumType: ConstantType.PrimaryStorageType,
      filterCondition(values) {
        return {
          key: "__PrimaryStorageType__",
          op: Op.in,
          values: includes(values, PrimaryStorageType.Ceph)
            ? [...values, "Addon"]
            : values,
        };
      },
      render: (current) => {
        return renderPrimaryStorageType(current);
      },
    },
  ]);
};
