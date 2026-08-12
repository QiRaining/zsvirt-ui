import { useQuery } from "@apollo/client";
import { Text, Spin, Divider } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { queryHostForZSVPrimarystorageDetail } from "@zstack/virtualization-resource/src/gql/host.gql";
import { Status } from "@zstack/virtualization-resource/src/pages/host/components";
import { ResourceCapacity, Empty } from "@zstack/zsphere-components";
import { HostStatus, Op, PrimaryStorageStatus } from "@zstack/zsphere-types";
import type {
  HostVO as IHost,
  PrimaryStorageVO as IPrimaryStorage,
  LocalStorageHostCapacity as ILocalStorageHostCapacity,
} from "@zstack/zsphere-types/graphql";
import { formatPercent } from "@zstack/zsphere-utils";
import { Space, Collapse } from "antd";
import { floor } from "lodash-es";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import styles from "./style.module.less";

interface IProps {
  detail: IPrimaryStorage;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const colFlexAlignCenterStyle = {
  display: "flex",
  alignItems: "center",
  minWidth: 0,
} as const;
const divMinWidthStyle = { minWidth: 0 } as const;
const spaceFullWidthStyle = { width: "100%" } as const;
const spaceFlexStyle = { display: "flex" } as const;

const SingleMachineStoragePool: React.FC<IProps> = ({ detail }) => {
  const intl = useIntl();
  const isPsConnected = detail.status === PrimaryStorageStatus.Connected;

  const { data: hostData, loading } = useQuery(
    queryHostForZSVPrimarystorageDetail,
    {
      variables: {
        primaryStorageUuid: detail?.uuid,
        conditions: [
          {
            key: "cluster.primaryStorage.uuid",
            op: Op.eq,
            value: detail?.uuid,
          },
        ],
      },
    },
  );

  const hostList = useMemo(() => hostData?.hostList?.list || [], [hostData]);

  const getStoragePercentage = (storageData: ILocalStorageHostCapacity) => {
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
        loading={loading}
        reservedNum={reservedNum}
        isEmpty={!isPsConnected}
      />
    );
  };

  const getStorageRatio = (storageData: ILocalStorageHostCapacity) => {
    const {
      availableCapacity: availableNum,
      totalPhysicalCapacity: overTotalNum = 0,
      totalCapacity: totalNum = 0,
      reservedCapacity: reservedNum = 0,
      volumeSnapshotSize: snapshotNum = 0,
      imageCacheSize: imageNum = 0,
      vmTemplateVolumeCacheSize: vmTemplateCacheNum = 0,
      volumeSize: diskNum = 0,
      overProvisioningPrimaryStorage: overProvisioning = 1,
      systemUsedCapacity: systemUsedNum = 0,
    } = storageData;

    return (
      <ResourceCapacity.Ratio
        title={intl.formatMessage({
          id: "primaryStorage.ratio",
          defaultMessage: "Storage Allocation Ratio",
        })}
        resourceType="storage"
        isLocal={true}
        availableNum={availableNum}
        totalNum={totalNum}
        overTotalNum={overTotalNum}
        reservedNum={reservedNum}
        snapshotNum={snapshotNum}
        imageNum={imageNum}
        vmTemplateCacheNum={vmTemplateCacheNum}
        diskNum={diskNum}
        loading={loading}
        isEmpty={!isPsConnected}
        overProvisioning={overProvisioning}
        systemUsedNum={systemUsedNum}
      />
    );
  };

  const getStorageDistribution = (storageData: ILocalStorageHostCapacity) => {
    const {
      availableCapacity: availableNum,
      totalPhysicalCapacity: overTotalNum = 0,
      totalCapacity: totalNum = 0,
      reservedCapacity: reservedNum = 0,
      volumeSnapshotSize: snapshotNum = 0,
      imageCacheSize: imageNum = 0,
      vmTemplateVolumeCacheSize: vmTemplateCacheNum = 0,
      volumeSize: diskNum = 0,
      overProvisioningPrimaryStorage: overProvisioning = 1,
      systemUsedCapacity: systemUsedNum = 0,
    } = storageData;

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
        loading={loading}
        isEmpty={!isPsConnected}
        overProvisioning={overProvisioning}
        isLocal={true}
        systemUsedNum={systemUsedNum}
      />
    );
  };

  const list = useMemo(() => {
    return hostList?.map((item: IHost) => {
      const {
        totalPhysicalCapacity: totalNum = 0,
        availablePhysicalCapacity: availableNum = 0,
      } = item.localStorageHostCapacity || {};

      const isConnected: boolean = item.status === HostStatus.Connected;
      const usedNum: number = totalNum - availableNum;

      const headerEle = (
        <div className="flex flex-nowrap">
          <div style={{ flex: "0 1 50%" }}>
            <Text>{item.name}</Text>
          </div>
          <div style={{ ...colFlexAlignCenterStyle, flex: "0 1 50%" }}>
            <Status className={styles.status} status={item.status!} />
            <span className={styles.delimiter} />
            <div style={divMinWidthStyle}>
              <Text>
                {intl.formatMessage(
                  {
                    id: "storage.usage.percentage",
                    defaultMessage: `Storage Utilization: {usedPercentage}`,
                  },
                  {
                    usedPercentage: isConnected
                      ? formatPercent((100 * usedNum) / totalNum)
                      : " - ",
                  },
                )}
              </Text>
            </div>
          </div>
        </div>
      );

      const contentEle = isConnected ? (
        <div className={`flex flex-nowrap gap-10 ${"row-with-divider"}`}>
          <div style={{ flex: "0 1 50%" }}>
            <Space direction="vertical" size={16} style={spaceFullWidthStyle}>
              {getStoragePercentage(item?.localStorageHostCapacity)}
              {getStorageRatio(item?.localStorageHostCapacity)}
            </Space>
          </div>
          <div style={{ flex: "0 1 50%" }}>
            {getStorageDistribution(item?.localStorageHostCapacity)}
          </div>
        </div>
      ) : (
        <Empty type="Select" className={styles.empty} />
      );

      return (
        <Collapse
          bordered={true}
          className={styles.collapse}
          key={item.uuid}
          expandIcon={({ isActive }) => (
            <div>
              <Icon
                color="neutral"
                colorNumber={600}
                type={isActive ? "arrow-ios-down" : "arrow-ios-right"}
              />
            </div>
          )}
        >
          <Collapse.Panel
            className={styles.collapsePanel}
            header={headerEle}
            key={item.uuid}
          >
            {contentEle}
          </Collapse.Panel>
        </Collapse>
      );
    });
  }, [hostList, intl]);

  return (
    <Spin spinning={loading} fullscreen={false} className="block w-full">
      <Space direction="vertical" style={spaceFlexStyle}>
        {list}
      </Space>
    </Spin>
  );
};

export default SingleMachineStoragePool;
