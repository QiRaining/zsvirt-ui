import {
  Form,
  InputUnit,
  InputNumber,
  Select,
  useMetricNameConfig,
} from "@zstack/zsphere-components";
import { useValidator, IIsRequiredType } from "@zstack/zsphere-hooks";
import classnames from "classnames";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import CustomSelect from "./time-select";

import styles from "./style.module.less";

const { Item } = Form;

export interface IValue {
  comparisonOperator?: string;
  threshold?: { number: number; unit: string } | number;
}
export interface IProps {
  namespace: string;
  metricName?: string;
}

export const comparisonOperatorList = [
  {
    label: ">",
    value: "GreaterThan",
  },
  {
    label: "≥",
    value: "GreaterThanOrEqualTo",
  },
  {
    label: "<",
    value: "LessThan",
  },
  {
    label: "≤",
    value: "LessThanOrEqualTo",
  },
];

export const byteUnitList: any = [
  {
    label: "KB",
    value: 1 * 1024,
  },
  {
    label: "MB",
    value: 1 * 1024 * 1024,
  },
  {
    label: "GB",
    value: 1 * 1024 * 1024 * 1024,
  },
  {
    label: "TB",
    value: 1 * 1024 * 1024 * 1024 * 1024,
  },
];

export const byteOpsUnitList: any = [
  {
    label: "KB/s",
    value: 1 * 1024,
  },
  {
    label: "MB/s",
    value: 1 * 1024 * 1024,
  },
  {
    label: "GB/s",
    value: 1 * 1024 * 1024 * 1024,
  },
  {
    label: "TB/s",
    value: 1 * 1024 * 1024 * 1024 * 1024,
  },
];

const periodTimeList: any = [
  { number: 30, unit: "s" },
  { number: 1, unit: "min" },
  { number: 5, unit: "min" },
  { number: 10, unit: "min" },
  { number: 30, unit: "min" },
  { number: 1, unit: "hour" },
];

const AlarmTriggerRuleItem: React.FC<IProps> = ({
  namespace,
  metricName = "",
}: IProps) => {
  const intl = useIntl();
  const { isRequired, commonRegexChecker } = useValidator(intl);

  const { namespaceMap, resourceAlarmConfig } = useMetricNameConfig() as {
    namespaceMap: any;
    resourceAlarmConfig: any;
  };

  // 是否显示 “持续时间”
  const hideProp: string[] =
    resourceAlarmConfig[namespaceMap[namespace]]?.[metricName]?.hideProp ?? [];
  const hidePeriod = hideProp.indexOf("period") > -1;

  const thresholdRules = useMemo(() => {
    const roles = [
      isRequired(),
      commonRegexChecker(
        /^(0|[1-9][0-9]{0,2})$/,
        intl.formatMessage({
          id: "zwatchAlarm.field.threshold.placeholder",
          defaultMessage: "Value",
        }),
      ),
    ];
    return roles;
  }, [intl]);

  // 阈值和相应单位
  const getInputThresholdItem = () => {
    const unit =
      resourceAlarmConfig[namespaceMap[namespace]]?.[metricName]?.unit;

    let inputItem: React.ReactElement;
    let unitList: any;
    if (unit === "byte") {
      unitList = byteUnitList.map((item: any) => item.label);
    } else if (unit === "byte/s") {
      unitList = byteOpsUnitList.map((item: any) => item.label);
    }
    switch (unit) {
      case "byte":
      case "byte/s":
        inputItem = (
          <Item
            name={["triggerRule", "threshold"]}
            rules={[
              isRequired(),
              {
                validator: (rule, value) =>
                  commonRegexChecker(
                    /^(0|[1-9][0-9]{0,2})$/,
                    intl.formatMessage({
                      id: "zwatchAlarm.field.threshold.placeholder",
                      defaultMessage: "Value",
                    }),
                  ).validator(rule, value?.number ?? ""),
              },
            ]}
          >
            <InputUnit
              unitList={unitList}
              placeholder={intl.formatMessage({
                id: "zwatchAlarm.field.threshold.placeholder",
                defaultMessage: "Value",
              })}
            />
          </Item>
        );
        break;
      case "percent":
        inputItem = (
          <div className="flex items-center">
            <Item
              name={["triggerRule", "threshold"]}
              validateFirst
              rules={thresholdRules}
              style={{ marginBottom: 0 }}
              className={classnames([styles["width-80"], styles.item])}
            >
              <InputNumber
                className={styles["width-80"]}
                min={0}
                max={100}
                placeholder={intl.formatMessage({
                  id: "zwatchAlarm.field.threshold.placeholder",
                  defaultMessage: "Value",
                })}
              />
            </Item>
            <span className={styles["unit-percent"]}>%</span>
          </div>
        );
        break;
      case "count":
      case "temperature":
      default:
        inputItem = (
          <div className="flex items-center">
            <Item
              name={["triggerRule", "threshold"]}
              validateFirst
              rules={thresholdRules}
              style={{ marginBottom: 0 }}
              className={classnames([styles["width-80"], styles.item])}
            >
              <InputNumber
                className={styles["width-80"]}
                placeholder={intl.formatMessage({
                  id: "zwatchAlarm.field.threshold.placeholder",
                  defaultMessage: "Value",
                })}
              />
            </Item>
            {/* {unit === 'percent' ? <span className={styles['unit-percent']}>%</span> : ''} */}
            {unit === "temperature" ? (
              <span className={styles["unit-percent"]}>℃</span>
            ) : (
              ""
            )}
            {unit === "count" ? (
              <span className={styles["unit-percent"]}>
                {namespace === "ZStack/License"
                  ? intl.formatMessage({ id: "day", defaultMessage: "days" })
                  : intl.formatMessage({ id: "count", defaultMessage: " " })}
              </span>
            ) : (
              ""
            )}
          </div>
        );
        break;
    }
    return inputItem;
  };

  const hideInputThreshold =
    namespace === "ZStack/MN" ||
    [
      "PhysicalNetworkInterface",
      "RaidState",
      "PowerSupply",
      "LoadBalancerBackendStatus",
    ].includes(metricName);

  return (
    <div className="flex flex-nowrap gap-2" style={{ width: 408 }}>
      {!hideInputThreshold && (
        <>
          <div style={{ flex: "0 0 auto" }}>
            <Item noStyle name={["triggerRule", "comparisonOperator"]}>
              <Select width="xs">
                {comparisonOperatorList.map((it) => (
                  <Select.Option value={it.value} key={it.value}>
                    {it.label}
                  </Select.Option>
                ))}
              </Select>
            </Item>
          </div>
          <div style={{ flex: "0 0 auto" }}>{getInputThresholdItem()}</div>
        </>
      )}
      {!hidePeriod && (
        <>
          <div
            style={{
              flex: "0 0 auto",
              lineHeight: "32px",
              wordBreak: "keep-all",
              whiteSpace: "nowrap",
            }}
          >
            {!hideInputThreshold ? "，" : ""}
            {hideInputThreshold
              ? intl.formatMessage({
                  id: "sustain.at.start",
                  defaultMessage: "Continuous",
                })
              : intl.formatMessage({
                  id: "sustain",
                  defaultMessage: "lasts",
                })}
          </div>
          <div style={{ flex: "1 0 auto" }}>
            <Item
              name="period"
              rules={[isRequired(IIsRequiredType.select)]}
              style={{
                display: "inline-block",
                verticalAlign: "baseline",
                width: "100%",
              }}
            >
              <CustomSelect
                items={periodTimeList}
                width={undefined}
                dropdownMatchSelectWidth={false}
              />
            </Item>
          </div>
        </>
      )}
    </div>
  );
};

export default AlarmTriggerRuleItem;
