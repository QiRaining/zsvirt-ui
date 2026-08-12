import { gql } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import type { IInputUnitProps } from "@zstack/zsphere-components";
import { Form, InputUnit, Select, Modal } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction, useValidator } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  DRS as IDRS,
  Thresholds as IThresholds,
  CreateClusterDRSPayload as ICreateClusterDRSPayload,
  UpdateClusterDRSPayload as IUpdateClusterDRSPayload,
  ClusterResourceConfig,
} from "@zstack/zsphere-types/graphql";
import { Input, InputNumber } from "antd";
import { keys as _keys, isNil as _isNil } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  cpuUsedPercentStr,
  memoryUsedPercentStr,
  cpuAndMemoryUsedPercentStr,
  automationLevelList,
  timerMap,
} from "../../../../cluster/detail/drs/drs-panel-config-info/constant";
import {
  durationValidator,
  positiveIntegerValidator,
  schedulingIntervalValidator,
} from "../drs-validator";
import { formatTimeUnit, useUnit } from "../utils";

import style from "./style.module.less";

const flexStyle = { display: "flex" } as const;
const spanStyle = { lineHeight: "32px", marginLeft: "8px" } as const;

export interface IProps {
  detail?: IDRS;
  createType: "create" | "edit" | "enable";
}

export interface IUnitMap {
  second: string;
  minute: string;
  hour: string;
  [key: string]: string;
}

export interface ThresholdInputProps {
  value?: string | number;
  onChange?: (key: string | number) => void;
}

const createClusterDRS = gql`
  mutation createClusterDRS($input: CreateClusterDRSInput!) {
    createClusterDRS(input: $input) {
      actionId
    }
  }
`;

const updateClusterDRS = gql`
  mutation updateClusterDRS($input: UpdateClusterDRSInput!) {
    updateClusterDRS(input: $input) {
      actionId
    }
  }
`;

export const ThresholdInput = ({ value, onChange }: ThresholdInputProps) => {
  const [number, setNumber] = React.useState(value);

  const triggerChange = (changedValue: number) => {
    if (onChange) {
      onChange(changedValue);
    }
  };

  const onNumberChange = (e: any) => {
    const newNumber: any =
      e.target.value === "" ? undefined : parseInt(e.target.value, 10);
    if (Number.isNaN(newNumber)) {
      return;
    }
    setNumber(newNumber);
    triggerChange(newNumber);
  };
  return (
    <>
      <Input
        className={style["width-160"]}
        value={number}
        onChange={onNumberChange}
        prefix="≥"
        suffix="%"
      />
    </>
  );
};

const Action: React.FC<IActionWrapperProps<IDRS> & IProps> = ({
  selectedList,
  refetch,
  visible,
  setVisible,
  createType,
  source,
}) => {
  const {
    uuid,
    clusterUuid = "",
    automationLevel = automationLevelList[0],
    thresholds,
    thresholdDuration = 1,
  } = (selectedList?.[0] ?? {}) as IDRS;

  const resourceConfigValue =
    source?.resourceConfigValue || selectedList?.[0]?.resourceConfigValue;

  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();
  const [monitorItem, setMonitorItem] = React.useState<string>("");
  const { numberRange } = useValidator(intl);
  const { unitMap, unitList, getUnitValue } = useUnit();

  const { num: durationTime = 1, unit: durationTimeUnit = "second" } =
    formatTimeUnit(thresholdDuration, unitMap) || {};
  const [duration, setDuration] = React.useState<IInputUnitProps["value"]>({
    number: Number(durationTime),
    unit: durationTimeUnit,
  });

  const {
    num: defaultSchedulingInterval = 1,
    unit: defaultSchedulingIntervalUnit = "second",
  } =
    formatTimeUnit(
      +(resourceConfigValue?.drsDrsSchedulingInterval ?? 300),
      unitMap,
    ) || {};
  const [schedulingInterval, setSchedulingInterval] = React.useState<
    IInputUnitProps["value"]
  >({
    number: Number(defaultSchedulingInterval),
    unit: defaultSchedulingIntervalUnit,
  });

  const title = React.useMemo(() => {
    if (createType === "create") {
      return intl.formatMessage({
        id: "config.dynamicResourceDispatchStrategy",
        defaultMessage: "Configure DRS Policy",
      });
    }

    if (createType === "edit") {
      return intl.formatMessage({
        id: "virtualization.ha.Modify.Strategy",
        defaultMessage: "Modify Policy",
      });
    }

    if (createType === "enable") {
      return intl.formatMessage({
        id: "enable.dynamicResourceDispatchStrategy",
        defaultMessage: "Enable DRS Policy",
      });
    }

    return;
  }, [createType, intl]);

  React.useEffect(() => {
    const thresholdsKeys = thresholds?.map(
      (item: IThresholds) => item.thresholdName,
    ) as string[];

    if (thresholdsKeys?.length === 1) {
      setMonitorItem(thresholdsKeys[0]);
    } else if (thresholdsKeys?.length === 2) {
      setMonitorItem(cpuAndMemoryUsedPercentStr);
    } else {
      setMonitorItem(cpuUsedPercentStr);
    }

    const cpuUsedValue = thresholds?.find(
      (item) => item.thresholdName === cpuUsedPercentStr,
    )?.thresholdValue;
    form.setFieldsValue({
      cpuUsedPercentThreshold: cpuUsedValue && Number(cpuUsedValue),
    });
    const memoryUsedValue = thresholds?.find(
      (item) => item.thresholdName === memoryUsedPercentStr,
    )?.thresholdValue;
    form.setFieldsValue({
      memoryUsedPercentThreshold: memoryUsedValue && Number(memoryUsedValue),
    });
  }, [form, thresholds, visible]);

  const onOk = async (values: any) => {
    const schedulingIntervalUnit = getUnitValue(
      schedulingInterval?.unit ?? "second",
    );

    values["drs-drs.schedulingInterval"] =
      (schedulingInterval!.number as number) *
      timerMap[schedulingIntervalUnit!];

    // collect resource config
    const resourceConfigKeys = Object.keys(values).filter((key) =>
      key.includes("-"),
    );

    const resourceConfigList: ClusterResourceConfig[] = [];

    resourceConfigKeys.forEach((key) => {
      const [category, name] = key.split("-");

      const value = values[key]?.number ?? values[key];

      if (!_isNil(value)) {
        resourceConfigList.push({
          category,
          name,
          value: String(value),
        });
      }
    });

    const thresholdsArr = [];
    if (values?.cpuUsedPercentThreshold) {
      thresholdsArr.push({
        operator: ">=",
        thresholdName: "cpuUsedPercentThreshold",
        thresholdValue: values?.cpuUsedPercentThreshold?.toString(),
      });
    }
    if (values?.memoryUsedPercentThreshold) {
      thresholdsArr.push({
        operator: ">=",
        thresholdName: "memoryUsedPercentThreshold",
        thresholdValue: values?.memoryUsedPercentThreshold?.toString(),
      });
    }
    let durationValue: number = 0;
    const unitValue = getUnitValue(duration?.unit ?? "second");
    durationValue = (duration!.number as number) * timerMap[unitValue!];

    // 创建动态资源调度
    if (createType === "create") {
      setVisible(false);
      const payload: ICreateClusterDRSPayload = {
        name: `DRS-${clusterUuid}`,
        clusterUuid,
        automationLevel: values.automationLevel,
        thresholdDuration: durationValue,
        thresholds: thresholdsArr,
        defaultEnable: true,
        resourceConfigList,
      };
      doAction({
        mutation: createClusterDRS,
        payload,
        name: title,
        total: 1,
        onProgress: () => {
          refetch?.();
        },
      });
    } else if (["edit", "enable"].includes(createType)) {
      setVisible(false);
      const payload: IUpdateClusterDRSPayload = {
        uuid,
        name: `DRS-${clusterUuid}`,
        clusterUuid,
        automationLevel: values.automationLevel,
        thresholdDuration: durationValue,
        thresholds: thresholdsArr,
        defaultEnable: true,
        resourceConfigList: [
          ...resourceConfigList,
          {
            category: "drs",
            name: "drs.enable",
            value: String(createType === "enable"),
          },
        ],
      };
      doAction({
        mutation: updateClusterDRS,
        payload,
        name: title,
        total: 1,
        onProgress: () => {
          refetch?.();
        },
      });
    }
  };

  const onClose = () => {
    setVisible(false);
  };

  const monitorItemList = [
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
  ];

  const initialValues = React.useMemo<any>(
    () => ({
      monitorItem,
      automationLevel,
      thresholdDuration: {
        number: durationTime,
        unit: durationTimeUnit,
      },
      "drs-drs.migrateVm.concurrent":
        resourceConfigValue?.drsDrsMigrateVmConcurrent,
      "drs-drs.schedulingInterval": {
        number: defaultSchedulingInterval,
        unit: defaultSchedulingIntervalUnit,
      },
    }),
    [
      automationLevel,
      defaultSchedulingInterval,
      defaultSchedulingIntervalUnit,
      durationTime,
      durationTimeUnit,
      monitorItem,
      resourceConfigValue?.drsDrsMigrateVmConcurrent,
    ],
  );

  React.useEffect(() => {
    if (visible) {
      form.setFields(
        _keys(initialValues).map((key) => ({
          name: key,
          value: initialValues[key],
        })),
      );
    }
  }, [initialValues, visible]);

  return (
    <DialogForm
      form={form}
      title={title}
      widthClassName="w-160"
      closable={true}
      onCancel={onClose}
      onOk={onOk}
      visible={visible}
      setVisible={setVisible}
    >
      <Form form={form} name="basic">
        <Form.Item
          name="automationLevel"
          label={intl.formatMessage({
            id: "virtualization.cluster.create.field.automation.model",
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
            value={automationLevel}
            options={[
              {
                value: "Manual",
                label: intl.formatMessage({
                  id: "manual.level",
                  defaultMessage: "Manual Scheduling",
                }),
              },
              {
                value: "Automatic",
                label: intl.formatMessage({
                  id: "automatic.level",
                  defaultMessage: "Auto Scheduling",
                }),
              },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="monitorItem"
          label={intl.formatMessage({
            id: "monitorItem",
            defaultMessage: "Monitoring Item",
          })}
        >
          <Select width="l" onChange={(value: string) => setMonitorItem(value)}>
            {monitorItemList.map(({ value, label }) => {
              return (
                <Select.Option key={value} value={value}>
                  {label}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
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
          <InputUnit
            value={duration}
            onChange={setDuration}
            unitList={unitList}
          />
        </Form.Item>

        <Form.Item
          label={intl.formatMessage({
            id: "virtualization.cluster.create.field.automationLevel.migrateVm.concurrent",
            defaultMessage: "VM Migration Concurrency",
          })}
          required
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
              initialValue={1}
            >
              <InputNumber />
            </Form.Item>
            <span style={spanStyle}>
              {intl.formatMessage({
                id: "virtualization.cluster.create.field.automationLevel.migrateVm.concurrent.unit",
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
          rules={[{ validator: schedulingIntervalValidator(intl, unitMap) }]}
          required
        >
          <InputUnit
            value={schedulingInterval}
            onChange={setSchedulingInterval}
            unitList={unitList}
          />
        </Form.Item>
      </Form>
    </DialogForm>
  );
};

export default Action;
