import type { SelectOptions } from "@zstack/design";
import { FieldStack, RadioGroupField, SelectField } from "@zstack/form";
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

const defaultLimitOptions = [
  { label: "3", value: 3 },
  { label: "10", value: 10 },
];

const TopMonitorFormItem: React.FC<IProps> = ({ form, metricConfig }) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  // const { metricConfig } = useMetricConfig()

  const watchedResourceType = useWatch({
    control: form.control,
    name: "topResource",
  });
  const watchedMetricName = useWatch({
    control: form.control,
    name: "topMetricName",
  });
  const defaultResourceType = metricConfig?.filter(
    (e: any) => !e?.disabled && (!e?.auth || (e?.auth && hasAuth(e?.auth))),
  )?.[0]?.value;
  const resourceType = watchedResourceType || defaultResourceType || "";

  useEffect(() => {
    form.setValue("topResource", defaultResourceType);
  }, [defaultResourceType, form]);

  useEffect(() => {
    if (!resourceType) {
      return;
    }

    form.setValue(
      "topMetricName",
      _find(metricConfig, { value: resourceType })?.children?.filter(
        (f: any) => !f?.disabled && (!f?.auth || (f?.auth && hasAuth(f?.auth))),
      )?.[0]?.value,
    );
  }, [form, hasAuth, metricConfig, resourceType]);

  const limitOptions = useMemo(
    () =>
      _find(_find(metricConfig, { value: resourceType })?.children, {
        value: watchedMetricName,
      })?.children || defaultLimitOptions,
    [metricConfig, resourceType, watchedMetricName],
  );

  useEffect(() => {
    form.setValue(
      "limit",
      limitOptions.filter((f: any) => !f.disabled)?.[0]?.value,
    );
  }, [form, limitOptions]);

  const resourceOptions = useMemo<SelectOptions[]>(
    () =>
      metricConfig
        .filter((e: any) => !e?.auth || (e?.auth && hasAuth(e?.auth)))
        .map((item: any) => ({
          value: item.value,
          label: item?.auth ? (
            <AuthHander {...item.auth}>{item.label}</AuthHander>
          ) : (
            item.label
          ),
          disabled: item?.disabled || false,
        })),
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

  const limitRadioOptions = useMemo(
    () =>
      limitOptions
        ?.filter((option: any) => !option?.auth || hasAuth(option.auth))
        ?.map((option: any) => ({
          value: option.value,
          label: option?.auth ? (
            <AuthHander {...option.auth}>{option.label}</AuthHander>
          ) : (
            option.label
          ),
          disabled: option.disabled,
        })),
    [hasAuth, limitOptions],
  );

  return (
    <FieldStack>
      <SelectField
        form={form}
        name="topResource"
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
        name="topMetricName"
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
      <RadioGroupField
        form={form}
        name="limit"
        label={intl.formatMessage({
          id: "topCount",
          defaultMessage: "Top",
        })}
        variant="button"
        options={limitRadioOptions}
      />
    </FieldStack>
  );
};

export default TopMonitorFormItem;
