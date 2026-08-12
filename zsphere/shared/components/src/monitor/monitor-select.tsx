import { concat, map, sortBy } from "lodash-es";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";

import { Select } from "../a-cloud-old-components";
import { useMonitorLabels } from "./hooks";
import { IBusinessMonitorSelectProps, IMonitorSelectProps } from "./type";

import style from "./style.module.less";

export const MonitorSelect: React.FC<IMonitorSelectProps> = ({
  trigger,
  value,
  options = [],
  onChange,
  ...props
}) => {
  const intl = useIntl();

  const text = intl.formatMessage(
    {
      id: "monitorObject.total",
      defaultMessage: "Monitoring Objects ({total})",
    },
    { total: value?.length || 0 },
  );

  return (
    <div className={style["chart-monitor-select"]}>
      <Select
        mode="multiple"
        checkable
        showToggleAll
        dropdownWidth="s"
        value={value}
        options={options}
        onChange={(list) => {
          if (onChange) {
            const orderList = map(options, "value");
            const newList = sortBy(list, (v: any) => orderList.indexOf(v));
            onChange(newList);
          }
        }}
        dropdownAlign={{ points: ["tr", "br"] }}
        showArrow
        {...props}
      >
        {trigger || text}
      </Select>
    </div>
  );
};

const BusinessMonitorSelect: React.FC<IBusinessMonitorSelectProps> = ({
  namespace,
  metricName,
  labelName,
  filterLabels,
  labels,
  setLabels,
  staticOptions,
  selectFirstOption = true,
  ...props
}) => {
  const { getMonitorLabels, monitorLabels } = useMonitorLabels();

  useEffect(() => {
    getMonitorLabels({
      variables: {
        namespace,
        metricName,
        labelName,
        filterLabels,
      },
    });
  }, [filterLabels, getMonitorLabels, labelName, metricName, namespace]);

  const options = useMemo(() => {
    if (staticOptions) {
      return concat(staticOptions, monitorLabels);
    }
    return monitorLabels;
  }, [staticOptions, monitorLabels]);

  useEffect(() => {
    if (selectFirstOption && options.length > 0) {
      setLabels([options[0].value]);
    }
  }, [selectFirstOption, options, setLabels]);

  return (
    <MonitorSelect
      value={labels}
      onChange={setLabels}
      options={options}
      {...props}
    />
  );
};

export default React.memo(BusinessMonitorSelect);
