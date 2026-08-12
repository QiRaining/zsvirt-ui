import { Icon } from "@zstack/icon";
import { Space, Tooltip } from "antd";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { Select } from "../a-cloud-old-components";
import { useMonitorNameOptions } from "./hooks";
import { IBusinessTitleProps, ITitleSelectProps } from "./type";

import style from "./style.module.less";

function TitleSelect({
  title,
  icon,
  tooltip,
  value,
  options,
  onChange,
  multiple,
  ...props
}: ITitleSelectProps) {
  const intl = useIntl();

  const renderTitle = options ? `${title} :` : title;

  const renderSelect = useMemo(() => {
    if (!options) return null;
    if (multiple) {
      const selectedLabels = options.reduce((arr, cur) => {
        const sv = value?.find((v) => cur.value === v);
        if (sv) {
          arr.push(cur.label);
        }
        return arr;
      }, [] as string[]);
      const text =
        selectedLabels.length === 0
          ? intl.formatMessage({
              id: "none",
              defaultMessage: "None",
            })
          : selectedLabels.join("/");
      return (
        <Select
          mode="multiple"
          checkable
          showToggleAll={false}
          dropdownWidth="s"
          showArrow
          value={value}
          options={options}
          onChange={onChange}
          {...props}
        >
          {text}
        </Select>
      );
    }
    return (
      <Select<any>
        dropdownWidth="s"
        showArrow
        value={value?.[0]}
        options={options}
        onChange={(v) => {
          onChange?.([v]);
        }}
        bordered={false}
        {...props}
      />
    );
  }, [intl, multiple, onChange, options, props, value]);

  const renderIcon = tooltip && (
    <Tooltip title={tooltip}>
      <Icon
        type={icon || "info"}
        className={style["chart-monitor-title-icon"]}
      />
    </Tooltip>
  );

  return (
    <Space size={8} className={style["chart-monitor-title"]}>
      {renderTitle}
      {renderSelect}
      {renderIcon}
    </Space>
  );
}

const BusinessMonitorTitle: React.FC<IBusinessTitleProps> = ({
  metricNameMap,
  ...props
}) => {
  return (
    <Space size={8} align="center">
      <div className={style["vertical-bar"]} />
      <TitleSelect options={useMonitorNameOptions(metricNameMap)} {...props} />
    </Space>
  );
};

export default BusinessMonitorTitle;
