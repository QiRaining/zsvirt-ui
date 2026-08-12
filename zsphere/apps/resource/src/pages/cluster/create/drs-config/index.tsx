import { RadioGroup } from "@zstack/design";
import {
  cpuUsedPercentStr,
  memoryUsedPercentStr,
  cpuAndMemoryUsedPercentStr,
} from "@zstack/virtualization-resource/src/pages/cluster/detail/drs/drs-panel-config-info/constant";
import { ThresholdInput } from "@zstack/virtualization-resource/src/pages/cluster/detail/drs/modify-drs";
import { Form, Select, InputUnit } from "@zstack/zsphere-components";
import { Switch } from "@zstack/zsphere-components";
import { useValidator } from "@zstack/zsphere-hooks";
import type { globalConfigConfigList } from "@zstack/zsphere-hooks";
import { useLazyGlobalConfigQuery } from "@zstack/zsphere-hooks";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import { InputNumber } from "antd";
import type { FormInstance } from "antd/es/form";
import { omit } from "lodash-es";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { Title } from "../../components";
import {
  durationValidator,
  positiveIntegerValidator,
  schedulingIntervalValidator,
} from "../../detail/drs/drs-validator";
import { formatTimeUnit, useUnit } from "../../detail/drs/utils";

import style from "./style.module.less";

const flexStyle = { display: "flex" } as const;
const inputNumberStyle = { width: "80px" } as const;
const lineHeightStyle = { lineHeight: "32px", marginLeft: "8px" } as const;

const drsGlobalConfig: globalConfigConfigList = [
  {
    category: "drs",
    name: "drs.migrateVm.concurrent",
  },
  {
    category: "drs",
    name: "drs.schedulingInterval",
  },
];

export interface IProps {
  form?: FormInstance;
  selectedList?: IZone[];
  isCreate?: boolean;
}

const DrsConfig: React.FC<IProps> = ({ form, isCreate }) => {
  const intl = useIntl();
  const { unitList, unitMap } = useUnit();
  const { numberRange } = useValidator(intl);
  const { queryGlobalConfig, globalConfigDataMap } =
    useLazyGlobalConfigQuery(drsGlobalConfig);

  const monitorItemList = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "cpuUtilization",
          defaultMessage: "CPU Utilization",
        }),
        value: cpuUsedPercentStr,
      },
      {
        label: intl.formatMessage({
          id: "memoryUtilization",
          defaultMessage: " Memory Utilization",
        }),
        value: memoryUsedPercentStr,
      },
      {
        label: intl.formatMessage({
          id: "cpuOrMemoryUtilization",
          defaultMessage: "CPU/Memory Utilization",
        }),
        value: cpuAndMemoryUsedPercentStr,
      },
    ],
    [intl],
  );

  useEffect(() => {
    if (isCreate && form?.getFieldValue("enabledStatus")) {
      queryGlobalConfig?.();
    }
  }, [form, isCreate, queryGlobalConfig]);

  useEffect(() => {
    const setFields = () => {
      const excludeKeys: string[] = [];

      const dataMap = omit(globalConfigDataMap, excludeKeys);

      const getValue = (value: string) => {
        if (["true", "false"].includes(value)) {
          return JSON.parse(value);
        }

        if (!isNaN(+value)) {
          return +value;
        }

        return value;
      };

      const fields = Object.entries(dataMap).map(([key, { value }]) => {
        let _value = getValue(value);

        if (key === "drs-drs.schedulingInterval") {
          const {
            num: defaultSchedulingInterval = 10,
            unit: defaultSchedulingIntervalUnit = "minute",
          } = formatTimeUnit(value, unitMap) || {};

          _value = {
            number: defaultSchedulingInterval,
            unit: defaultSchedulingIntervalUnit,
          };
        }

        return { name: key, value: _value };
      });

      form?.setFields(fields);
    };

    if (isCreate && form?.getFieldValue("enabledStatus")) {
      setFields();
    }
  }, [isCreate, globalConfigDataMap, form]);

  return (
    <div className={style.card}>
      <Title
        title={intl.formatMessage({
          id: "virtualization.cluster.create.field.drs.title",
          defaultMessage: "DRS",
        })}
      />
      <Form.Item
        label={intl.formatMessage({
          id: "enable.state",
          defaultMessage: "State",
        })}
        name="enabledStatus"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) => prev.enabledStatus !== curr.enabledStatus}
      >
        {({ getFieldValue }) => {
          const enabledStatus = getFieldValue("enabledStatus");

          if (enabledStatus) {
            form?.setFieldsValue({
              automationLevel: "Manual",
            });
          }

          return enabledStatus ? (
            <>
              <Form.Item
                name="automationLevel"
                label={intl.formatMessage({
                  id: "virtualization.cluster.create.field.automationLevel",
                  defaultMessage: "DRS Mode",
                })}
                icon="info"
                iconTooltip={
                  <ReactMarkdown>
                    {intl.formatMessage({
                      id: "virtualization.cluster.create.field.automationLevel.iconTooltip",
                      defaultMessage: `### DRS Mode

Supports both automatic and manual scheduling modes.

- Auto Scheduling: If the CPU or memory usage of the hosts in the cluster reaches the specified threshold, the system auto-schedules the resources based on the scheduling algorithm.
- Manual Scheduling: If the CPU or memory usage of the hosts in the cluster reaches the specified threshold, you manually schedule the resources based on the scheduling suggestions.`,
                    })}
                  </ReactMarkdown>
                }
              >
                <RadioGroup
                  options={[
                    {
                      value: "Manual",
                      label: intl.formatMessage({
                        id: "manual.dispatch",
                        defaultMessage: "Manual Scheduling",
                      }),
                    },
                    {
                      value: "Automatic",
                      label: intl.formatMessage({
                        id: "automatic.dispatch",
                        defaultMessage: "Auto Scheduling",
                      }),
                    },
                  ]}
                />
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) =>
                  prev.automationLevel !== curr.automationLevel
                }
              >
                {() => {
                  return (
                    <>
                      <Form.Item
                        name="monitorItem"
                        label={intl.formatMessage({
                          id: "monitorItem",
                          defaultMessage: "Monitoring Item",
                        })}
                      >
                        <Select className={style["width-400"]}>
                          {monitorItemList.map(({ value, label }) => {
                            return (
                              <Select.Option key={value} value={value}>
                                {label}
                              </Select.Option>
                            );
                          })}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        noStyle
                        shouldUpdate={(prev, curr) =>
                          prev.monitorItem === curr.monitorItem
                        }
                      >
                        {() => {
                          const monitorItem = getFieldValue("monitorItem");

                          return (
                            <>
                              {monitorItem !== memoryUsedPercentStr && (
                                <Form.Item
                                  name="cpuUsedPercentThreshold"
                                  initialValue={60}
                                  label={intl.formatMessage({
                                    id: "cpuUtilization",
                                    defaultMessage: "CPU Utilization",
                                  })}
                                  rules={[numberRange(1, 100)]}
                                  required
                                >
                                  <ThresholdInput />
                                </Form.Item>
                              )}
                              {monitorItem !== cpuUsedPercentStr && (
                                <Form.Item
                                  name="memoryUsedPercentThreshold"
                                  label={intl.formatMessage({
                                    id: "memoryUtilization",
                                    defaultMessage: " Memory Utilization",
                                  })}
                                  initialValue={60}
                                  rules={[numberRange(1, 100)]}
                                  required
                                >
                                  <ThresholdInput />
                                </Form.Item>
                              )}
                              <Form.Item
                                name="thresholdDuration"
                                label={intl.formatMessage({
                                  id: "durationTime",
                                  defaultMessage: "Duration",
                                })}
                                rules={[
                                  {
                                    validator: durationValidator(intl, unitMap),
                                  },
                                ]}
                                required
                              >
                                <InputUnit unitList={unitList} />
                              </Form.Item>
                            </>
                          );
                        }}
                      </Form.Item>

                      <Form.Item
                        required
                        label={intl.formatMessage({
                          id: "virtualization.cluster.create.field.automationLevel.migrateVm.concurrent",
                          defaultMessage: "VM Migration Concurrency",
                        })}
                        icon="info"
                        iconTooltip={
                          <ReactMarkdown>
                            {intl.formatMessage({
                              id: "virtualization.cluster.create.field.drs-drs.migrateVm.concurrent.iconTooltip",
                              defaultMessage: ``,
                            })}
                          </ReactMarkdown>
                        }
                      >
                        <div style={flexStyle}>
                          <Form.Item
                            noStyle
                            name="drs-drs.migrateVm.concurrent"
                            rules={[
                              {
                                validator: positiveIntegerValidator(intl),
                              },
                            ]}
                          >
                            <InputNumber style={inputNumberStyle} />
                          </Form.Item>
                          <span style={lineHeightStyle}>
                            {intl.formatMessage({
                              id: "virtualization.cluster.create.field.automationLevel.drs.migrateVm.concurrent.unit",
                              defaultMessage: " ",
                            })}
                          </span>
                        </div>
                      </Form.Item>

                      <Form.Item
                        name="drs-drs.schedulingInterval"
                        label={intl.formatMessage({
                          id: "virtualization.cluster.create.field.automationLevel.schedulingInterval",
                          defaultMessage: "Cluster Scanning Interval",
                        })}
                        icon="info"
                        iconTooltip={
                          <ReactMarkdown>
                            {intl.formatMessage({
                              id: "virtualization.cluster.create.field.drs-drs.schedulingInterval.iconTooltip",
                              defaultMessage: ``,
                            })}
                          </ReactMarkdown>
                        }
                        rules={[
                          {
                            validator: schedulingIntervalValidator(
                              intl,
                              unitMap,
                            ),
                          },
                        ]}
                        required
                      >
                        <InputUnit unitList={unitList} />
                      </Form.Item>
                    </>
                  );
                }}
              </Form.Item>
            </>
          ) : null;
        }}
      </Form.Item>
    </div>
  );
};

export default DrsConfig;
