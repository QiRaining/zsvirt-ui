import { RadioGroup } from "@zstack/design";
import { Form, InputUnit } from "@zstack/zsphere-components";
import cls from "classnames";
import { useMemo } from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

type RadioGroupProps = React.ComponentProps<typeof RadioGroup>;

export interface IRetentionPolicy extends RadioGroupProps {
  retentionType: "local" | "remote";
  backupType: "vm" | "db";
}

export default function RetentionPolicy({
  retentionType,
  backupType,
  ...radioGroupProps
}: IRetentionPolicy) {
  const intl = useIntl();
  const { value } = radioGroupProps;

  const unitList = useMemo(() => {
    return [
      {
        value: "d",
        displayName: intl.formatMessage({
          id: "day",
          defaultMessage: "days",
        }),
      },
      {
        value: "w",
        displayName: intl.formatMessage({
          id: "week",
          defaultMessage: "weeks",
        }),
      },
      {
        value: "m",
        displayName: intl.formatMessage({
          id: "month",
          defaultMessage: "months",
        }),
      },
    ];
  }, [intl]);

  const byCountFields = {
    num1: (
      <div
        onClick={(e) => e.preventDefault()}
        style={{
          display: "inline-block",
          verticalAlign: "middle",
          margin: "2px 4px",
        }}
      >
        <Form.Item
          noStyle
          name={`${retentionType}IncCount`}
          normalize={(val) => (val?.number ? Math.floor(val.number) : 1)}
          getValueProps={(val) => ({ value: { number: val } })}
        >
          <InputUnit min={1} disabled={value !== "byCount"} />
        </Form.Item>
      </div>
    ),
    num2: (
      <div
        onClick={(e) => e.preventDefault()}
        style={{
          display: "inline-block",
          verticalAlign: "middle",
          margin: "2px 4px",
        }}
      >
        <Form.Item
          noStyle
          name={`${retentionType}FullCount`}
          normalize={(val) => (val?.number ? Math.floor(val.number) : 1)}
          getValueProps={(val) => ({ value: { number: val } })}
        >
          <InputUnit min={1} disabled={value !== "byCount"} />
        </Form.Item>
      </div>
    ),
  };

  return (
    <RadioGroup
      {...radioGroupProps}
      className={cls(style.retentionPolicy, radioGroupProps.className)}
      options={[
        ...(retentionType === "remote"
          ? [
              {
                value: "forever",
                label: intl.formatMessage({
                  id: "keep.forever",
                  defaultMessage: "Keep forever",
                }),
              },
            ]
          : []),
        {
          value: "byCount",
          label: (
            <>
              {backupType === "vm"
                ? intl.formatMessage(
                    {
                      id: "retention.policy.vm.byCount",
                      defaultMessage:
                        "Retain only the latest {num1} incremental backup data and {num2} full backup data.",
                    },
                    byCountFields,
                  )
                : intl.formatMessage(
                    {
                      id: "retention.policy.db.byCount",
                      defaultMessage: "Retain only the latest {num1} backup data.",
                    },
                    byCountFields,
                  )}
            </>
          ),
        },
        {
          value: "byTime",
          label: (
            <>
              {intl.formatMessage(
                {
                  id: "retention.policy.byTime",
                  defaultMessage: "Retain only the latest {num} backup data.",
                },
                {
                  num: (
                    <div
                      onClick={(e) => e.preventDefault()}
                      style={{
                        display: "inline-block",
                        verticalAlign: "middle",
                        margin: "2px 4px",
                      }}
                    >
                      <Form.Item
                        noStyle
                        name={`${retentionType}RetentionTime`}
                        normalize={(val) => ({
                          number: val?.number ? Math.floor(val.number) : 1,
                          unit: val?.unit ?? "day",
                        })}
                      >
                        <InputUnit
                          disabled={value !== "byTime"}
                          min={1}
                          unitList={unitList}
                        />
                      </Form.Item>
                    </div>
                  ),
                },
              )}
            </>
          ),
        },
      ]}
    />
  );
}
