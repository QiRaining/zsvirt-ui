import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  type SelectOptions,
} from "@zstack/design";
import { useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { AlarmHistories } from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useIntl } from "react-intl";

import { minuteList, hourList } from "./handle-message-btn";
import {
  createHandleAlarmMessageSchema,
  type HandleAlarmMessageFormValues,
} from "./schema";

const ackAlarmData = gql`
  mutation ackAlarmData($input: AckAlarmDataInput!) {
    ackAlarmData(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<AlarmHistories>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const defaultValues = useMemo<HandleAlarmMessageFormValues>(
    () => ({
      period: String(minuteList[0][1]),
      customTime: "",
      customTimeUnit: "60",
    }),
    [],
  );
  const formSchema = useMemo(
    () => createHandleAlarmMessageSchema(intl),
    [intl],
  );
  const form = useForm<HandleAlarmMessageFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const period = useWatch({
    control: form.control,
    name: "period",
  });

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const timeList = useMemo<SelectOptions[]>(
    () => [
      {
        value: "60",
        label: intl.formatMessage({ id: "minites", defaultMessage: "Minutes" }),
      },
      {
        value: String(60 * 60),
        label: intl.formatMessage({ id: "hours", defaultMessage: "hours" }),
      },
    ],
    [intl],
  );
  const periodOptions = useMemo<SelectOptions[]>(
    () => [
      ...minuteList.map(([minute, val]) => ({
        value: String(val),
        label: intl.formatMessage(
          {
            id: "silence.number.minites",
            defaultMessage: "Mute for {minite} minutes",
          },
          { minite: minute },
        ),
      })),
      ...hourList.map(([hour, val]) => ({
        value: String(val),
        label: intl.formatMessage(
          {
            id: "silence.number.hours",
            defaultMessage: "Mute for {hour} hours",
          },
          { hour },
        ),
      })),
      {
        value: "auto",
        label: intl.formatMessage({
          id: "custom",
          defaultMessage: "Custom",
        }),
      },
    ],
    [intl],
  );

  const onOk = async (input: HandleAlarmMessageFormValues) => {
    const { dataUuid, type, resourceUuid, alarmUuid, subscriptionUuid } =
      selectedList?.[0] ?? {};
    const { period, customTime, customTimeUnit } = input;

    const ackPeriodSec =
      period === "auto"
        ? parseInt(customTime, 10) * Number(customTimeUnit)
        : Number(period);

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
      onFinish: () => setSelectedList?.([]),
      total: 1,
    });

    setVisible(false);
  };

  return (
    <>
      <DialogForm
        onOk={onOk}
        form={dialogForm}
        setVisible={setVisible}
        visible={visible}
        onCancel={() => setVisible(false)}
        title={intl.formatMessage({
          id: "handle.alarmMessage",
          defaultMessage: "Set Silence Period",
        })}
        alertType="info"
        alertMessage={intl.formatMessage({
          id: "alarmMessage.modal.handleMessage.alert.info",
          defaultMessage:
            "If you specify a silence period, this alarm message will not be pushed to you in this period. If the resource is still in an alarm status, alarm messages will be pushed again.",
        })}
      >
        <Form {...form}>
          <FormField
            control={form.control}
            name="period"
            render={({ field }) => (
              <FormItem className="flex flex-row gap-2">
                <FormLabel required className="mt-[5px] flex">
                  {intl.formatMessage({
                    id: "set.silencePeriod",
                    defaultMessage: "Set Silence Period",
                  })}
                </FormLabel>
                <div className="flex flex-col">
                  <div className="inline-flex items-baseline">
                    <FormControl>
                      <Select
                        style={{ width: "160px", marginRight: "8px" }}
                        options={periodOptions}
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                    </FormControl>
                    {period === "auto" && (
                      <>
                        -
                        <FormField
                          control={form.control}
                          name="customTime"
                          render={({ field: customTimeField }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...customTimeField}
                                  style={{
                                    width: "80px",
                                    marginLeft: "8px",
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="customTimeUnit"
                          render={({ field: customTimeUnitField }) => (
                            <FormItem>
                              <FormControl>
                                <Select
                                  style={{
                                    width: "80px",
                                    marginLeft: "8px",
                                  }}
                                  options={timeList}
                                  value={customTimeUnitField.value}
                                  onValueChange={customTimeUnitField.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </Form>
      </DialogForm>
    </>
  );
};

export default Action;
