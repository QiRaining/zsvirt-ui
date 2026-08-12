import { gql, useLazyQuery } from "@apollo/client";
import { Text } from "@zstack/design";
import { ResourceCapacity, Select } from "@zstack/zsphere-components";
import { Illustration } from "@zstack/zsphere-illustration";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { Op } from "@zstack/zsphere-types";
import type {
  BackupStorage,
  ResourceData as IResourceData,
  PrimaryStorage,
} from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import { Progress } from "antd";
import { floor as _floor } from "lodash-es";
import type { FC } from "react";
import { useEffect, useState, useRef, useCallback, useMemo, memo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import AutoSkeleton from "../../components/auto-skeleton";
import { useDashboardStore } from "../../store/use-dashboard-store";
import useCheckCurrentLogin from "../useCheckCurrentLogin";

import style from "./style.module.less";

const GET_ZSV_USAGE_STATISTICS_DATA = gql`
  query getZSVUsageStatisticsData(
    $tableName: String!
    $metricName: String
    $zoneKey: String
    $zoneUuid: String
    $resourceKey: String!
    $monitorItem: String!
    $accountUuid: String
    $currentIdentity: String
    $hypervisorType: String
    $uuid: String
  ) {
    getZSVUsageStatisticsData(
      tableName: $tableName
      metricName: $metricName
      zoneKey: $zoneKey
      zoneUuid: $zoneUuid
      resourceKey: $resourceKey
      monitorItem: $monitorItem
      accountUuid: $accountUuid
      currentIdentity: $currentIdentity
      hypervisorType: $hypervisorType
      uuid: $uuid
    ) {
      capacityData {
        totalCapacity
        usedCapacity
        availableCapacity
        usedPercent
      }
    }
  }
`;

const GET_PRIMARY_STORAGE_LIST = gql`
  query primaryStorageList($conditions: [Condition!]) {
    primaryStorageList(conditions: $conditions) {
      list {
        uuid
        name
      }
    }
  }
`;

const GET_BACKUP_STORAGE_LIST = gql`
  query backupStorageList($conditions: [Condition!]) {
    backupStorageList(conditions: $conditions) {
      list {
        uuid
        name
      }
    }
  }
`;

interface IProps {
  currentParams: {
    label: string;
    tableName: string;
    resourceKey: string;
    metricName?: string;
    zoneKey?: string;
  };
  monitorItem: string;
  isEditable?: boolean;
}

const CapacityChart: FC<IProps> = memo(({ currentParams, monitorItem }) => {
  const intl = useIntl();
  const { currentUser } = usePlatformStore();
  const { isAccount, isAdmin } = useCheckCurrentLogin();
  const isFirstLoad = useRef(true);
  const zoneUuid = useDashboardStore((state) => state.zoneUuid);
  const [capacityData, setCapacityData] = useState<IResourceData>({});
  const [backupStorageList, setBackupStorageList] = useState<
    BackupStorage[] | undefined
  >();
  const [selectedBackupStorageUuid, setSelectedBackupStorageUuid] =
    useState<string>("all");
  const [primaryStorageList, setPrimaryStorageList] = useState<
    PrimaryStorage[] | undefined
  >();
  const [selectedPrimaryStorageUuid, setSelectedPrimaryStorageUuid] =
    useState<string>("all");
  const [currentUsedPercent, setCurrentUsedPercent] = useState(0);
  const { label, tableName, resourceKey, metricName, zoneKey } = currentParams;

  // 拉取 primaryStorage
  const [getPrimaryStorageListData, { loading: primaryStorageListLoading }] =
    useLazyQuery(GET_PRIMARY_STORAGE_LIST, {
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
      onCompleted(data) {
        const list = data?.primaryStorageList?.list ?? [];
        setPrimaryStorageList(list);
        setSelectedPrimaryStorageUuid("all");
      },
    });

  // 拉取 backupStorage
  const [getBackupStorageListData, { loading: backupStorageListLoading }] =
    useLazyQuery(GET_BACKUP_STORAGE_LIST, {
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
      onCompleted(data) {
        const list = data?.backupStorageList?.list ?? [];
        setBackupStorageList(list);
        setSelectedBackupStorageUuid("all");
      },
    });

  useEffect(() => {
    if (
      resourceKey === "primaryStorage" &&
      monitorItem === "actualUsedRate" &&
      zoneUuid
    ) {
      getPrimaryStorageListData({
        variables: {
          conditions: [
            {
              key: "zoneUuid",
              value: zoneUuid,
            },
          ],
        },
      });
    }
    if (resourceKey === "backupStorage" && zoneUuid) {
      getBackupStorageListData({
        variables: {
          conditions: [
            {
              key: "zone.uuid",
              value: zoneUuid,
            },
            {
              key: "__systemTag__",
              op: Op.notIn,
              values: ["remote", "aliyun", "onlybackup", "remotebackup"],
            },
          ],
        },
      });
    }
  }, [
    zoneUuid,
    resourceKey,
    monitorItem,
    getPrimaryStorageListData,
    getBackupStorageListData,
  ]);

  const [getMetricData, { loading }] = useLazyQuery(
    GET_ZSV_USAGE_STATISTICS_DATA,
    {
      onCompleted(data) {
        isFirstLoad.current = false;
        const {
          usedCapacity = 0,
          totalCapacity = 0,
          usedPercent = 0,
        } = data?.getZSVUsageStatisticsData?.capacityData ?? {};
        setCapacityData(data?.getZSVUsageStatisticsData?.capacityData);
        if (["cpu"].includes(resourceKey) && monitorItem === "actualUsedRate") {
          setCurrentUsedPercent(_floor(Number(usedPercent), 2));
        } else {
          const percent =
            _floor(
              (Number(usedCapacity) / Number(totalCapacity)) * 100,
              monitorItem === "actualUsedRate" ? 2 : 1,
            ) || 0;
          setCurrentUsedPercent(percent);
        }
      },
      fetchPolicy: "no-cache",
    },
  );

  // 使用 ref 存储函数引用，避免 useEffect 依赖不稳定
  const getMetricDataRef = useRef(getMetricData);
  getMetricDataRef.current = getMetricData;

  // 稳定化 uuid 计算
  const selectedUuid = useMemo(() => {
    if (
      tableName === "primaryStorage" &&
      selectedPrimaryStorageUuid !== "all"
    ) {
      return selectedPrimaryStorageUuid;
    }
    if (tableName === "backupStorage" && selectedBackupStorageUuid !== "all") {
      return selectedBackupStorageUuid;
    }
    return;
  }, [tableName, selectedPrimaryStorageUuid, selectedBackupStorageUuid]);

  // 稳定化 currentIdentity
  const currentIdentity = useMemo(
    () => (isAccount ? "Normal" : ""),
    [isAccount],
  );

  // 只有有 zoneKey 的 resource 才需要 zoneUuid 过滤
  const effectiveZoneUuid = zoneKey ? zoneUuid : undefined;

  const fetchMetricData = useCallback(() => {
    getMetricDataRef.current({
      variables: {
        tableName,
        resourceKey,
        monitorItem,
        metricName,
        zoneKey,
        zoneUuid: effectiveZoneUuid,
        accountUuid: currentUser?.accountUuid,
        currentIdentity,
        uuid: selectedUuid,
      },
    });
  }, [
    tableName,
    resourceKey,
    monitorItem,
    metricName,
    zoneKey,
    effectiveZoneUuid,
    currentUser?.accountUuid,
    currentIdentity,
    selectedUuid,
  ]);

  useEffect(() => {
    fetchMetricData();
  }, [fetchMetricData]);

  // 将 resourceKey 映射到 ResourceCapacity 的 resourceType
  const getResourceType = useCallback((): "cpu" | "memory" | "storage" => {
    if (resourceKey === "cpu") {
      return "cpu";
    }
    if (resourceKey === "memory") {
      return "memory";
    }
    if (resourceKey === "primaryStorage" || resourceKey === "backupStorage") {
      return "storage";
    }
    return "storage";
  }, [resourceKey]);

  const judgeColor = useCallback(() => {
    let color;
    let strokeColor;
    let unitColor;
    if (currentUsedPercent < 60) {
      color = "var(--neutral-800)";
      unitColor = "var(--neutral-700)";
      strokeColor = "#0076F7";
    } else if (currentUsedPercent >= 60 && currentUsedPercent < 80) {
      color = "#FF9000";
      unitColor = "#FF9000";
      strokeColor = "#FF9000";
    } else if (currentUsedPercent >= 80) {
      color = "#FF3F46";
      unitColor = "#FF3F46";
      strokeColor = "#FF3F46";
    } else {
      color = "var(--neutral-800)";
      unitColor = "var(--neutral-700)";
      strokeColor = "#0076F7";
    }
    return { color, unitColor, strokeColor };
  }, [currentUsedPercent]);

  const renderCapacity = useCallback(
    (capacity: number) => {
      if (resourceKey?.includes("Network")) {
        return capacity || 0;
      }
      if (resourceKey === "cpu") {
        if (monitorItem === "allocation") {
          return intl.formatMessage(
            {
              id: "cpuCount.withUnit",
              defaultMessage: "{num} Cores",
            },
            {
              num: capacity || 0,
            },
          );
        }
        return capacity ? `${capacity?.toFixed(2)} GHz` : "0 GHz";
      }
      return capacity ? formatStorage(capacity, 2) : "0 B";
    },
    [resourceKey, monitorItem, intl],
  );

  // 预计算颜色值，避免在 renderPercentValue 中重复调用
  const colorValues = useMemo(() => judgeColor(), [judgeColor]);

  const renderPercentValue = useCallback(
    (percent: number | undefined, fontSize?: [number, number]) => {
      return (
        <div>
          <span
            style={{
              color: colorValues?.color,
              fontSize: fontSize?.[0] ?? "20px",
            }}
          >
            {percent}
          </span>
          <span
            style={{
              color: colorValues?.unitColor,
              fontSize: fontSize?.[1] ?? "12px",
            }}
          >
            %
          </span>
        </div>
      );
    },
    [colorValues],
  );

  const renderCardIcon = useCallback(() => {
    let icon: React.ReactNode;

    switch (resourceKey) {
      case "cpu":
        icon = <Illustration type="cpu" size={24} />;
        break;
      case "memory":
        icon = <Illustration type="memory" size={24} />;
        break;
      case "primaryStorage":
        icon = <Illustration type="equipment" size={24} />;
        break;
      case "backupStorage":
        icon = <Illustration type="auto-scaling" size={24} />;
        break;
    }

    return <div className={style.cardIcon}>{icon}</div>;
  }, [resourceKey]);

  // 资源选择器卡片
  const renderCanSelectResourceCard = ({
    resourceListLoading,
    selectedResourceUuid,
    setSelectedResourceUuid,
    resourceList,
  }: {
    resourceListLoading: boolean;
    selectedResourceUuid: string;
    setSelectedResourceUuid: (uuid: string) => void;
    resourceList: (PrimaryStorage | BackupStorage)[] | undefined;
  }) => {
    if (resourceListLoading) {
      return (
        <AutoSkeleton
          name={`usage-stat-${resourceKey}-select-loading`}
          loading={true}
        >
          <div />
        </AutoSkeleton>
      );
    }
    return (
      <>
        <div className={style.actualUsedHeader} key={selectedResourceUuid}>
          <Text>{label}</Text>
          <Select
            defaultValue={selectedResourceUuid}
            bordered={false}
            onChange={(uuid) => setSelectedResourceUuid(uuid)}
            size="small"
            dropdownWidth="s"
            getPopupContainer={() => document.body}
          >
            <Select.Option value="all" key="all">
              {intl.formatMessage({ id: "all", defaultMessage: "All" })}
            </Select.Option>
            {resourceList?.map((resource: PrimaryStorage | BackupStorage) => (
              <Select.Option value={resource?.uuid} key={resource?.uuid}>
                {intl.formatMessage(
                  {
                    id: "dashboard.ps",
                    defaultMessage: "{ps}",
                  },
                  { ps: resource?.name },
                )}
              </Select.Option>
            ))}
          </Select>
        </div>
        <AutoSkeleton
          name={`usage-stat-${resourceKey}-${monitorItem}-select`}
          loading={isFirstLoad.current && (loading || resourceListLoading)}
        >
          <div className={style.actualUsedCard} key={selectedResourceUuid}>
            <div className={style.leftChart}>
              <Progress
                type="circle"
                percent={currentUsedPercent}
                strokeColor={judgeColor()?.strokeColor}
                strokeWidth={8}
                width={90}
                format={() => renderCardIcon()}
              />
            </div>

            <div className={style.rightCapacity}>
              <div className={style.rightPercent}>
                {renderPercentValue(currentUsedPercent, [24, 14])}
              </div>
              <div className={style.capacity}>
                <div className={style.label}>
                  {intl.formatMessage({ id: "used", defaultMessage: "Used" })}
                </div>
                <div className={style.count}>
                  {renderCapacity(capacityData?.usedCapacity ?? 0)}
                </div>
              </div>
              <div className={style.capacity}>
                <div className={style.label}>
                  {intl.formatMessage({
                    id: "totalAmount",
                    defaultMessage: "Total",
                  })}
                </div>
                <div className={style.count}>
                  {renderCapacity(capacityData?.totalCapacity ?? 0)}
                </div>
              </div>
            </div>
          </div>
        </AutoSkeleton>
      </>
    );
  };

  // 分配比例卡片（使用 Ratio 组件）
  if (
    ["cpu", "memory", "primaryStorage"].includes(resourceKey) &&
    monitorItem === "allocation" &&
    isAdmin
  ) {
    const legendLabels = {
      used: "",
      total: "",
      allocation: "",
    };
    let tooltip;
    switch (resourceKey) {
      case "cpu":
        legendLabels.used = intl.formatMessage({
          id: "vm.vcpu.usedAmout",
          defaultMessage: "Assigned",
        });
        legendLabels.total = intl.formatMessage({
          id: "host.logic.cpu.totalAmount",
          defaultMessage: "Can be configured.",
        });
        legendLabels.allocation = intl.formatMessage({
          id: "cpu.allocation",
          defaultMessage: "Proportional Allocation",
        });
        tooltip = (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "cpu.allocation.tooltip",
              defaultMessage: "",
            })}
          </ReactMarkdown>
        );
        break;
      case "memory":
        legendLabels.used = intl.formatMessage({
          id: "vm.memory.usedAmout",
          defaultMessage: "Already Allocated",
        });
        legendLabels.total = intl.formatMessage({
          id: "host.memory.totalAmount",
          defaultMessage: "Overmolded",
        });
        legendLabels.allocation = intl.formatMessage({
          id: "memory.allocation",
          defaultMessage: "Distribution Ratio",
        });
        tooltip = (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "memory.allocation.tooltip",
              defaultMessage: "",
            })}
          </ReactMarkdown>
        );
        break;
      case "primaryStorage":
        legendLabels.used = intl.formatMessage({
          id: "primaryStorage.usedAmout",
          defaultMessage: "Assigned",
        });
        legendLabels.total = intl.formatMessage({
          id: "primaryStorage.totalAmount",
          defaultMessage: "Adjustable",
        });
        legendLabels.allocation = intl.formatMessage({
          id: "primaryStorage.allocation",
          defaultMessage: "Allocation Ratio",
        });
        tooltip = (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "primaryStorage.allocation.tooltip",
              defaultMessage: "",
            })}
          </ReactMarkdown>
        );
        break;
    }

    return (
      <AutoSkeleton
        name={`usage-stat-${resourceKey}-allocation`}
        loading={isFirstLoad.current && loading}
      >
        <div className={style.allocationCard}>
          <ResourceCapacity.Ratio
            title={{
              label,
              tooltip,
            }}
            resourceType={getResourceType()}
            usedNum={capacityData?.usedCapacity}
            totalNum={capacityData?.totalCapacity}
            overTotalNum={capacityData?.totalCapacity}
            loading={loading}
          />
        </div>
      </AutoSkeleton>
    );
  }

  // primaryStorage 实际使用率（带选择器）
  if (resourceKey === "primaryStorage" && monitorItem === "actualUsedRate") {
    return renderCanSelectResourceCard({
      resourceListLoading: primaryStorageListLoading,
      selectedResourceUuid: selectedPrimaryStorageUuid,
      setSelectedResourceUuid: setSelectedPrimaryStorageUuid,
      resourceList: primaryStorageList,
    });
  }

  // backupStorage 使用率（带选择器）
  if (resourceKey === "backupStorage" && monitorItem === "usedRate") {
    return renderCanSelectResourceCard({
      resourceListLoading: backupStorageListLoading,
      selectedResourceUuid: selectedBackupStorageUuid,
      setSelectedResourceUuid: setSelectedBackupStorageUuid,
      resourceList: backupStorageList,
    });
  }

  // zsv版本 Admin CPU使用率、内存使用率
  if (
    ["cpu", "memory"].includes(resourceKey) &&
    monitorItem === "actualUsedRate" &&
    isAdmin
  ) {
    return (
      <AutoSkeleton
        name={`usage-stat-${resourceKey}-actualUsed`}
        loading={isFirstLoad.current && loading}
      >
        <div className={style.header}>
          <Text>{label}</Text>
        </div>
        <div className={style.actualUsedCard}>
          <div className={style.leftChart}>
            <Progress
              type="circle"
              percent={currentUsedPercent}
              strokeColor={judgeColor()?.strokeColor}
              strokeWidth={8}
              width={90}
              format={() => renderCardIcon()}
            />
          </div>

          <div className={style.rightCapacity}>
            <div className={style.rightPercent}>
              {renderPercentValue(currentUsedPercent, [24, 14])}
            </div>
            {resourceKey === "memory" && (
              <div className={style.capacity}>
                <div className={style.label}>
                  {intl.formatMessage({ id: "used", defaultMessage: "Used" })}
                </div>
                <div className={style.count}>
                  {renderCapacity(capacityData?.usedCapacity ?? 0)}
                </div>
              </div>
            )}
            <div className={style.capacity}>
              <div className={style.label}>
                {intl.formatMessage({
                  id: "totalAmount",
                  defaultMessage: "Total",
                })}
              </div>
              <div className={style.count}>
                {renderCapacity(capacityData?.totalCapacity ?? 0)}
              </div>
            </div>
          </div>
        </div>
      </AutoSkeleton>
    );
  }

  // zsv版本 子账户 CPU分配比、内存分配比
  return (
    <AutoSkeleton
      name={`usage-stat-${resourceKey}-${monitorItem}`}
      loading={isFirstLoad.current && loading}
    >
      <div className={style.header}>
        <Text>{label}</Text>
      </div>
      <div className={style.box}>
        <div className={style.chartTotal}>
          <div className={style.chart}>
            <Progress
              type="circle"
              percent={currentUsedPercent}
              strokeColor={judgeColor()?.strokeColor}
              strokeWidth={16}
              width={48}
            />
          </div>
          <div className={style.percent}>
            {renderPercentValue(currentUsedPercent)}
          </div>
        </div>

        {!(resourceKey === "cpu" && monitorItem === "actualUsedRate") && (
          <div className={style.capacity}>
            <div className={style.label}>
              {intl.formatMessage({ id: "used", defaultMessage: "Used" })}
            </div>
            <div className={style.count}>
              {renderCapacity(capacityData?.usedCapacity ?? 0)}
            </div>
          </div>
        )}
        <div className={style.capacity}>
          <div className={style.label}>
            {intl.formatMessage({ id: "totalAmount", defaultMessage: "Total" })}
          </div>
          <div className={style.count}>
            {renderCapacity(capacityData?.totalCapacity ?? 0)}
          </div>
        </div>
      </div>
    </AutoSkeleton>
  );
});

export default CapacityChart;
