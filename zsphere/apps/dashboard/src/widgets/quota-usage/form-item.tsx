import type { SelectOptions } from "@zstack/design";
import { SelectField } from "@zstack/form";
import { useAuth, AuthHander } from "@zstack/zsphere-components";
import React, { useEffect, useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useIntl } from "react-intl";

import type { AddWidgetFormValues } from "../schema";
// import useMetricConfig from './metric-config'

interface IProps {
  form: UseFormReturn<AddWidgetFormValues>;
  metricConfig: any;
}

const QuotaUsageFormItem: React.FC<IProps> = ({ metricConfig, form }) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  // const { metricConfig } = useMetricConfig()
  useEffect(() => {
    form.setValue(
      "quotaUsageType",
      metricConfig.filter((e: any) => !e?.disabled)?.[0]?.value,
    );
  }, [form, metricConfig]);

  const options = useMemo<SelectOptions[]>(
    () =>
      metricConfig
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
    [hasAuth, metricConfig],
  );

  return (
    <SelectField
      form={form}
      name="quotaUsageType"
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

export default QuotaUsageFormItem;
