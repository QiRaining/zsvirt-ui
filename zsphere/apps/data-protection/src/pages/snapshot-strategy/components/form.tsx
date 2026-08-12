import {
  ZSVForm,
  ModalSelect,
  Form,
  Select,
  InputNumber,
} from "@zstack/zsphere-components";
import { useValidator, IIsRequiredType } from "@zstack/zsphere-hooks";
import { VmQueryType } from "@zstack/zsphere-types";
import type { VmInstance } from "@zstack/zsphere-types/graphql";
import type { FormInstance, CheckboxOptionType } from "antd";
import { Checkbox, TimePicker } from "antd";
import cls from "classnames";
import dayjs, { type Dayjs } from "dayjs";
import { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

interface ISelectOption {
  value: string | number;
  label: string;
}
import { DatePicker, RadioGroup } from "@zstack/design";
import { VmPlainList } from "zsv_resource_shared/vm/mf-index";

import style from "./style.module.less";

export interface IForm {
  name: string;
  description?: string;
  periodType: "week" | "month";
  monthInterval?: number;
  periodByWeek?: number[];
  periodByMonth?: number[];
  executeTime: Dayjs;
  startTime: Dayjs;
  endTimeType: "never" | "custom";
  endTime?: Dayjs;
  snapshotCount: number;
  attachedVm?: VmInstance[];
}

export interface IProps {
  form: FormInstance<IForm>;
  initialValues?: Partial<IForm>;
  type: "create" | "edit";
}

export default function SnapshotStrategyForm({
  form,
  initialValues,
  type,
}: IProps) {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);

  const defaultQuery = useMemo(
    () => ({
      type: VmQueryType.GetCandidatesForSnapshotStrategy,
    }),
    [],
  );

  const periodOptions = useMemo<ISelectOption[]>(
    () => [
      {
        value: "week",
        label: intl.formatMessage({
          id: "scheduled.snapshot.period.option.byWeek",
          defaultMessage: "By Week",
        }),
      },
      {
        value: "month",
        label: intl.formatMessage({
          id: "scheduled.snapshot.period.option.byMonth",
          defaultMessage: "By Month",
        }),
      },
    ],
    [intl],
  );

  const montIntervalOptions = useMemo<ISelectOption[]>(
    () =>
      [1, 2, 3, 6, 12].map((value) => ({
        value,
        label: intl.formatMessage(
          {
            id: "every{number}months",
            defaultMessage: "Every {number} Month",
          },
          { number: value },
        ),
      })),
    [intl],
  );

  const byWeekOptions = useMemo<CheckboxOptionType[]>(
    () => [
      {
        label: intl.formatMessage({ id: "monday", defaultMessage: "Mon" }),
        value: 1,
      },
      {
        label: intl.formatMessage({ id: "tuesday", defaultMessage: "Tue" }),
        value: 2,
      },
      {
        label: intl.formatMessage({ id: "wednesday", defaultMessage: "Wed" }),
        value: 3,
      },
      {
        label: intl.formatMessage({ id: "thursday", defaultMessage: "Thur" }),
        value: 4,
      },
      {
        label: intl.formatMessage({ id: "friday", defaultMessage: "Fri" }),
        value: 5,
      },
      {
        label: intl.formatMessage({ id: "saturday", defaultMessage: "Sat" }),
        value: 6,
      },
      {
        label: intl.formatMessage({ id: "sunday", defaultMessage: "Sun" }),
        value: 7,
      },
    ],
    [intl],
  );

  const byMonthOptions = useMemo(
    () =>
      Array.from<undefined, CheckboxOptionType>({ length: 31 }, (_, idx) => ({
        label: idx + 1,
        value: idx + 1,
      })),
    [],
  );

  const endTimeTypeOptions = useMemo(
    () => [
      {
        value: "never" as const,
        label: intl.formatMessage({
          id: "never",
          defaultMessage: "Never",
        }),
      },
      {
        value: "custom" as const,
        label: intl.formatMessage({
          id: "custom",
          defaultMessage: "Custom",
        }),
      },
    ],
    [intl],
  );

  const endTimeValue = Form.useWatch("endTime", form);
  const endTimeTypeValue = Form.useWatch("endTimeType", form);

  const handleEndTimeChange = useCallback(
    (val: unknown) => {
      form.setFieldsValue({ endTime: val as Dayjs });
    },
    [form],
  );

  const handleEndTimeTypeChange = useCallback(
    (val: unknown) => {
      form.setFieldsValue({
        endTimeType: val as "never" | "custom",
        ...(val !== "custom" && { endTime: undefined }),
      });
    },
    [form],
  );

  return (
    <Form form={form} initialValues={initialValues} preserve={false}>
      <ZSVForm.NameAndDesc className={style.nameAndDesc} />
      <Form.Item
        required
        className={style.periodType}
        label={intl.formatMessage({
          id: "scheduled.snapshot.period",
          defaultMessage: "Scheduled Snapshot Cycle",
        })}
        icon={type === "create" ? "info" : undefined}
        iconTooltip={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "scheduled.snapshot.period.tooltip",
              defaultMessage:
                "### Scheduled Snapshot Cycle\n\nThis setting determines the frequency of snapshot generation. After setting, snapshots will be created according to the specified execution time, including by week and by month. It supports setting more granular snapshot creation times, precise to the minute level.",
            })}
          </ReactMarkdown>
        }
      >
        <Form.Item noStyle name="periodType">
          <Select options={periodOptions} />
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prev, curr) => prev.periodType !== curr.periodType}
        >
          {({ getFieldValue }) =>
            getFieldValue("periodType") === "month" && (
              <Form.Item noStyle name="monthInterval">
                <Select options={montIntervalOptions} />
              </Form.Item>
            )
          }
        </Form.Item>
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) => prev.periodType !== curr.periodType}
      >
        {({ getFieldValue }) => {
          switch (getFieldValue("periodType")) {
            case "week":
              return (
                <Form.Item
                  name="periodByWeek"
                  label=" "
                  className={style.periodOptionWrapper}
                  rules={[isRequired(IIsRequiredType.checkboxGroup)]}
                >
                  <Checkbox.Group
                    className={style.periodOptionGroup}
                    options={byWeekOptions}
                  />
                </Form.Item>
              );
            case "month":
              return (
                <Form.Item
                  name="periodByMonth"
                  label=" "
                  className={style.periodOptionWrapper}
                  rules={[isRequired(IIsRequiredType.checkboxGroup)]}
                >
                  <Checkbox.Group
                    className={cls(
                      style.periodOptionGroup,
                      style.periodOptionSmall,
                    )}
                    options={byMonthOptions}
                  />
                </Form.Item>
              );
          }
        }}
      </Form.Item>
      <Form.Item
        name="executeTime"
        label=" "
        className={style.executeTimeItem}
        rules={[isRequired()]}
      >
        <TimePicker
          className="width-320"
          format="HH:mm"
          placeholder=""
          popupStyle={{ zIndex: 1100 }}
          getPopupContainer={(node) => node.parentElement || document.body}
        />
      </Form.Item>
      <Form.Item
        name="startTime"
        label={intl.formatMessage({
          id: "startTime",
          defaultMessage: "Start Time",
        })}
        className={style.datePickerItem}
        rules={[isRequired()]}
      >
        <DatePicker
          width={320}
          createValue={() => dayjs()}
          showTime={true}
          showSecond={false}
          format="YYYY-MM-DD HH:mm"
          placeholder=""
          modal
          zIndex={1200}
        />
      </Form.Item>
      <Form.Item
        name="endTimeType"
        label={intl.formatMessage({
          id: "endTime",
          defaultMessage: "End Time",
        })}
      >
        <RadioGroup
          value={endTimeTypeValue}
          onValueChange={handleEndTimeTypeChange}
          options={endTimeTypeOptions}
        />
      </Form.Item>
      {endTimeTypeValue === "custom" && (
        <Form.Item
          name="endTime"
          label=" "
          className={style.periodOptionWrapper}
          rules={[
            isRequired(),
            {
              validator: (_, value?: Dayjs) => {
                if (!value) {
                  return Promise.resolve();
                }
                const startTime = form.getFieldValue("startTime");
                if (!startTime) {
                  return Promise.resolve();
                }
                if (value.isBefore(startTime)) {
                  return Promise.reject(
                    new Error(
                      intl.formatMessage({
                        id: "snapshot.strategy.endTime.validator.notBeforeStartTime",
                        defaultMessage: "The end time cannot be earlier than the start time.",
                      }),
                    ),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <DatePicker
            width={320}
            value={endTimeValue}
            onChange={handleEndTimeChange as (val: unknown) => void}
            createValue={() => dayjs()}
            showTime={true}
            showSecond={false}
            showNow={false}
            format="YYYY-MM-DD HH:mm"
            placeholder=""
            modal
            zIndex={1200}
          />
        </Form.Item>
      )}
      <Form.Item
        required
        name="snapshotCount"
        label={intl.formatMessage({
          id: "snapshot.kept.count",
          defaultMessage: "Retained Snapshots",
        })}
        rules={[isRequired()]}
      >
        <InputNumber className={style.snapshotCount} min={1} max={32} />
      </Form.Item>
      <Form.Item
        label=" "
        className={style.snapshotCountDesc}
        shouldUpdate={(prev, curr) => prev.snapshotCount !== curr.snapshotCount}
      >
        {({ getFieldValue }) =>
          intl.formatMessage(
            {
              id: "max.snapshot.number.description",
              defaultMessage: "Retain the latest {count} snapshots. Excess snapshots will be deleted. Excessive snapshots will lower the VM performance, increase data security, and occupy data storage space. Set a reasonable value here.",
            },
            { count: getFieldValue("snapshotCount") ?? 0 },
          )
        }
      </Form.Item>
      <Form.Item
        name="attachedVm"
        label={intl.formatMessage({
          id: "associated.vm",
          defaultMessage: "Associated VM",
        })}
      >
        <ModalSelect
          className="width-320"
          listClassName="list-height-240"
          wrapClassName={style.selectVm}
          selectType="checkbox"
          alertType="info"
          alertMessage={
            <ReactMarkdown>
              {intl.formatMessage({
                id: "snapshot.strategy.add.vm.alert",
                defaultMessage:
                  "1. A virtual machine can have only one snapshot policy associated. A virtual machine that already has an associated snapshot policy cannot be associated again.\n2. If a virtual machine has shared disks or RDM disks attached, it cannot be associated with a snapshot policy.\n3. Make sure the virtual machine uses ZCE distributed storage, otherwise it cannot be associated with a snapshot policy.",
              })}
            </ReactMarkdown>
          }
          label={intl.formatMessage({
            id: "add.vm",
            defaultMessage: "Add Virtual Machine",
          })}
          title={intl.formatMessage({
            id: "add.vm",
            defaultMessage: "Add Virtual Machine",
          })}
        >
          <VmPlainList view="select" defaultQuery={defaultQuery} />
        </ModalSelect>
      </Form.Item>
    </Form>
  );
}
