import { Checkbox, RadioGroup, RangePicker } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { Form, Select } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { IActionResult } from "@zstack/zsphere-hooks";
import {
  IIsRequiredType,
  useAction,
  useValidator,
} from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { LogCollectState } from "@zstack/zsphere-types";
import type { CreateLogCollectPayload } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

type DateRange = { from?: Date; to?: Date } | undefined;
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type { FC } from "react";
import React, { useState, useEffect } from "react";

import { createLogCollect } from "../../../gql/collect-log.gql";
import { getTimeOptions, getTypeOptins, timeMap } from "../constant";
import { useDownloadLogFile } from "../utils";

const DEFAULT_TIME_RANGE = "1d";

const FormCheckbox = React.forwardRef<
  HTMLButtonElement,
  {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    label?: React.ReactNode;
    disabled?: boolean;
    className?: string;
  }
>(({ checked, onChange, label, ...rest }, ref) => {
  const id = React.useId();
  return (
    <div className="flex items-center">
      <Checkbox
        ref={ref}
        id={id}
        checked={checked}
        onCheckedChange={(val) => onChange?.(val === true)}
        {...rest}
      />
      {label && (
        <label
          htmlFor={id}
          className="cursor-pointer pl-2 text-sm !text-neutral-700"
        >
          {label}
        </label>
      )}
    </div>
  );
});

interface IValues {
  type?: "all" | "specified";
  specifiedTypes?: (
    | "operation"
    | "audit"
    | "mn"
    | "host"
    | "bs"
    | "ps"
    | "mn_db"
  )[];
  timeRange?: "1d" | "2d" | "3d" | "4d" | "5d" | "custom";
  customTimeRange?: Dayjs[];
  directDownload?: boolean;
}

const CreateModal: FC<IActionWrapperProps<any>> = ({
  visible,
  setVisible,
  source,
}) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const { getCurrentServerTimeMillionSeconds } = useTime();
  const currentTime = getCurrentServerTimeMillionSeconds() ?? Date.now();
  const { isRequired } = useValidator(intl);
  const doAction = useAction();

  const [dates, setDates] = useState<DateRange | undefined>();

  const typeOptions = getTypeOptins(intl);
  const timeOptions = getTimeOptions(intl);
  const { handleDownloadFunc } = useDownloadLogFile();

  // 禁用逻辑：不能选未来日期；范围跨度不超过5天
  const disabledDates = (current: Date): boolean => {
    if (!dates?.from && !dates?.to) {
      // 还未选开始日期：禁止选未来日期
      return current > new Date(currentTime);
    }
    // 禁止选未来日期
    if (current > new Date(currentTime)) {
      return true;
    }
    // 5天限制只在两端都已选定时生效
    if (dates?.from && dates?.to) {
      const msPerDay = 5 * 24 * 60 * 60 * 1000;
      const tooLate = current.getTime() - dates.from.getTime() >= msPerDay;
      const tooEarly = dates.to.getTime() - current.getTime() >= msPerDay;
      return !!tooLate || !!tooEarly;
    }
    return false;
  };

  const onOk = async (values: IValues) => {
    const {
      type,
      specifiedTypes = [],
      customTimeRange = [],
      directDownload = false,
    } = values;
    const [startMoment, endMoment] = customTimeRange;

    const payload: CreateLogCollectPayload = {
      type:
        type === "all"
          ? ["operation", "audit", "mn", "host", "bs", "ps", "mn_db"]
          : specifiedTypes,
      directDownload,
    };

    if (startMoment && endMoment) {
      payload.startTime = startMoment.valueOf();
      payload.endTime = endMoment.valueOf();
    }

    doAction({
      mutation: createLogCollect,
      payload,
      name: intl.formatMessage({
        id: "collect.log",
        defaultMessage: "Collect Log",
      }),
      total: 1,
      forceRunCallback: true,
      type: "LogCollect",
      onFinish: (res: IActionResult) => {
        const { state = LogCollectState.FAILED, url = "" } =
          res?.inventory || {};

        if (url && state === LogCollectState.SUCCESS) {
          handleDownloadFunc(url);
        }
      },
    });
    source?.setInterval?.(1000);
  };

  const handleRangeSelect = (range: DateRange | undefined) => {
    setDates(range);
    if (form.getFieldValue("timeRange") !== "custom") {
      form.setFieldsValue({ timeRange: "custom" });
    }
    if (range?.from && range?.to) {
      form.setFieldsValue({
        customTimeRange: [dayjs(range.from), dayjs(range.to)],
      });
    }
  };

  const syncTimeRange = (timeRange: IValues["timeRange"]) => {
    if (timeRange === "custom") {
      setDates(undefined);
      form.setFieldsValue({ customTimeRange: [] });
      return;
    }

    const now = dayjs(currentTime);
    const { amount, unit } =
      timeMap.get(timeRange || DEFAULT_TIME_RANGE) ||
      timeMap.get(DEFAULT_TIME_RANGE)!;
    const startTime = dayjs(now).subtract(amount, unit as dayjs.ManipulateType);
    const dateRange: DateRange = {
      from: startTime.toDate(),
      to: now.toDate(),
    };

    setDates(dateRange);
    form.setFieldsValue({ customTimeRange: [startTime, now] });
  };

  const handleTimeRangeChange = (timeRange: IValues["timeRange"]) => {
    syncTimeRange(timeRange);
  };

  useEffect(() => {
    if (!visible) {
      return;
    }

    form.setFieldsValue({ timeRange: DEFAULT_TIME_RANGE });
    syncTimeRange(DEFAULT_TIME_RANGE);
  }, [visible]);

  return (
    <DialogForm
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "collect.log",
        defaultMessage: "Collect Log",
      })}
      form={form}
      onOk={onOk}
      widthClassName="w-200"
      alertType="info"
      alertMessage={intl.formatMessage({
        id: "create.collect.log.alert",
        defaultMessage: "Ensure sufficient storage space. Insufficient storage space will cause collection failures.",
      })}
    >
      <Form form={form}>
        <Form.Item
          label={intl.formatMessage({
            id: "log.type",
            defaultMessage: "Log Type",
          })}
          required
          icon="info"
          iconTooltip={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "log.collect.field.type.tooltip",
                defaultMessage: `### Log Type

Select the type of logs to collect.

- All Logs: Collect all platform logs types with one click, including operation logs, event logs, management node logs, compute node logs, data storage logs, image storage logs, and database logs.

- Specific Logs: Collect only selected log types. For example, selecting compute node logs will collect logs from all compute nodes within the specified time range.`,
              })}
            </ReactMarkdown>
          }
        >
          <Form.Item name="type" initialValue="all">
            <RadioGroup
              options={[
                {
                  value: "all",
                  label: intl.formatMessage({
                    id: "all.log",
                    defaultMessage: "All Logs",
                  }),
                },
                {
                  value: "specified",
                  label: intl.formatMessage({
                    id: "specified.log",
                    defaultMessage: "Specific Log",
                  }),
                },
              ]}
            />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.type !== currentValues.type
            }
          >
            {({ getFieldValue }) => {
              return (
                getFieldValue("type") === "specified" && (
                  <Form.Item
                    name="specifiedTypes"
                    rules={[isRequired(IIsRequiredType.select)]}
                    style={{ marginTop: "-8px" }}
                  >
                    <Select
                      options={typeOptions}
                      mode="multiple"
                      checkable
                      showToggleAll
                      width="l"
                    />
                  </Form.Item>
                )
              );
            }}
          </Form.Item>
        </Form.Item>
        <Form.Item
          label={intl.formatMessage({
            id: "timeRange",
            defaultMessage: "Time Range",
          })}
          required
        >
          <div className="flex items-center gap-2">
            <Form.Item
              name="timeRange"
              rules={[isRequired(IIsRequiredType.select)]}
              noStyle
              initialValue={DEFAULT_TIME_RANGE}
            >
              <Select
                onChange={handleTimeRangeChange}
                options={timeOptions}
                width="s"
              />
            </Form.Item>
            <span className="text-neutral-600">-</span>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.timeRange !== currentValues.timeRange
              }
            >
              {() => {
                return (
                  <Form.Item
                    name="customTimeRange"
                    rules={[
                      {
                        required: true,
                        message: intl.formatMessage({
                          id: "global.field.validator.time.required",
                          defaultMessage: "Select a time range.",
                        }),
                      },
                    ]}
                    noStyle
                  >
                    <RangePicker
                      selected={dates as any}
                      onSelect={handleRangeSelect as any}
                      disabledDates={disabledDates}
                      onConfirm={() => {}}
                    />
                  </Form.Item>
                );
              }}
            </Form.Item>
          </div>
          <div className="ant-form-item-explain">
            {intl.formatMessage({
              id: "log.collect.field.timeRange.help",
              defaultMessage: "Maximum duration: 5 days.",
            })}
          </div>
        </Form.Item>
        <Form.Item
          name="directDownload"
          valuePropName="checked"
          label={intl.formatMessage({
            id: "direct.download",
            defaultMessage: "Auto-Download",
          })}
        >
          <FormCheckbox
            label={intl.formatMessage({
              id: "colect.log.field.download",
              defaultMessage: "Auto-download after collection",
            })}
          />
        </Form.Item>
      </Form>
    </DialogForm>
  );
};

export default CreateModal;
