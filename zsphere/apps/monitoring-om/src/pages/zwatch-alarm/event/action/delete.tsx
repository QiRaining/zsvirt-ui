import { gql } from "@apollo/client";
import { useMetricNameConfig } from "@zstack/zsphere-components";
import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { ZWatchAlarmVO } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const unsubscribeEvent = gql`
  mutation unsubscribeEvent($input: UnsubscribeEventInput!) {
    unsubscribeEvent(input: $input) {
      actionId
    }
  }
`;

export default function Delete({
  visible,
  setVisible,
  selectedList,
}: IActionWrapperProps<ZWatchAlarmVO>) {
  const intl = useIntl();
  const doAction = useAction();
  const { translateEventName } = useMetricNameConfig();

  const onOk = () => {
    const payload = selectedList.map((item) => {
      return { uuid: item.uuid };
    });
    doAction({
      mutation: unsubscribeEvent,
      payload,
      name: intl.formatMessage({
        id: "delete.zwatchAlarm",
        defaultMessage: "Delete Alarm",
      }),
      total: selectedList.length,
      type: "ZWatchAlarmVO",
    });
  };

  return (
    <DialogP1
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "zwatchAlarm.modal.title.confirm.delete.zwatchAlarm",
        defaultMessage: "Delete Alarm?",
      })}
      resourceNames={selectedList.map((item) =>
        translateEventName(item?.namespace ?? "", item?.eventName ?? ""),
      )}
      onConfirm={onOk}
    />
  );
}
