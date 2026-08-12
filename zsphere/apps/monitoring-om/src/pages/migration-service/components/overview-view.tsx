import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import {
  ResponsiveDndCardsLayout,
  IDraggableCardProps,
} from "@zstack/zsphere-components";
import { IActionWrapperProps, Item, ProfileType } from "@zstack/zsphere-types";
import React, { useCallback, useState, useMemo } from "react";
import { useIntl } from "react-intl";

import { useGatewayVmPowerActionOptions } from "../gateway-vm/config/useActionConfig";
import type { MigrationServiceInfo, UpgradeTask } from "../types";
import BasicInfoCard from "./basic-info-card";
import ConfigInfoCard from "./config-info-card";
import { MigrationGuide } from "./flow-chart";
import VddkWarningBanner from "../vddk/components/warning-banner";

import style from "./style.module.less";

interface MigrationOverviewProps {
  serviceInfo?: MigrationServiceInfo;
  upgradeTasks?: UpgradeTask[];
  softwarePackageStatus?: string;
  loading?: boolean;
  onRefresh?: () => void;
  onUpgrade?: () => void;
  onRetryUpgrade?: (task: UpgradeTask) => void;
  onUploadVddk?: () => void;
  uploadVddkDisabled?: boolean;
}

const MigrationOverview: React.FC<MigrationOverviewProps> = ({
  serviceInfo,
  upgradeTasks = [],
  softwarePackageStatus,
  loading = false,
  onRefresh,
  onUpgrade,
  onRetryUpgrade,
  onUploadVddk,
  uploadVddkDisabled = false,
}) => {
  const intl = useIntl();
  const [isGuideVisible, setIsGuideVisible] = useState(false);
  const [isDisableVisible, setIsDisableVisible] = useState(false);

  const gatewayVmItem = useMemo<Item | undefined>(
    () =>
      serviceInfo?.firstGatewayVm?.uuid
        ? (serviceInfo.firstGatewayVm as unknown as Item)
        : undefined,
    [serviceInfo?.firstGatewayVm],
  );

  const powerActions = useGatewayVmPowerActionOptions({ onFinish: onRefresh });
  const enableAction = powerActions.find((action) => action.key === "enabled");
  const disableAction = powerActions.find((action) => action.key === "disable");
  const DisableActionWrapper = disableAction?.ActionWrapper as
    | React.FC<IActionWrapperProps<Item>>
    | undefined;

  const isActionDisabled = useCallback(
    (action?: (typeof powerActions)[number]) => {
      if (!gatewayVmItem || !action) return true;
      return !action.validators?.every((validator) => validator(gatewayVmItem));
    },
    [gatewayVmItem],
  );

  const enableDisabled = isActionDisabled(enableAction);
  const disableDisabled = isActionDisabled(disableAction);

  const handleEnable = useCallback(() => {
    if (!gatewayVmItem || enableDisabled) return;
    enableAction?.onClick?.({
      selectedList: [gatewayVmItem],
      setSelectedList: () => undefined,
      refetch: onRefresh,
    });
  }, [enableAction, enableDisabled, gatewayVmItem, onRefresh]);

  const handleDisable = useCallback(() => {
    if (!gatewayVmItem || disableDisabled) return;
    setIsDisableVisible(true);
  }, [disableDisabled, gatewayVmItem]);

  const dataSet = useMemo(() => {
    return {
      basicInfo: {
        resourceKey: "basicInfo",
        x: 0,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <BasicInfoCard
            serviceInfo={serviceInfo}
            upgradeTasks={upgradeTasks}
            softwarePackageStatus={softwarePackageStatus}
            loading={loading}
            onUpgrade={onUpgrade}
            onRetryUpgrade={onRetryUpgrade}
            onUploadVddk={onUploadVddk}
            uploadVddkDisabled={uploadVddkDisabled}
            {...props}
          />
        ),
      },
      configInfo: {
        resourceKey: "configInfo",
        x: 1,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <ConfigInfoCard
            firstGatewayVm={serviceInfo?.firstGatewayVm}
            loading={loading}
            {...props}
          />
        ),
      },
    };
  }, [
    serviceInfo,
    upgradeTasks,
    softwarePackageStatus,
    loading,
    onUpgrade,
    onRetryUpgrade,
    onUploadVddk,
    uploadVddkDisabled,
  ]);

  return (
    <div className={style["overview-container"]}>
      {serviceInfo?.vddkUploaded === false && (
        <VddkWarningBanner
          onUpload={onUploadVddk}
          uploadDisabled={uploadVddkDisabled}
        />
      )}
      <div className={style["overview-toolbar"]}>
        <div className={style["overview-left-actions"]}>
          <Button
            variant="secondary"
            icon={<Icon type="refresh" />}
            onClick={onRefresh}
          />
          <div className={style["overview-actions"]}>
            <Button
              variant="secondary"
              disabled={enableDisabled}
              onClick={handleEnable}
            >
              {intl.formatMessage({
                id: "enabled",
                defaultMessage: "Enabled",
              })}
            </Button>

            <Button
              variant="secondary"
              disabled={disableDisabled}
              onClick={handleDisable}
            >
              {intl.formatMessage({
                id: "disable",
                defaultMessage: "Disable",
              })}
            </Button>
          </div>
        </div>
        <Button
          variant="link"
          className={style.extraBtn}
          onClick={() => setIsGuideVisible(!isGuideVisible)}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {isGuideVisible ? <Icon type="eye-off" /> : <Icon type="eye" />}
            {isGuideVisible
              ? intl.formatMessage({
                  id: "hide.guide",
                  defaultMessage: "Hide Tips",
                })
              : intl.formatMessage({
                  id: "view.guide",
                  defaultMessage: "Show Tips",
                })}
          </span>
        </Button>
      </div>

      {isGuideVisible && <MigrationGuide />}
      {DisableActionWrapper && gatewayVmItem && (
        <DisableActionWrapper
          view="main"
          position="toolbar"
          visible={isDisableVisible}
          setVisible={setIsDisableVisible}
          selectedList={[gatewayVmItem]}
          setSelectedList={() => undefined}
          refetch={onRefresh}
        />
      )}

      <ResponsiveDndCardsLayout
        profileType={ProfileType.OverviewLayoutConfig}
        resourceType="zmigrate-service"
        cols={2}
        dataSet={dataSet}
      />
    </div>
  );
};

export default MigrationOverview;
