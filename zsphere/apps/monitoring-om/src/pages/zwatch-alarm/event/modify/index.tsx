import { gql } from "@apollo/client";
import { Form, useMetricNameConfig } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  ZWatchAlarmVO,
  SubscribeEventPayload as ISubscribeEventPayload,
  BasicEndPoint as IBasicEndPoint,
} from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import React, { useCallback } from "react";
import { useIntl } from "react-intl";

import EVENTS_JSON from "../constant/Events.json";
import type { initialValuesByBasicConfig } from "./basic-config";
import BasicConfig from "./basic-config";

export interface IFormData {
  baseConfig?: typeof initialValuesByBasicConfig;
}
const EVENTS: any = EVENTS_JSON;

const Action: FC<IActionWrapperProps<ZWatchAlarmVO>> = ({
  visible,
  setVisible,
  source,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();
  const { translateEventName } = useMetricNameConfig();

  interface LabelItem {
    key: string;
    op: string;
    value: string;
  }
  const title = intl.formatMessage({
    id: "modify.config",
    defaultMessage: "Modify Configuration",
  });

  const subscribeEvent = gql`
    mutation subscribeEvent($input: SubscribeEventInput!) {
      subscribeEvent(input: $input) {
        actionId
      }
    }
  `;

  const updateSubscribeEvent = gql`
    mutation updateSubscribeEvent($input: UpdateSubscribeEventInput!) {
      updateSubscribeEvent(input: $input) {
        actionId
      }
    }
  `;

  const onOk = useCallback(
    async (formData: any) => {
      try {
        const { labels, actions, namespace, eventName, ...params } = formData;
        const _labels: Array<LabelItem> = labels
          ? Object.keys(labels)?.map((label) => {
              return {
                key: label,
                op: "Equal",
                value: labels[label],
              };
            })
          : [];
        const _actions: Array<any> = actions
          ?.map((action: IBasicEndPoint) => action?.topic?.uuid)
          ?.map((uuid: string) => {
            return {
              actionType: "sns",
              actionUuid: uuid,
            };
          });
        params.actions = _actions;
        params.labels = _labels;
        params.eventName = eventName;
        params.namespace = EVENTS[namespace]?.[eventName]?.namespace; // 针对 FaultMountPointOnHost 这种特殊条目特殊处理

        delete params.targetHost;
        const payload: ISubscribeEventPayload = params;
        if (selectedList?.[0]?.uuid) {
          doAction({
            mutation: updateSubscribeEvent,
            payload: {
              uuid: selectedList?.[0]?.uuid,
              emergencyLevel: params?.emergencyLevel,
            },
            name: intl.formatMessage({
              id: "change.alarmLevel",
              defaultMessage: "Change Severity",
            }),
            total: 1,
            type: "ZWatchAlarmVO",
          });
          return;
        }
        doAction({
          mutation: subscribeEvent,
          payload,
          name: intl.formatMessage({
            id: "create.eventZwatchAlarm",
            defaultMessage: "New Event Alarm",
          }),
          total: 1,
          type: "ZWatchAlarmVO",
        });
      } catch {
        // ignore
      }
    },
    [doAction, intl, subscribeEvent],
  );

  return (
    <DialogForm
      form={form}
      title={title}
      visible={visible}
      setVisible={setVisible}
      widthClassName="w-150"
      onOk={onOk}
      onCancel={() => setVisible(false)}
      resourceName={translateEventName(
        selectedList?.[0]?.namespace,
        selectedList?.[0]?.eventName ?? "",
      )}
    >
      <Form form={form}>
        <BasicConfig init={selectedList?.[0] as any} form={form} />
      </Form>
    </DialogForm>
  );
};
export default Action;
