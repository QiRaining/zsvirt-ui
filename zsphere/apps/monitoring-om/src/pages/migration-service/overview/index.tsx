import { gql, useLazyQuery } from "@apollo/client";
import {
  Tabs2 as Tabs,
  TabPane2 as TabPane,
  useSetTab,
} from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { Modal as AntModal } from "antd";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

import { UpgradeModal, UploadVddkDialog } from "../action";
import { OverviewView } from "../components";
import GatewayVmList from "../gateway-vm/list";
import { useMigrationServiceInfo } from "../hooks";
import type { UpgradeTask } from "../types";
import {
  consumeUploadVddkAction,
  shouldOpenUploadVddkDialog,
} from "../vddk/navigation";

import style from "../style.module.less";

const GET_MIGRATION_PACKAGE = gql`
  query getMigrationServicePackage {
    getMigrationServicePackage {
      uuid
      status
    }
  }
`;

const MigrationOverview: React.FC = () => {
  const intl = useIntl();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setTab } = useSetTab();

  const [isUpgradeModalVisible, setIsUpgradeModalVisible] = useState(false);
  const [isRetryUpgrade, setIsRetryUpgrade] = useState(false);
  const [isUploadVddkVisible, setIsUploadVddkVisible] = useState(false);
  const [isVddkUploadRunning, setIsVddkUploadRunning] = useState(false);

  const {
    serviceInfo,
    upgradeTasks,
    hasRunningTask,
    loading,
    fetchServiceInfo,
    startUpgradePolling,
  } = useMigrationServiceInfo();

  const [fetchPackage, { data: packageData }] = useLazyQuery(
    GET_MIGRATION_PACKAGE,
    {
      fetchPolicy: "no-cache",
      errorPolicy: "ignore",
    },
  );
  const softwarePackageUuid = packageData?.getMigrationServicePackage?.uuid;
  const softwarePackageStatus = packageData?.getMigrationServicePackage
    ?.status as string | undefined;

  // 初始加载
  useEffect(() => {
    fetchServiceInfo();
    fetchPackage();
  }, [fetchServiceInfo, fetchPackage]);

  // 当升级任务从 running 变为终态（failed/success）时，重新拉取 softwarePackageStatus，
  // 避免 getEffectiveUpgradeTask 因 stale 的 softwarePackageStatus 误判为仍在升级中
  const hadRunningUpgradeRef = useRef(false);
  useEffect(() => {
    const hasRunning = upgradeTasks.some((t) => t.status === "running");
    if (hadRunningUpgradeRef.current && !hasRunning) {
      fetchPackage();
    }
    hadRunningUpgradeRef.current = hasRunning;
  }, [upgradeTasks, fetchPackage]);

  // 通过 URL 参数切换 Tab（如从 VM 列表点击迁移网关虚拟机名称跳转过来）
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setTab("migration-service-tab", tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUploadVddk = useCallback(() => {
    if (isVddkUploadRunning) {
      AntModal.warning({
        title: intl.formatMessage({
          id: "migration.vddk.upload.running.title",
          defaultMessage: "Unable to Upload VDDK",
        }),
        content: intl.formatMessage({
          id: "migration.vddk.upload.running.content",
          defaultMessage:
            "A VDDK upload task is already running. Wait for it to finish and try again.",
        }),
        okText: intl.formatMessage({
          id: "confirm",
          defaultMessage: "OK",
        }),
      });
      return;
    }
    setIsUploadVddkVisible(true);
  }, [intl, isVddkUploadRunning]);

  useEffect(() => {
    if (!shouldOpenUploadVddkDialog(searchParams)) {
      return;
    }
    setTab("migration-service-tab", "overview");
    handleUploadVddk();
    setSearchParams(consumeUploadVddkAction(searchParams), { replace: true });
  }, [handleUploadVddk, searchParams, setSearchParams, setTab]);

  const handleMigrationServiceActionFinish = useCallback(() => {
    setIsVddkUploadRunning(false);
    fetchServiceInfo();
  }, [fetchServiceInfo]);

  useActionSubscribe({
    resourceTypeList: ["MigrationService"],
    onFinish: handleMigrationServiceActionFinish,
  });

  const handleUpgrade = useCallback(() => {
    if (hasRunningTask) {
      AntModal.warning({
        title: intl.formatMessage({
          id: "migration.upgrade.blocked.title",
          defaultMessage: "Cannot Upgrade Migration Service",
        }),
        content: intl.formatMessage({
          id: "migration.upgrade.blocked.content",
          defaultMessage:
            "A migration task is currently in progress. The migration service cannot be upgraded. Wait for the current migration task to complete and try again.",
        }),
        okText: intl.formatMessage({
          id: "confirm",
          defaultMessage: "OK",
        }),
      });
      return;
    }
    setIsRetryUpgrade(false);
    setIsUpgradeModalVisible(true);
  }, [hasRunningTask, intl]);

  const handleRetryUpgrade = useCallback((_task: UpgradeTask) => {
    setIsRetryUpgrade(true);
    setIsUpgradeModalVisible(true);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchServiceInfo();
    fetchPackage();
  }, [fetchServiceInfo, fetchPackage]);

  return (
    <>
      <Tabs
        type="line"
        className={style.tabs}
        contentId="migration-service-tab"
      >
        <TabPane
          tab={intl.formatMessage({
            id: "migration.tab.overview",
            defaultMessage: "Migration Overview",
          })}
          key="overview"
        >
          <OverviewView
            serviceInfo={serviceInfo}
            upgradeTasks={upgradeTasks}
            softwarePackageStatus={softwarePackageStatus}
            loading={loading}
            onRefresh={handleRefresh}
            onUpgrade={handleUpgrade}
            onRetryUpgrade={handleRetryUpgrade}
            onUploadVddk={handleUploadVddk}
            uploadVddkDisabled={isVddkUploadRunning}
          />
        </TabPane>
        <TabPane
          tab={intl.formatMessage({
            id: "migration.tab.service",
            defaultMessage: "Service Management",
          })}
          key="service"
        >
          <GatewayVmList view="main" />
        </TabPane>
      </Tabs>

      {isUpgradeModalVisible && (
        <UpgradeModal
          visible={isUpgradeModalVisible}
          setVisible={setIsUpgradeModalVisible}
          serviceVersion={serviceInfo?.version}
          onActionStartPolling={startUpgradePolling}
          isRetry={isRetryUpgrade}
          softwarePackageUuid={softwarePackageUuid}
          softwarePackageStatus={softwarePackageStatus}
        />
      )}
      {isUploadVddkVisible && (
        <UploadVddkDialog
          visible={isUploadVddkVisible}
          setVisible={setIsUploadVddkVisible}
          onUploadStart={() => setIsVddkUploadRunning(true)}
        />
      )}
    </>
  );
};

export default MigrationOverview;
