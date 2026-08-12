import { gql } from "@apollo/client";
import { useMetricNameConfig } from "@zstack/zsphere-components";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { ZWatchAlarmVO } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const disableAlarms = gql`
  mutation disableAlarms($input: DisableZWatchAlarmInput!) {
    disableAlarms(input: $input) {
      actionId
    }
  }
`;

export default function Disable({
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
      mutation: disableAlarms,
      payload,
      name: intl.formatMessage({
        id: "disable.zwatchAlarm",
        defaultMessage: "Disable Alarm",
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
        id: "zwatchAlarm.modal.title.confirm.disable.zwatchAlarm",
        defaultMessage: "Disable Alarm?",
      })}
      resourceNames={selectedList.map(({ name, zhName }) =>
        translateAlarmNameByLocale(name, zhName),
      )}
      onConfirm={onOk}
    />
  );
}
