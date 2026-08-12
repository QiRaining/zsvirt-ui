import { Card, CardContent, CardHeader, CardTitle } from "@zstack/design";
import { useMemo } from "react";
import { useIntl } from "react-intl";

import type { DisasterRecoveryPlatformContext } from "../types";

interface PlatformContextCardProps {
  context: DisasterRecoveryPlatformContext;
}

export function PlatformContextCard({ context }: PlatformContextCardProps) {
  const intl = useIntl();
  const items = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "disasterRecoveryService.context.platformType",
          defaultMessage: "Base Platform",
        }),
        value: context.platformType,
      },
      {
        label: intl.formatMessage({
          id: "disasterRecoveryService.context.managementNode",
          defaultMessage: "Management Node Address",
        }),
        value: context.managementNodeAddress,
      },
      {
        label: intl.formatMessage({
          id: "disasterRecoveryService.context.siteId",
          defaultMessage: "Site ID",
        }),
        value: context.siteId,
      },
      {
        label: intl.formatMessage({
          id: "disasterRecoveryService.context.siteName",
          defaultMessage: "Suggested Site Name",
        }),
        value: context.suggestedSiteName,
      },
      {
        label: intl.formatMessage({
          id: "disasterRecoveryService.context.tokenState",
          defaultMessage: "Bootstrap Token",
        }),
        value: context.bootstrapTokenState,
      },
      {
        label: intl.formatMessage({
          id: "disasterRecoveryService.context.fingerprint",
          defaultMessage: "Certificate Fingerprint",
        }),
        value: context.certificateFingerprint,
      },
    ],
    [
      context.bootstrapTokenState,
      context.certificateFingerprint,
      context.managementNodeAddress,
      context.platformType,
      context.siteId,
      context.suggestedSiteName,
      intl,
    ],
  );

  return (
    <Card className="bg-neutral-0">
      <CardHeader>
        <CardTitle>
          {intl.formatMessage({
            id: "disasterRecoveryService.context.title",
            defaultMessage: "Platform Entry Context",
          })}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 px-5 lg:grid-cols-2">
        {items.map((item) => (
          <div key={item.label}>
            <div className="text-xs text-neutral-500">{item.label}</div>
            <div className="mt-1 text-sm break-all text-neutral-800">
              {item.value}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
