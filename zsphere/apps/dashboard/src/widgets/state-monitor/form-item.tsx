import type { SelectOptions } from "@zstack/design";
import { SelectField } from "@zstack/form";
import { AuthHander, useAuth } from "@zstack/zsphere-components";
import React, { useEffect, useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useIntl } from "react-intl";

import type { AddWidgetFormValues } from "../schema";
// import useMetricConfig from './metric-config'

interface IProps {
  form?: UseFormReturn<AddWidgetFormValues>;
  metricConfig: any;
}

const SmallLayout: React.FC<IProps> = ({ metricConfig, form }) => {
  const intl = useIntl();
  const dataSets = metricConfig;
  const { hasAuth } = useAuth();

  useEffect(() => {
    form?.setValue(
      "resource",
      dataSets.filter(
        (e: any) => !e?.disabled && (!e?.auth || (e?.auth && hasAuth(e?.auth))),
      )?.[0]?.value,
    );
  }, [dataSets, form, hasAuth]);

  const options = useMemo<SelectOptions[]>(
    () =>
      dataSets
        .map((item: any) => {
          if (item?.auth && !hasAuth(item.auth)) {
            return null;
          }

          return {
            value: item.value,
            label: item?.auth ? (
              <AuthHander {...item.auth}>{item.label}</AuthHander>
            ) : (
              item.label
            ),
            disabled: item?.disabled || false,
          };
        })
        .filter((item: SelectOptions | null): item is SelectOptions =>
          Boolean(item),
        ),
    [dataSets, hasAuth],
  );

  if (!form) {
    return null;
  }

  return (
    <SelectField
      form={form}
      name="resource"
      label={intl.formatMessage({
        id: "resourceType",
        defaultMessage: "Resource Type",
      })}
      placeholder={intl.formatMessage({
        id: "homepage.field.select.resourceType.placeholder",
        defaultMessage: "Select resource type",
      })}
      options={options}
      size="l"
    />
  );
};

export default SmallLayout;
