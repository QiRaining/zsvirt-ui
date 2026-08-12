import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@zstack/design";
import { Icon } from "@zstack/icon";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { useIntl } from "react-intl";

import type {
  DisasterRecoveryServicePrimaryAction,
  DisasterRecoveryServiceState,
} from "../types";
import {
  getPrimaryActionLabel,
  getServiceStatusClassName,
  getServiceStatusLabel,
} from "./formatters";
import { StatusBadge } from "./status-badge";

interface ServiceOverviewCardProps {
  service: DisasterRecoveryServiceState;
  primaryAction: DisasterRecoveryServicePrimaryAction;
  onPrimaryAction: () => void;
  onRecheck: () => void;
  onViewTasks: () => void;
  onClearService: () => void;
}

interface OverviewInfoItem {
  label: string;
  value: ReactNode;
}

interface OverviewInfoCardProps {
  title: string;
  items: OverviewInfoItem[];
}

function formatEmptyValue(value?: string | null) {
  return value?.trim().length ? value : "-";
}

function OverviewInfoCard({ title, items }: OverviewInfoCardProps) {
  return (
    <Card className="bg-neutral-0">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-5 py-4">
        <div className="space-y-3">
          {items.map((item) => (
            <div className="flex min-w-0 text-sm" key={item.label}>
              <div className="w-32 shrink-0 text-neutral-500">{item.label}</div>
              <div className="min-w-0 flex-1 font-medium break-all text-neutral-800">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ServiceOverviewCard({
  service,
  primaryAction,
  onPrimaryAction,
  onRecheck,
  onViewTasks,
  onClearService,
}: ServiceOverviewCardProps) {
  const intl = useIntl();

  const statusBadge = useMemo(
    () => (
      <StatusBadge
        label={getServiceStatusLabel(service.status, intl)}
        className={getServiceStatusClassName(service.status)}
      />
    ),
    [intl, service.status],
  );

  const versionItems = useMemo<OverviewInfoItem[]>(
    () => [
      {
        label: intl.formatMessage({
          id: "disasterRecoveryService.overview.status",
          defaultMessage: "Service Status",
        }),
        value: statusBadge,
      },
      {
        label: intl.formatMessage({
          id: "disasterRecoveryService.overview.version",
          defaultMessage: "Service Version",
        }),
        value: formatEmptyValue(service.version),
      },
      {
        label: intl.formatMessage({
          id: "disasterRecoveryService.overview.package",
          defaultMessage: "Package",
        }),
        value:
          service.packageName ??
          intl.formatMessage({
            id: "disasterRecoveryService.overview.package.empty",
            defaultMessage: "Not Uploaded",
          }),
      },
      {
        label: intl.formatMessage({
          id: "disasterRecoveryService.overview.packageVersion",
          defaultMessage: "Package Version",
        }),
        value: formatEmptyValue(service.packageVersion),
      },
    ],
    [
      intl,
      service.packageName,
      service.packageVersion,
      service.version,
      statusBadge,
    ],
  );

  const serviceItems = useMemo<OverviewInfoItem[]>(
    () => [
      {
        label: intl.formatMessage({
          id: "disasterRecoveryService.overview.managementAddress",
          defaultMessage: "Management Address",
        }),
        value: formatEmptyValue(service.managementAddress),
      },
      {
        label: intl.formatMessage({
          id: "disasterRecoveryService.target.cluster",
          defaultMessage: "Target Cluster",
        }),
        value: formatEmptyValue(service.target.clusterName),
      },
      {
        label: intl.formatMessage({
          id: "disasterRecoveryService.target.host",
          defaultMessage: "Target Host",
        }),
        value: formatEmptyValue(service.target.hostName),
      },
      {
        label: intl.formatMessage({
          id: "disasterRecoveryService.target.storage",
          defaultMessage: "System Storage",
        }),
        value: formatEmptyValue(service.target.storageName),
      },
      {
        label: intl.formatMessage({
          id: "disasterRecoveryService.target.network",
          defaultMessage: "Management Network",
        }),
        value: formatEmptyValue(service.target.managementNetwork),
      },
      {
        label: intl.formatMessage({
          id: "disasterRecoveryService.target.spec",
          defaultMessage: "Deployment Spec",
        }),
        value: formatEmptyValue(service.target.spec),
      },
    ],
    [intl, service.managementAddress, service.target],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            disabled={primaryAction.disabled}
            icon={
              primaryAction.key === "open-zlr" ? (
                <Icon type="play-circle" />
              ) : (
                <Icon type="arrow-right" />
              )
            }
            onClick={onPrimaryAction}
          >
            {getPrimaryActionLabel(primaryAction.key, intl)}
          </Button>
          <Button
            variant="secondary"
            icon={<Icon type="refresh" />}
            onClick={onRecheck}
          >
            {intl.formatMessage({
              id: "disasterRecoveryService.action.recheck",
              defaultMessage: "Recheck",
            })}
          </Button>
          <Button
            variant="secondary"
            icon={<Icon type="task" />}
            onClick={onViewTasks}
          >
            {intl.formatMessage({
              id: "disasterRecoveryService.action.taskLog",
              defaultMessage: "Task Logs",
            })}
          </Button>
          <Button
            variant="danger"
            icon={<Icon type="trash" />}
            onClick={onClearService}
          >
            {intl.formatMessage({
              id: "disasterRecoveryService.action.clearService",
              defaultMessage: "Clear Service Registration",
            })}
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-neutral-500">
            {intl.formatMessage({
              id: "disasterRecoveryService.overview.status",
              defaultMessage: "Service Status",
            })}
          </span>
          {statusBadge}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <OverviewInfoCard
          title={intl.formatMessage({
            id: "disasterRecoveryService.overview.versionInfo",
            defaultMessage: "Version Information",
          })}
          items={versionItems}
        />
        <OverviewInfoCard
          title={intl.formatMessage({
            id: "disasterRecoveryService.overview.serviceDetails",
            defaultMessage: "Service Details",
          })}
          items={serviceItems}
        />
      </div>
    </div>
  );
}
