import { useColumnConfig } from "@zstack/zsphere-engine/src/module-authorization-details";
import type { IOption } from "@zstack/zsphere-engine/src/module-authorization-details/useColumnConfig";
import type { ModuleAuthorizationDetails as IModuleAuthorizationDetails } from "@zstack/zsphere-types/graphql";
import { useMemo } from "react";
import { useIntl } from "react-intl";

const LICENSE_TYPE_MAP: Record<number, { id: string; defaultMessage: string }> =
  {
    0: {
      id: "zmigrate.license.type.test.migration.one.week",
      defaultMessage: "Migration Test License (1 week)",
    },
    1: {
      id: "zmigrate.license.type.test.dr.two.weeks",
      defaultMessage: "Disaster Recovery Test License (2 weeks)",
    },
    7: {
      id: "zmigrate.license.type.migration.extend.gb",
      defaultMessage: "Capacity Authorization",
    },
    9: {
      id: "zmigrate.license.type.migration.two.months",
      defaultMessage: "Production Migration License (2 months)",
    },
  };

export default () => {
  const intl = useIntl();

  const option: IOption<IModuleAuthorizationDetails> = useMemo(
    () => [
      {
        key: "authorization.type",
        formatter: (value: IModuleAuthorizationDetails) => {
          const descriptor = LICENSE_TYPE_MAP[value?.type];
          return intl.formatMessage(descriptor);
        },
      },
      {
        key: "authQuota",
        formatter: (value: IModuleAuthorizationDetails) => value.count ?? "",
      },
      {
        key: "used.credit.limit",
        formatter: (value: IModuleAuthorizationDetails) => value.consumed ?? "",
      },
      {
        key: "expire.time",
        formatter: (value: IModuleAuthorizationDetails) =>
          value?.expired_date ?? "",
      },
      {
        key: "authorization.permit",
        formatter: (value: IModuleAuthorizationDetails) => value?.key ?? "",
      },
    ],
    [intl],
  );

  return useColumnConfig<IModuleAuthorizationDetails>(option);
};
