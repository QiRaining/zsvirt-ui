import { Button } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import {
  State,
  List,
  type ListItem,
  DraggableCard,
  Spin,
} from "@zstack/zsphere-components";
import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import type { MigrationServiceInfo, UpgradeTask } from "../types";
import { getEffectiveUpgradeTask } from "../upgrade-status";
import { getVddkStatus } from "../vddk/status";

interface BasicInfoCardProps {
  serviceInfo?: MigrationServiceInfo;
  upgradeTasks?: UpgradeTask[];
  softwarePackageStatus?: string;
  loading?: boolean;
  onUpgrade?: () => void;
  onRetryUpgrade?: (task: UpgradeTask) => void;
  onUploadVddk?: () => void;
  uploadVddkDisabled?: boolean;
}

const BasicInfoCard: React.FC<BasicInfoCardProps> = ({
  serviceInfo,
  upgradeTasks = [],
  softwarePackageStatus,
  loading = false,
  onUpgrade,
  onRetryUpgrade,
  onUploadVddk,
  uploadVddkDisabled = false,
}) => {
  const intl = useIntl();
  const { getServerTime } = useTime();

  const renderStatusBadge = useCallback(
    (status: MigrationServiceInfo["status"] | undefined) => {
      if (status === "Running") {
        return (
          <State
            prefix="dot"
            type="success"
            name={intl.formatMessage({
              id: "enabled",
              defaultMessage: "Enabled",
            })}
          />
        );
      }
      if (status === "Stopped") {
        return (
          <State
            prefix="dot"
            type="error"
            name={intl.formatMessage({
              id: "disabled",
              defaultMessage: "Disabled",
            })}
          />
        );
      }

      return (
        <State
          prefix="dot"
          type="unknown"
          name={intl.formatMessage({
            id: "unknown",
            defaultMessage: "Unknown",
          })}
        />
      );
    },
    [intl],
  );

  const renderTaskStatus = useCallback(
    (status: UpgradeTask["status"]) => {
      switch (status) {
        case "running":
          return (
            <State
              type="progress"
              name={intl.formatMessage({
                id: "ongoing",
                defaultMessage: "Ongoing",
              })}
            />
          );
        case "failed":
          return (
            <State
              type="error"
              name={intl.formatMessage({
                id: "fail",
                defaultMessage: "Failed",
              })}
            />
          );
        case "success":
          return (
            <State
              type="success"
              name={intl.formatMessage({
                id: "success",
                defaultMessage: "Succeeded",
              })}
            />
          );
        default:
          return null;
      }
    },
    [intl],
  );

  const effectiveUpgradeTask = useMemo(
    () =>
      getEffectiveUpgradeTask({
        serviceVersion: serviceInfo?.version,
        softwarePackageStatus,
        upgradeTasks,
      }),
    [serviceInfo?.version, softwarePackageStatus, upgradeTasks],
  );

  const renderVersionValue = useMemo(() => {
    const version = serviceInfo?.version ?? "-";

    // 升级进行中：版本号 | 任务状态：进行中
    if (effectiveUpgradeTask?.status === "running") {
      return (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span>{version}</span>
          <span
            style={{
              width: 1,
              height: 14,
              background: "var(--neutral-300, #d9d9d9)",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              whiteSpace: "nowrap",
            }}
          >
            {intl.formatMessage({
              id: "jobState",
              defaultMessage: "Job Status",
            })}
            ：{renderTaskStatus("running")}
          </span>
        </span>
      );
    }

    // 升级失败：版本号 | 任务状态：失败 | 重新升级
    if (effectiveUpgradeTask?.status === "failed") {
      return (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span>{version}</span>
          <span
            style={{
              width: 1,
              height: 14,
              background: "var(--neutral-300, #d9d9d9)",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              whiteSpace: "nowrap",
            }}
          >
            {intl.formatMessage({
              id: "jobState",
              defaultMessage: "Job Status",
            })}
            ：{renderTaskStatus("failed")}
          </span>
          <Button
            variant="link"
            onClick={() => onRetryUpgrade?.(effectiveUpgradeTask)}
            style={{ padding: 0, height: "auto", whiteSpace: "nowrap" }}
          >
            {intl.formatMessage({
              id: "migration.retry.upgrade",
              defaultMessage: "Reupgrade",
            })}
          </Button>
        </span>
      );
    }

    // 正常状态：版本号 | 升级
    return (
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <span>{version}</span>
        <span
          style={{
            width: 1,
            height: 14,
            background: "var(--neutral-300, #d9d9d9)",
            flexShrink: 0,
          }}
        />
        <Button
          variant="link"
          onClick={onUpgrade}
          style={{ padding: 0, height: "auto", whiteSpace: "nowrap" }}
        >
          {intl.formatMessage({
            id: "migration.upgrade",
            defaultMessage: "Upgrade",
          })}
        </Button>
      </span>
    );
  }, [
    serviceInfo,
    effectiveUpgradeTask,
    intl,
    renderTaskStatus,
    onUpgrade,
    onRetryUpgrade,
  ]);

  const renderVddkValue = useMemo(() => {
    const status = getVddkStatus(serviceInfo?.vddkUploaded);
    const statusName =
      status.key === "uploaded"
        ? intl.formatMessage({
            id: "migration.vddk.uploaded",
            defaultMessage: "Uploaded",
          })
        : status.key === "missing"
          ? intl.formatMessage({
              id: "migration.vddk.not.uploaded",
              defaultMessage: "Not Uploaded",
            })
          : intl.formatMessage({
              id: "unknown",
              defaultMessage: "Unknown",
            });

    return (
      <span className="inline-flex items-center gap-2">
        <State prefix="dot" type={status.state} name={statusName} />
        {status.key === "missing" && (
          <>
            <span
              data-testid="vddk-action-divider"
              style={{
                width: 1,
                height: 14,
                background: "var(--neutral-300, #d9d9d9)",
                flexShrink: 0,
              }}
            />
            <Button
              variant="link"
              className="h-min p-0"
              disabled={uploadVddkDisabled}
              onClick={onUploadVddk}
            >
              {intl.formatMessage({
                id: "migration.vddk.go.upload",
                defaultMessage: "Go to Upload",
              })}
            </Button>
          </>
        )}
      </span>
    );
  }, [intl, onUploadVddk, serviceInfo?.vddkUploaded, uploadVddkDisabled]);

  const infoItems: ListItem[] = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "migration.basic.status",
          defaultMessage: "Status",
        }),
        value: renderStatusBadge(serviceInfo?.status),
      },
      {
        label: intl.formatMessage({
          id: "version",
          defaultMessage: "Version",
        }),
        value: renderVersionValue,
      },
      {
        label: intl.formatMessage({
          id: "migration.vddk.label",
          defaultMessage: "VDDK",
        }),
        value: renderVddkValue,
      },
      {
        label: intl.formatMessage({
          id: "migration.source.platform.count",
          defaultMessage: "Source Platform",
        }),
        value: serviceInfo?.platformCount,
      },
      {
        label: intl.formatMessage({
          id: "migration.gateway.count",
          defaultMessage: "Data Gateway",
        }),
        value: serviceInfo?.gatewayCount,
      },
      {
        label: intl.formatMessage({
          id: "migration.task.count",
          defaultMessage: "Migration Task",
        }),
        value: serviceInfo?.taskCount,
      },
      {
        label: intl.formatMessage({
          id: "migration.start.time",
          defaultMessage: "Start Time",
        }),
        value: serviceInfo?.startTime
          ? getServerTime(serviceInfo.startTime).format("YYYY-MM-DD HH:mm:ss")
          : "-",
      },
    ],
    [
      intl,
      serviceInfo,
      renderStatusBadge,
      renderVersionValue,
      renderVddkValue,
      getServerTime,
    ],
  );

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "migration.basic.info",
        defaultMessage: "Basic Info",
      })}
      isList
      collapsed={false}
    >
      <div style={{ position: "relative", minHeight: 120 }}>
        <List list={infoItems} bordered={false} />
        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255, 255, 255, 0.6)",
              zIndex: 1,
            }}
          >
            <Spin spinning />
          </div>
        )}
      </div>
    </DraggableCard>
  );
};

export default BasicInfoCard;
