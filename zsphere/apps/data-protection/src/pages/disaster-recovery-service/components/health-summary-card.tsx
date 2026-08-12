import { Card, CardContent, CardHeader, CardTitle } from "@zstack/design";
import { useIntl } from "react-intl";

import type { DisasterRecoveryServiceHealthItem } from "../types";
import {
  getHealthItemLabel,
  getHealthStatusClassName,
  getHealthStatusLabel,
} from "./formatters";
import { StatusBadge } from "./status-badge";

interface HealthSummaryCardProps {
  items: DisasterRecoveryServiceHealthItem[];
}

export function HealthSummaryCard({ items }: HealthSummaryCardProps) {
  const intl = useIntl();
  const warningCount = items.filter((item) => item.status === "warning").length;
  const criticalCount = items.filter(
    (item) => item.status === "critical",
  ).length;

  return (
    <Card className="bg-neutral-0">
      <CardHeader>
        <CardTitle>
          {intl.formatMessage({
            id: "disasterRecoveryService.health.title",
            defaultMessage: "Post-registration Self-check",
          })}
        </CardTitle>
        <div className="text-xs text-neutral-600">
          {intl.formatMessage(
            {
              id: "disasterRecoveryService.health.summary",
              defaultMessage: "{critical} blockers, {warning} warnings",
            },
            { critical: criticalCount, warning: warningCount },
          )}
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 px-5 lg:grid-cols-2">
        {items.map((item) => (
          <div
            className="flex items-center justify-between rounded-sm border border-solid border-neutral-200 bg-neutral-50 px-3 py-2"
            key={item.code}
          >
            <span className="text-sm text-neutral-700">
              {getHealthItemLabel(item, intl)}
            </span>
            <StatusBadge
              label={getHealthStatusLabel(item.status, intl)}
              className={getHealthStatusClassName(item.status)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
