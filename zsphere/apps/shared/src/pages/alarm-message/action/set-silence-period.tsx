import { gql } from "@apollo/client";
import { Input, Select } from "@zstack/design";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { AlarmHistories } from "@zstack/zsphere-types/graphql";
import React, { useState } from "react";
import { useIntl } from "react-intl";

const ackAlarmData = gql`
  mutation ackAlarmData($input: AckAlarmDataInput!) {
    ackAlarmData(input: $input) {
      actionId
    }
  }
`;

const { Item } = Form;

const ONE_MINUTE = 60;
const ONE_HOUR = 60 * ONE_MINUTE;

const UpdateModal: React.FC<IActionWrapperProps<AlarmHistories>> = ({
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();
  const [timeUnit, setTimeUnit] = useState(String(ONE_MINUTE));

  const timeOptions = [
    {
      value: String(ONE_MINUTE),
      label: intl.formatMessage({ id: "minites", defaultMessage: "Minutes" }),
    },
    {
      value: String(ONE_HOUR),
      label: intl.formatMessage({ id: "hours", defaultMessage: "hours" }),
    },
  ];

  const cantBeEmptyRule = {
    required: true,
    message: intl.formatMessage({
      id: "cant.be.empty",
      defaultMessage: "This field is required.",
    }),
  };
  const checknumberRule = {
    validator: (__: any, value: string) => checknumber(value),
  };
  const checknumber = (value: string) => {
    const num = Number(value);
    if (Number.isNaN(num)) {
      return Promise.reject(
        intl.formatMessage({
          id: "please.input.number",
          defaultMessage: "Enter a number.",
        }),
      );
    }
    if (!Number.isInteger(num)) {
      return Promise.reject(
        intl.formatMessage({
          id: "please.input.int.number",
          defaultMessage: "Enter an integer.",
        }),
      );
    }
    if (!(Number.isSafeInteger(Number(value)) && Number(value) >= 0)) {
      return Promise.reject(
        intl.formatMessage({
          id: "please.input.positive.int.number",
          defaultMessage: "Enter a positive integer.",
        }),
      );
    }
    return Promise.resolve();
  };

  const onOk = async (values: any) => {
    const { period_time } = values;
    const ackPeriodSec = parseInt(period_time, 10) * Number(timeUnit);

    const { dataUuid, type, resourceUuid, alarmUuid, subscriptionUuid } =
      selectedList?.[0] ?? {};

    doAction({
      mutation: ackAlarmData,
      payload: {
        dataUuid,
        type,
        resourceUuid,
        alarmUuid,
        subscriptionUuid,
        ackPeriodSec,
      },
      name: intl.formatMessage({
        id: "set.silencePeriod",
        defaultMessage: "Set Silence Period",
      }),
      total: 1,
    });
  };

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "set.silencePeriod",
        defaultMessage: "Set Silence Period",
      })}
      form={form}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      bodyClassName="!pb-4"
    >
      <Form form={form}>
        <Item
          label={intl.formatMessage({
            id: "silencePeriod",
            defaultMessage: "Muted for",
          })}
          required
        >
          <div style={{ display: "flex", gap: "8px" }}>
            <Item
              style={{ width: "160px", marginBottom: 0 }}
              name="period_time"
              validateFirst
              rules={[
                cantBeEmptyRule,
                checknumberRule,
                () => ({
                  validator(__: any, value: string) {
                    const num = (Number(value) * Number(timeUnit)) / 60;
                    const maxDateTime = 365 * 24 * 60;
                    if (num > maxDateTime) {
                      return Promise.reject(
                        intl.formatMessage({
                          id: "please.input.number.max",
                          defaultMessage: "The duration cannot be longer than 1 year.",
                        }),
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
              validateTrigger="onChange"
            >
              <Input />
            </Item>
            <div style={{ width: "90px" }}>
              <Select
                options={timeOptions}
                value={timeUnit}
                onValueChange={setTimeUnit}
              />
            </div>
          </div>
        </Item>
      </Form>
    </DialogForm>
  );
};

export default UpdateModal;
