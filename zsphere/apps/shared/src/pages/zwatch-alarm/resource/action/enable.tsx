import { gql } from "@apollo/client";
import { useMetricNameConfig } from "@zstack/zsphere-components";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { ZWatchAlarmVO } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const enableAlarms = gql`
  mutation enableAlarms($input: EnableZWatchAlarmInput!) {
    enableAlarms(input: $input) {
      actionId
    }
  }
`;

export default function Enable({
  visible,
  setVisible,
  selectedList,
}: IActionWrapperProps<ZWatchAlarmVO>) {
  const intl = useIntl();
  const doAction = useAction();
  const { translateAlarmNameByLocale } = useMetricNameConfig();

  const onOk = async () => {
    const payload = selectedList.map((item) => {
      return { uuid: item.uuid };
    });
    doAction({
      mutation: enableAlarms,
      payload,
      name: intl.formatMessage({
        id: "enable.zwatchAlarm",
        defaultMessage: "Enable Alarm",
      }),
      total: selectedList.length,
      type: "ZWatchAlarmVO",
    });
  };

  return (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "zwatchAlarm.modal.title.confirm.enable.zwatchAlarm",
        defaultMessage: "Enable Alarm?",
      })}
      resourceNames={selectedList.map(({ name, zhName }) =>
        translateAlarmNameByLocale(name, zhName),
      )}
      onConfirm={onOk}
    />
  );
}
