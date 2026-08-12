import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import type { ISelectOption } from "@zstack/zsphere-components";
import { Form, Select } from "@zstack/zsphere-components";
import { useValidator, IIsRequiredType } from "@zstack/zsphere-hooks";
import { Checkbox, TimePicker } from "antd";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import type { IntlShape } from "react-intl";

import style from "./style.module.less";

type Mode = "incremental" | "full";
type BackupType = "vm" | "db";

export interface IBackupStrategyProps {
  mode: Mode;
  backupType: BackupType;
  tooltip: React.ReactNode;
}

export default function BackupStrategy({
  mode,
  backupType,
  tooltip,
}: IBackupStrategyProps) {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);

  const periodOptions = useMemo(
    () => getPeriodOptions(intl, mode, backupType),
    [intl, mode, backupType],
  );
  const monthIntervalOptions = useMemo(
    () => getMonthIntervalOptions(intl),
    [intl],
  );
  const hourIntervalOptions = useMemo(
    () => getHourIntervalOptions(intl),
    [intl],
  );
  const minuteIntervalOptions = useMemo(
    () => getMinuteIntervalOptions(intl),
    [intl],
  );
  const byWeekOptions = useMemo(() => getByWeekOptions(intl), [intl]);
  const byMonthOptions = useMemo(() => getByMonthOptions(), []);

  return (
    <div className={style.field}>
      <Form.Item
        required
        className={style.periodType}
        label={intl.formatMessage({
          id: "backup.period",
          defaultMessage: "Backup Cycle",
        })}
      >
        <Form.Item noStyle name={`${mode}PeriodType`}>
          <Select options={periodOptions} />
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prev, curr) =>
            prev[`${mode}PeriodType`] !== curr[`${mode}PeriodType`]
          }
        >
          {({ getFieldValue }) => {
            switch (getFieldValue(`${mode}PeriodType`)) {
              case "month":
                return (
                  <Form.Item noStyle name={`${mode}MonthInterval`}>
                    <Select options={monthIntervalOptions} />
                  </Form.Item>
                );
              case "hour":
                return (
                  <Form.Item noStyle name={`${mode}HourInterval`}>
                    <Select options={hourIntervalOptions} />
                  </Form.Item>
                );
              case "minute":
                return (
                  <Form.Item noStyle name={`${mode}MinuteInterval`}>
                    <Select options={minuteIntervalOptions} />
                  </Form.Item>
                );
            }
          }}
        </Form.Item>
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) =>
          prev[`${mode}PeriodType`] !== curr[`${mode}PeriodType`]
        }
      >
        {({ getFieldValue }) => {
          switch (getFieldValue(`${mode}PeriodType`)) {
            case "week":
              return (
                <Form.Item
                  name={`${mode}PeriodByWeek`}
                  label=" "
                  className={style.periodOptionWrapper}
                  rules={[isRequired(IIsRequiredType.select)]}
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
                  name={`${mode}PeriodByMonth`}
                  label=" "
                  className={style.periodOptionWrapper}
                  rules={[isRequired(IIsRequiredType.select)]}
                >
                  <Checkbox.Group
                    className={style.periodOptionGroup}
                    options={byMonthOptions}
                  />
                </Form.Item>
              );
          }
        }}
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) =>
          prev[`${mode}PeriodType`] !== curr[`${mode}PeriodType`]
        }
      >
        {({ getFieldValue }) => {
          switch (getFieldValue(`${mode}PeriodType`)) {
            case "month":
            case "week":
              return (
                <Form.Item
                  required
                  name={`${mode}ExecuteTime`}
                  label={intl.formatMessage({
                    id: "execute.time",
                    defaultMessage: "Execution Time",
                  })}
                  rules={[isRequired()]}
                  icon="info"
                  iconTooltip={tooltip}
                >
                  <TimePicker
                    className="width-320"
                    format="HH:mm"
                    getPopupContainer={(node) =>
                      (node.closest('[role="dialog"]') as HTMLElement) ||
                      document.body
                    }
                    placeholder={intl.formatMessage({
                      id: "please.choose.time",
                      defaultMessage: "Select a time.",
                    })}
                  />
                </Form.Item>
              );
            case "day":
              return (
                <Form.Item
                  required
                  label={intl.formatMessage({
                    id: "execute.time",
                    defaultMessage: "Execution Time",
                  })}
                  icon="info"
                  iconTooltip={tooltip}
                >
                  <Form.List name={`${mode}ExecuteTimeList`}>
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map((field) => (
                          <Form.Item
                            key={field.key}
                            className={
                              backupType === "vm"
                                ? style.executeTimeWrapper
                                : ""
                            }
                          >
                            <Form.Item
                              {...field}
                              noStyle
                              rules={[isRequired()]}
                            >
                              <TimePicker
                                className="width-320"
                                format="HH:mm"
                                getPopupContainer={(node) =>
                                  (node.closest(
                                    '[role="dialog"]',
                                  ) as HTMLElement) || document.body
                                }
                                placeholder={intl.formatMessage({
                                  id: "please.choose.time",
                                  defaultMessage: "Select a time.",
                                })}
                              />
                            </Form.Item>
                            {fields.length > 1 && (
                              <Icon
                                className={style.trash}
                                type="trash"
                                onClick={() => remove(field.name)}
                              />
                            )}
                          </Form.Item>
                        ))}
                        {backupType === "vm" && (
                          <Button
                            variant="link"
                            className={style.addBtn}
                            icon={<Icon type="plus" />}
                            onClick={() => add()}
                          >
                            {intl.formatMessage({
                              id: "add",
                              defaultMessage: "Add",
                            })}
                          </Button>
                        )}
                      </>
                    )}
                  </Form.List>
                </Form.Item>
              );
            case "hour":
            case "minute":
              return (
                <Form.Item label=" " className={style.periodTypeDescription}>
                  {backupType === "db"
                    ? intl.formatMessage({
                        id: "backup.by.hour.description",
                        defaultMessage:
                          "When backup by hour, the backup policy is executed from the time the backup plan becomes effective.",
                      })
                    : intl.formatMessage({
                        id: "backup.by.hour.minute.description",
                        defaultMessage:
                          "When backup by hour/minute, the backup policy is executed from the time the backup plan becomes effective.",
                      })}
                </Form.Item>
              );
          }
        }}
      </Form.Item>
    </div>
  );
}

function getPeriodOptions(
  intl: IntlShape,
  mode: Mode,
  backupType: BackupType,
): ISelectOption[] {
  if (backupType === "vm") {
    return [
      {
        value: "month",
        label: intl.formatMessage({
          id: "backup.period.option.byMonth",
          defaultMessage: "Backup by Month",
        }),
      },
      {
        value: "week",
        label: intl.formatMessage({
          id: "backup.period.option.byWeek",
          defaultMessage: "Backup by Week",
        }),
      },
      ...(mode === "incremental"
        ? [
            {
              value: "day",
              label: intl.formatMessage({
                id: "backup.period.option.byDay",
                defaultMessage: "Backup by Day",
              }),
            },
            {
              value: "hour",
              label: intl.formatMessage({
                id: "backup.period.option.byHour",
                defaultMessage: "Backup by Hour",
              }),
            },
            {
              value: "minute",
              label: intl.formatMessage({
                id: "backup.period.option.byMinute",
                defaultMessage: "Backup by Minute",
              }),
            },
          ]
        : []),
    ];
  }
  return [
    {
      value: "week",
      label: intl.formatMessage({
        id: "backup.period.option.byWeek",
        defaultMessage: "Backup by Week",
      }),
    },
    {
      value: "day",
      label: intl.formatMessage({
        id: "backup.period.option.byDay",
        defaultMessage: "Backup by Day",
      }),
    },
    {
      value: "hour",
      label: intl.formatMessage({
        id: "backup.period.option.byHour",
        defaultMessage: "Backup by Hour",
      }),
    },
  ];
}

function getMonthIntervalOptions(intl: IntlShape): ISelectOption[] {
  return [1, 2, 3, 6, 12].map((value) => ({
    value,
    label: intl.formatMessage(
      {
        id: "every{number}months",
        defaultMessage: "Every {number} Month",
      },
      { number: value },
    ),
  }));
}

function getHourIntervalOptions(intl: IntlShape): ISelectOption[] {
  return [1, 2, 3, 6, 12].map((value) => ({
    value,
    label: intl.formatMessage(
      {
        id: "every {number} hours",
        defaultMessage: "Every {number} Hour",
      },
      { number: value },
    ),
  }));
}

function getMinuteIntervalOptions(intl: IntlShape): ISelectOption[] {
  return [15, 30, 45].map((value) => ({
    value,
    label: intl.formatMessage(
      {
        id: "every {number} minutes",
        defaultMessage: "Every {number} Minute",
      },
      { number: value },
    ),
  }));
}

function getByWeekOptions(intl: IntlShape): { label: string; value: number }[] {
  return [
    {
      label: intl.formatMessage({ id: "sunday", defaultMessage: "Sun" }),
      value: 7,
    },
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
  ];
}

function getByMonthOptions() {
  return Array.from<undefined, { label: number; value: number }>(
    { length: 31 },
    (_, idx) => ({
      label: idx + 1,
      value: idx + 1,
    }),
  );
}
