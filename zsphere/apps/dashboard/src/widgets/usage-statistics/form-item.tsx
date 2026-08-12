import type { SelectOptions } from "@zstack/design";
import { FieldStack, RadioGroupField, SelectField } from "@zstack/form";
import { AuthHander, useAuth } from "@zstack/zsphere-components";
import { find as _find } from "lodash-es";
import React, { useEffect, useMemo } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { useIntl } from "react-intl";

import type { AddWidgetFormValues } from "../schema";
import type { UseMetricType } from "./metric-config";

interface IProps {
  form: UseFormReturn<AddWidgetFormValues>;
  metricConfig: UseMetricType[];
  containerDom?: HTMLDivElement;
}

const SmallLayout: React.FC<IProps> = ({ metricConfig, form }) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const defaultCurrentResourceType = metricConfig.filter(
    (e: UseMetricType) => !e?.disabled && (!e?.auth || hasAuth(e?.auth)),
  )?.[0]?.resourceKey;
  const watchedResourceType = useWatch({
    control: form.control,
    name: "statisticsResource",
  });
  const currentResourceType =
    watchedResourceType || defaultCurrentResourceType || "";

  useEffect(() => {
    form.setValue("statisticsResource", defaultCurrentResourceType);
    form.setValue(
      "monitorItem",
      _find(metricConfig, {
        resourceKey: defaultCurrentResourceType,
      })?.children?.filter((f: any) => !f?.disabled)?.[0]?.value,
    );
  }, [defaultCurrentResourceType, form, metricConfig]);

  useEffect(() => {
    if (!currentResourceType) {
      return;
    }

    form.setValue(
      "monitorItem",
      _find(metricConfig, {
        resourceKey: currentResourceType,
      })?.children?.filter((f: any) => !f?.disabled)?.[0]?.value,
    );
  }, [currentResourceType, form, metricConfig]);

  const resourceOptions = useMemo<SelectOptions[]>(
    () =>
      metricConfig
        ?.filter((e: any) => !e?.auth || (e?.auth && hasAuth(e?.auth)))
        ?.map((item: any) => ({
          value: item?.resourceKey,
          label: item?.auth ? (
            <AuthHander {...item.auth}>{item.label}</AuthHander>
          ) : (
            item.label
          ),
          disabled: item?.disabled || false,
        })) || [],
    [hasAuth, metricConfig],
  );

  const monitorOptions = useMemo(
    () =>
      _find(metricConfig, { resourceKey: currentResourceType })
        ?.children?.filter(
          (e: any) => !e?.auth || (e?.auth && hasAuth(e?.auth)),
        )
        .map((option: any) => ({
          value: option.value,
          disabled: option.disabled,
          label: option?.auth ? (
            <AuthHander {...option.auth}>{option.label}</AuthHander>
          ) : (
            option.label
          ),
        })) || [],
    [currentResourceType, hasAuth, metricConfig],
  );

  return (
    <FieldStack>
      <SelectField
        form={form}
        name="statisticsResource"
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
      <RadioGroupField
        form={form}
        name="monitorItem"
        label={intl.formatMessage({
          id: "monitorItem",
          defaultMessage: "Monitoring Item",
        })}
        variant="button"
        options={monitorOptions}
      />
    </FieldStack>
  );
};

export default SmallLayout;
