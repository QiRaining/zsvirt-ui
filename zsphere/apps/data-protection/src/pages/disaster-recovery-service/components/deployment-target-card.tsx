import { Card, CardContent, CardHeader, CardTitle } from "@zstack/design";
import { useMemo } from "react";
import { useIntl } from "react-intl";

import type { DisasterRecoveryServiceTarget } from "../types";

interface DeploymentTargetCardProps {
  target: DisasterRecoveryServiceTarget;
}

export function DeploymentTargetCard({ target }: DeploymentTargetCardProps) {
  const intl = useIntl();
  const items = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "disasterRecoveryService.target.spec",
          defaultMessage: "Deployment Spec",
        }),
        value: target.spec,
      },
      {
        label: intl.formatMessage({
          id: "disasterRecoveryService.target.cluster",
          defaultMessage: "Target Cluster",
        }),
        value: target.clusterName,
      },
      {
        label: intl.formatMessage({
          id: "disasterRecoveryService.target.host",
          defaultMessage: "Target Host",
        }),
        value: target.hostName,
      },
      {
        label: intl.formatMessage({
          id: "disasterRecoveryService.target.storage",
          defaultMessage: "System Storage",
        }),
        value: target.storageName,
      },
      {
        label: intl.formatMessage({
          id: "disasterRecoveryService.target.network",
          defaultMessage: "Management Network",
        }),
        value: target.managementNetwork,
      },
    ],
    [
      intl,
      target.clusterName,
      target.hostName,
      target.managementNetwork,
      target.spec,
      target.storageName,
    ],
  );

  return (
    <Card className="bg-neutral-0">
      <CardHeader>
        <CardTitle>
          {intl.formatMessage({
            id: "disasterRecoveryService.target.title",
            defaultMessage: "Deployment Target",
          })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-5">
        {items.map((item) => (
          <div
            className="flex items-start justify-between gap-4"
            key={item.label}
          >
            <div className="text-xs text-neutral-500">{item.label}</div>
            <div className="text-right text-sm break-all text-neutral-800">
              {item.value}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
