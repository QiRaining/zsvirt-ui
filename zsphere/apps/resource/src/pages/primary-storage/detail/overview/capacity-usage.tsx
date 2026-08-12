import { InfoPopover, Tooltip, Divider } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { DraggableCard, Alert } from "@zstack/zsphere-components";
import {
  ResourceCapacity,
  usePrimaryStorageCapacity,
  Radio,
} from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { PrimaryStorageStatus } from "@zstack/zsphere-types";
import type { PrimaryStorageVO as IPrimaryStorage } from "@zstack/zsphere-types/graphql";
import { formatTime } from "@zstack/zsphere-utils";
import { Space } from "antd";
import { floor } from "lodash-es";
import React, { useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import SingleMachineStoragePool from "./singleMachineStoragePool";

import styles from "./style.module.less";

const spaceFullWidthStyle = { width: "100%" } as const;
const colFlexMinWidthStyle = { minWidth: "auto" } as const;
const flexCenterStyle = { display: "flex", alignItems: "center" } as const;
const alertMarginStyle = { marginBottom: 12 } as const;
const rowMarginStyle = { marginBottom: 16 } as const;
const colPaddingRightStyle = { paddingRight: 0 } as const;
const colTextRightStyle = { textAlign: "right" } as const;

interface IProps {
  detail: IPrimaryStorage;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

enum StorageType {
  totalStoragePool = "totalStoragePool",
  singleMachineStoragePool = "singleMachineStoragePool",
}

const CapacityUsage: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();

  const isPsConnected = detail.status === PrimaryStorageStatus.Connected;
  const isLocalPrimaryStorage = detail.type === "LocalStorage";

  const [storageType, setStorageType] = useState<StorageType>(
    StorageType.totalStoragePool,
  );

  useEffect(() => {
    setStorageType(StorageType.totalStoragePool);
  }, [detail.uuid]);

  const {
    data: storageData,
    loading: storageLoading,
    refetch: storageRefetch,
  } = usePrimaryStorageCapacity({
    primaryStorageUuids: [detail.uuid],
  });

  const handleRefresh = () => {
    storageRefetch();
  };

  useActionSubscribe({
    resourceTypeList: ["ResourceConfigInPage"],
    onFinish: () => {
      handleRefresh();
    },
  });

  const StoragePercentage = useMemo(() => {
    const {
      totalPhysicalCapacity: totalNum = 0,
      availablePhysicalCapacity: availableNum = 0,
      reservedPhysicalCapacity: reservedNum = 0,
    } = storageData;

    const usedNum = totalNum - availableNum;

    return (
      <ResourceCapacity.Percentage
        title={intl.formatMessage({
          id: "primaryStorage.usage",
          defaultMessage: "Storage Utilization",
        })}
        resourceType="storage"
        usedNum={usedNum}
        totalNum={totalNum}
        reservedNum={reservedNum}
        loading={storageLoading}
        isEmpty={!isPsConnected}
      />
    );
  }, [intl, isPsConnected, storageData, storageLoading]);

  const StorageRatio = useMemo(() => {
    const {
      availableCapacity = 0,
      availablePhysicalCapacity: availablePhysicalNum = 0,
      totalPhysicalCapacity: overTotalNum = 0,
      totalCapacity: totalNum = 0,
      reservedCapacity: reservedNum = 0,
      volumeSnapshotSize: snapshotNum = 0,
      imageCacheSize: imageNum = 0,
      volumeSize: diskNum = 0,
      systemUsedCapacity = 0,
      vmTemplateVolumeCacheSize: vmTemplateCacheNum = 0,
      overProvisioningPrimaryStorage: overProvisioning = 1,
    } = storageData;

    const availableNum =
      detail.type === "Ceph" ? availablePhysicalNum : availableCapacity;
    const systemUsedNum = isLocalPrimaryStorage ? systemUsedCapacity : 0;

    return (
      <ResourceCapacity.Ratio
        title={intl.formatMessage({
          id: "primaryStorage.ratio",
          defaultMessage: "Storage Allocation Ratio",
        })}
        resourceType="storage"
        availableNum={availableNum}
        totalNum={totalNum}
        overTotalNum={overTotalNum}
        reservedNum={reservedNum}
        snapshotNum={snapshotNum}
        imageNum={imageNum}
        vmTemplateCacheNum={vmTemplateCacheNum}
        diskNum={diskNum}
        systemUsedNum={systemUsedNum}
        loading={storageLoading}
        isEmpty={!isPsConnected}
        overProvisioning={overProvisioning}
        isLocal={isLocalPrimaryStorage}
      />
    );
  }, [
    detail.type,
    intl,
    isLocalPrimaryStorage,
    isPsConnected,
    storageData,
    storageLoading,
  ]);

  const StorageDistribution = useMemo(() => {
    const {
      availableCapacity = 0,
      availablePhysicalCapacity: availablePhysicalNum = 0,
      totalPhysicalCapacity: overTotalNum = 0,
      totalCapacity: totalNum = 0,
      reservedCapacity: reservedNum = 0,
      volumeSnapshotSize: snapshotNum = 0,
      imageCacheSize: imageNum = 0,
      volumeSize: diskNum = 0,
      vmTemplateVolumeCacheSize: vmTemplateCacheNum = 0,
      systemUsedCapacity = 0,
      overProvisioningPrimaryStorage: overProvisioning = 1,
    } = storageData;

    const availableNum =
      detail.type === "Ceph" ? availablePhysicalNum : availableCapacity;
    const systemUsedNum = isLocalPrimaryStorage ? systemUsedCapacity : 0;

    return (
      <ResourceCapacity.Distribution
        title={{
          label: intl.formatMessage({
            id: "primaryStorage.distribution",
            defaultMessage: "Storage Distribution",
          }),
          extra: (
            <Space split={<Divider type="vertical" />}>
              <span>
                {intl.formatMessage({
                  id: "overallocation.ratio",
                  defaultMessage: "Overcommit Ratio",
                })}{" "}
                {`${floor(overProvisioning, 2)} : 1`}
              </span>
              {!isLocalPrimaryStorage && <ResourceCapacity.Rule showStorage />}
            </Space>
          ),
        }}
        resourceType="storage"
        availableNum={availableNum}
        totalNum={totalNum}
        overTotalNum={overTotalNum}
        reservedNum={reservedNum}
        snapshotNum={snapshotNum}
        imageNum={imageNum}
        vmTemplateCacheNum={vmTemplateCacheNum}
        diskNum={diskNum}
        systemUsedNum={systemUsedNum}
        loading={storageLoading}
        isEmpty={!isPsConnected}
        overProvisioning={overProvisioning}
        isLocal={isLocalPrimaryStorage}
      />
    );
  }, [
    detail.type,
    intl,
    isLocalPrimaryStorage,
    isPsConnected,
    storageData,
    storageLoading,
  ]);

  const renderStoragePoolInfo = useMemo(() => {
    switch (storageType) {
      case StorageType.totalStoragePool:
        return (
          <div className={`flex flex-nowrap gap-10 ${"row-with-divider"}`}>
            <div style={{ flex: "0 1 50%" }}>
              <Space direction="vertical" size={16} style={spaceFullWidthStyle}>
                {StoragePercentage}
                {StorageRatio}
              </Space>
            </div>
            <div style={{ ...colFlexMinWidthStyle, flex: "0 1 50%" }}>
              {StorageDistribution}
            </div>
          </div>
        );
      case StorageType.singleMachineStoragePool:
        return <SingleMachineStoragePool detail={detail} />;
      default:
        return null;
    }
  }, [
    StorageDistribution,
    StoragePercentage,
    StorageRatio,
    detail,
    storageType,
  ]);

  return (
    <DraggableCard
      title={
        <Space size={4} align="center">
          <span>
            {intl.formatMessage({
              id: "storage.info",
              defaultMessage: "Capacity Info",
            })}
          </span>
          <InfoPopover
            content={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "ps.storage.info.tooltip",
                  defaultMessage:
                    "# 容量信息\n" +
                    "## 一、存储使用率\n" +
                    "展示该数据存储的存储资源总量以及使用情况。\n" +
                    "## 二、存储分配比\n" +
                    "1. 分配比 = 已分配 : 可超配总量\n" +
                    "2. 可超配总量 = 物理总量 - 保留物理容量\n" +
                    "3. 可分配总量 = 可超配总量 * 超配比\n" +
                    "4. 剩余可分配 = 可分配总量 - 已分配\n" +
                    "## 三、存储分布\n" +
                    "展示该数据存储超配后存储资源分布情况。详细分布可参考分布规则。",
                })}
              </ReactMarkdown>
            }
          />
        </Space>
      }
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
      extra={
        <Space size={12}>
          <span>
            {intl.formatMessage({
              id: "updateTime",
              defaultMessage: "Updated at",
            })}
            : {formatTime(storageData.timestamp!)}
          </span>
          <div style={flexCenterStyle}>
            <Tooltip
              title={intl.formatMessage({
                id: "refresh",
                defaultMessage: "Refresh",
              })}
            >
              <Icon
                type="refresh"
                onClick={handleRefresh}
                className="action-icon"
              />
            </Tooltip>
          </div>
        </Space>
      }
    >
      <div className="zsv-capacity-container">
        {!isPsConnected && (
          <Alert
            type="warning"
            message={intl.formatMessage({
              id: "ps.resource.section.warning",
              defaultMessage:
                "The capacity information may be inaccurate if the data storage is disconnected or connecting. Check again when the data storage is connected.",
            })}
            display="blockStrong"
            closable={true}
            style={alertMarginStyle}
          />
        )}

        {isLocalPrimaryStorage && (
          <div className="flex flex-nowrap gap-10" style={rowMarginStyle}>
            <div style={{ ...colPaddingRightStyle, flex: "0 1 50%" }}>
              <Space direction="vertical" size={16} style={spaceFullWidthStyle}>
                <Radio.Group
                  defaultValue={StorageType.totalStoragePool}
                  onChange={(e) => setStorageType(e.target.value)}
                >
                  <Radio.Button value="totalStoragePool">
                    {intl.formatMessage({
                      id: "total.storage.pool",
                      defaultMessage: "Total",
                    })}
                  </Radio.Button>
                  <Radio.Button value="singleMachineStoragePool">
                    {intl.formatMessage({
                      id: "single.machine.storage.pool",
                      defaultMessage: "Each Host",
                    })}
                  </Radio.Button>
                </Radio.Group>
              </Space>
            </div>

            <div style={{ ...colTextRightStyle, flex: "0 1 50%" }}>
              <ResourceCapacity.Rule showStorage />
            </div>
          </div>
        )}

        {renderStoragePoolInfo}
      </div>
    </DraggableCard>
  );
};

export default CapacityUsage;
