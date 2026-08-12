import type { SelectOptions } from "@zstack/design";
import { FieldStack, SelectField } from "@zstack/form";
import { AuthHander, useAuth } from "@zstack/zsphere-components";
import { find as _find } from "lodash-es";
import React, { useEffect, useMemo } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { useIntl } from "react-intl";

import type { AddWidgetFormValues } from "../schema";
import type { IMetricConfig } from "./metric-config";

// import useMetricConfig from './metric-config'

interface IProps {
  form: UseFormReturn<AddWidgetFormValues>;
  metricConfig: IMetricConfig[];
}

const TrendMonitorFormItem: React.FC<IProps> = ({ form, metricConfig }) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  // const { metricConfig } = useMetricConfig()

  const watchedResourceType = useWatch({
    control: form.control,
    name: "trendResource",
  });
  const defaultResourceType = metricConfig?.filter(
    (e: any) => !e?.disabled,
  )?.[0]?.value;
  const resourceType = watchedResourceType || defaultResourceType || "";

  useEffect(() => {
    form.setValue("topResource", defaultResourceType);
    form.setValue("trendResource", defaultResourceType);
  }, [defaultResourceType, form]);

  useEffect(() => {
    if (!resourceType) {
      return;
    }

    form.setValue(
      "trendMetricName",
      _find(metricConfig, { value: resourceType })?.children?.filter(
        (f: any) => !f?.disabled,
      )?.[0]?.value,
    );
  }, [form, metricConfig, resourceType]);

  const resourceOptions = useMemo<SelectOptions[]>(
    () =>
      metricConfig
        ?.filter((e: any) => !e?.auth || (e?.auth && hasAuth(e?.auth)))
        ?.map((item) => ({
          value: item.value,
          label: item.label,
          disabled: item?.disabled || false,
        })) || [],
    [hasAuth, metricConfig],
  );

  const metricOptions = useMemo<SelectOptions[]>(
    () =>
      _find(metricConfig, { value: resourceType })
        ?.children?.filter(
          (e: any) => !e?.auth || (e?.auth && hasAuth(e?.auth)),
        )
        ?.map((item: any) => ({
          value: item.value,
          label: item?.auth ? (
            <AuthHander {...item.auth}>{item.label}</AuthHander>
          ) : (
            item.label
          ),
          disabled: item?.disabled || false,
        })) || [],
    [hasAuth, metricConfig, resourceType],
  );

  return (
    <FieldStack>
      <SelectField
        form={form}
        name="trendResource"
        label={intl.formatMessage({
          id: "resourceType",
          defaultMessage: "Resource Type",
        })}
        placeholder={intl.formatMessage({
          id: "homepage.field.select.resourceType.placeholder",
          defaultMessage: "Select resource type",
        })}
        options={resourceOptions}
        size="l"
      />
      <SelectField
        form={form}
        name="trendMetricName"
        label={intl.formatMessage({
          id: "monitoringItem",
          defaultMessage: "Monitoring Item",
        })}
        placeholder={intl.formatMessage({
          id: "homepage.field.select.monitoringItem.placeholder",
          defaultMessage: "Select monitoring item",
        })}
        options={metricOptions}
        size="l"
      />
    </FieldStack>
  );
};

export default TrendMonitorFormItem;
